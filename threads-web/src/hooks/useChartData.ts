import { string } from 'mathjs';
import { useMemo } from 'react';

import { aggregateLine, getAggregationUnitsOverride } from '../models/Aggregation';
import { Color } from '../models/ColorProvider';
import { smoothLine } from '../models/Smoother';
import { SimpleThread } from '../models/Thread';
import { DateRangeOption, LineDefinition, ThreadMap, VersionedLines } from '../types';
import { getDateRangeFromDateRangeOption, getDateRangeFromLines } from '../utils';
import useColorProvider from './useColorProvider';

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
    fill: boolean;
}

interface ChartDataset {
    dates: DatesAxis;
    yAxes: ChartAxes;
    lineData: ChartLineDataset[];
}

type AxisSide = 'right' | 'left';

const makeAxis = (id: string, drawGrid: boolean, units: string, position: AxisSide, isStacked: boolean) => {
    return {
        id,
        stacked: isStacked,
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

export const useChartData = (threads: ThreadMap, lines: VersionedLines[], dateRange: DateRangeOption): ChartDataset => {
    const colors = useColorProvider();
    const lineSignature = JSON.stringify(lines);
    const threadSignature = JSON.stringify(threads);
    const [minDate, maxDate] = getDateRangeFromDateRangeOption(dateRange);

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
        chartData.dates = getDateRangeFromLines(linesAsArray, minDate, maxDate);

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

            // @TODO Allow thread config overrides

            const threadId = threadLines.lines[0].threadId;
            const thread = threads[threadId];
            const isStacked100 = thread instanceof SimpleThread && thread.exploderType === 'stacked-100';
            const isStacked =
                thread instanceof SimpleThread && (thread.exploderType === 'stacked' || isStacked100) ? true : false;
            const units = isStacked100 ? '%' : getAggregationUnitsOverride(thread.aggregation) ?? thread.getUnits();
            const axisPosition: AxisSide = units === '%' ? 'right' : 'left';
            const axisKey = `${axisPosition}##${units}##${thread instanceof SimpleThread ? thread.exploderType : ''}`;
            const axisId = `y#${threadId}#${axisKey}`;
            const isExploded = threadLines.lines.length > 1;

            const createAxis = !(axisKey in shownAxes);
            if (createAxis) {
                const isFirstAxis = Object.keys(axes).length === 0;
                axes[axisId] = makeAxis(axisId, isFirstAxis, units, axisPosition, isStacked);
                shownAxes[axisKey] = axisId;
            }

            // Reprocess the lines that are part of a stacked-100% config so that values are normalized
            let processedLines = threadLines.lines;
            if (isStacked100) {
                const totalsPerDate: Record<string, number> = {};
                chartData.dates.forEach((d) => {
                    totalsPerDate[d] = threadLines.lines.reduce((sum, current) => {
                        return sum + (current.data[d] ?? 0);
                    }, 0);
                });

                processedLines = threadLines.lines.map((threadLine) => {
                    const normalizedData = Object.keys(threadLine.data).reduce<Record<string, number>>(
                        (normalized, currentDate) => {
                            normalized[currentDate] =
                                (100.0 * threadLine.data[currentDate]) / totalsPerDate[currentDate];
                            return normalized;
                        },
                        {}
                    );
                    return {
                        ...threadLine,
                        data: normalizedData,
                    };
                });
            }

            processedLines.forEach((line, index) => {
                const subIndex = isExploded ? `.${index + 1}` : '';
                const label = `${threadIndex + 1}${subIndex}. ${line.label || thread.getLabel()}`;
                const aggregatedData = aggregateLine(thread.aggregation, line.data, chartData.dates);
                const smoothedData = smoothLine(thread.smoothing, aggregatedData.line, chartData.dates);
                const units = aggregatedData.unitsOverride ?? thread.getUnits();
                const lineData: number[] = chartData.dates.map((d) => smoothedData[d]);
                const colorIndex = isExploded ? threadColourOffset + explodedLinesProcessed : threadsProcessed;
                const color = colors.atIndex(colorIndex);
                const lineAxisKey = `${axisPosition}##${units}##${
                    thread instanceof SimpleThread ? thread.exploderType : ''
                }`;
                const axisToUse = shownAxes[lineAxisKey];
                const borderDash = thread.type === 'calculated' ? [5, 3] : [];

                const dataset = {
                    label,
                    data: lineData,
                    borderDash,
                    color,
                    fill: isStacked,
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
        return chartData;
    }, [lineSignature, threadSignature, colors, minDate, maxDate]);

    return chartData;
};
