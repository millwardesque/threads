import { useMemo } from 'react';

import { LineDefinition, ThreadMap, VersionedLines } from '../types';
import { Color } from '../models/ColorProvider';
import { smoothLine } from '../models/Smoother';
import useColorProvider from './useColorProvider';
import { aggregateLine, getAggregationUnitsOverride } from '../models/Aggregation';
import { getDateRangeFromLines } from '../utils';

interface ChartAxes {
    [id: string]: {};
}

type DatesAxis = string[];

interface ChartLineDataset {
    label: string;
    data: number[];
    borderDash: number[];
    color: Color;
    yAxisID: string;
}

interface ChartDataset {
    dates: DatesAxis;
    yAxes: ChartAxes;
    lineData: ChartLineDataset[];
}

type AxisSide = 'right' | 'left';

const makeAxis = (id: string, drawGrid: boolean, units: string, position: AxisSide) => {
    return {
        id,
        type: 'linear',
        beginAtZero: true,
        position,
        ticks: {
            callback: function (value: string) {
                switch (units) {
                    case '$':
                        return units + value.toLocaleString();
                    case '%':
                    default:
                        return value.toLocaleString() + units;
                }
            },
        },
        grid: {
            drawOnChartArea: drawGrid,
        },
    };
};

export const useChartData = (threads: ThreadMap, lines: VersionedLines[]): ChartDataset => {
    const colors = useColorProvider();
    const lineSignature = JSON.stringify(lines);
    const threadSignature = JSON.stringify(threads);

    const chartData = useMemo<ChartDataset>(() => {
        const chartData: ChartDataset = {
            dates: [],
            yAxes: {},
            lineData: [],
        };

        // First pass: Collect dates
        let axes: ChartAxes = {};
        let linesAsArray: LineDefinition[] = [];
        lines.forEach((threadLines) => {
            linesAsArray = linesAsArray.concat(threadLines.lines);
        });
        chartData.dates = getDateRangeFromLines(linesAsArray);

        // Second pass: Create datasets based on available date range
        const shownAxes: {
            [units: string]: string;
        } = {};
        const threadColourOffset = Object.keys(threads).length;

        let threadsProcessed = 0;
        let explodedLinesProcessed = 0;
        lines.forEach((threadLines, threadIndex) => {
            if (threadLines.lines.length === 0) {
                return;
            }

            const threadId = threadLines.lines[0].threadId;
            const thread = threads[threadId];
            const units = getAggregationUnitsOverride(thread.aggregation) ?? thread.getUnits();
            const axisPosition: AxisSide = thread.type === 'calculated' || units === '%' ? 'right' : 'left';
            const axisKey = `${axisPosition}##${units}`;
            const axisId = `y#${threadId}#${axisKey}`;
            const isExploded = threadLines.lines.length > 1;

            const createAxis = !(axisKey in shownAxes);
            if (createAxis) {
                const isFirstAxis = Object.keys(axes).length === 0;
                axes[axisId] = makeAxis(axisId, isFirstAxis, units, axisPosition);
                shownAxes[axisKey] = axisId;
            }

            threadLines.lines.forEach((line, index) => {
                const subIndex = isExploded ? `.${index + 1}` : '';
                const label = `${threadIndex + 1}${subIndex}. ${line.label || thread.getLabel()}`;
                const aggregatedData = aggregateLine(thread.aggregation, line.data, chartData.dates);
                const smoothedData = smoothLine(thread.smoothing, aggregatedData.line, chartData.dates);
                const units = aggregatedData.unitsOverride ?? thread.getUnits();
                const lineData: number[] = chartData.dates.map((d) => smoothedData[d]);
                const colorIndex = isExploded ? threadColourOffset + explodedLinesProcessed : threadsProcessed;
                const color = colors.atIndex(colorIndex);
                const lineAxisKey = `${axisPosition}##${units}`;
                const axisToUse = shownAxes[lineAxisKey];
                const borderDash = thread.type === 'calculated' ? [5, 3] : [];

                const dataset = {
                    label,
                    data: lineData,
                    borderDash,
                    color,
                    yAxisID: axisToUse,
                };

                chartData.lineData.push(dataset);

                if (isExploded) {
                    explodedLinesProcessed += 1;
                }
            });

            threadsProcessed += 1;
        });

        chartData.yAxes = axes;
        console.log('[CPM] chart data', chartData); // @DEBUG
        return chartData;
    }, [lineSignature, threadSignature, colors]);

    return chartData;
};
