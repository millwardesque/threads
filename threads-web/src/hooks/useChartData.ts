import { useMemo } from 'react';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { LineDefinition, ThreadMap, VersionedLines } from '../types';
import { Color } from '../models/ColorProvider';
import { smoothLine } from '../models/Smoother';
import useColorProvider from './useColorProvider';
import { aggregateLine, getAggregationUnitsOverride } from '../models/Aggregation';

const moment = extendMoment(Moment);

const DATE_FORMAT = 'YYYY-MM-DD';

interface ChartAxes {
    [id: string]: {};
}

type DatesAxis = string[];

interface ChartLineDataset {
    label: string;
    data: number[];
    color: Color;
    yAxisID: string;
}

interface ChartDataset {
    dates: DatesAxis;
    yAxes: ChartAxes;
    lineData: ChartLineDataset[];
}

const getDateRangeFromLines = (lines: LineDefinition[]): string[] => {
    let minDate: string | undefined = undefined,
        maxDate: string | undefined = undefined;

    lines.forEach((l) => {
        const lineDates = Object.keys(l.data ?? {});
        lineDates.forEach((d) => {
            if (!minDate || d < minDate) {
                minDate = d;
            }
            if (!maxDate || d > maxDate) {
                maxDate = d;
            }
        });
    });

    const momentRange = moment.range(moment(minDate, DATE_FORMAT), moment(maxDate, DATE_FORMAT));
    const stringRange = Array.from(momentRange.by('days')).map((d) => d.format(DATE_FORMAT));
    return stringRange;
};

const makeAxis = (id: string, showAxis: boolean, drawGrid: boolean, units: string) => {
    return {
        id,
        type: 'linear',
        beginAtZero: true,
        position: units === '%' ? 'right' : 'left',
        ticks: {
            callback: function (value: string) {
                if (!showAxis) {
                    return '';
                }
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
            const axisId = `y#${threadId}#${units}`;
            const isExploded = threadLines.lines.length > 1;

            const createAxis = !(units in shownAxes);
            if (createAxis) {
                const isFirstAxis = Object.keys(axes).length === 0;
                axes[axisId] = makeAxis(axisId, true, isFirstAxis, units);
                shownAxes[units] = axisId;
            }
            console.log('[CPM] Thread units', units, shownAxes, axes); // @DEBUG

            threadLines.lines.forEach((line, index) => {
                const subIndex = isExploded ? `.${index + 1}` : '';
                const label = `${threadIndex + 1}${subIndex}. ${line.label || thread.getLabel()}`;
                const aggregatedData = aggregateLine(thread.aggregation, line.data, chartData.dates);
                const smoothedData = smoothLine(thread.smoothing, aggregatedData.line, chartData.dates);
                const units = aggregatedData.unitsOverride ?? thread.getUnits();
                const lineData: number[] = chartData.dates.map((d) => smoothedData[d]);
                const colorIndex = isExploded ? threadColourOffset + explodedLinesProcessed : threadsProcessed;
                const color = colors.atIndex(colorIndex);

                console.log('[CPM] Line units', units, shownAxes[units]); // @DEBUG

                const dataset = {
                    label,
                    data: lineData,
                    color,
                    yAxisID: shownAxes[units],
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
    }, [lineSignature, threadSignature, colors]);

    return chartData;
};
