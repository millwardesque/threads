import { useMemo } from 'react';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { LineDefinition, ThreadMap, VersionedLines } from '../types';
import { Color } from '../models/ColorProvider';
import { smoothLine } from '../models/Smoother';
import useColorProvider from './useColorProvider';

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
            const axisId = `y-${threadId}`;
            const units = thread.getUnits();
            const isExploded = threadLines.lines.length > 1;

            const createAxis = !(units in shownAxes);
            if (createAxis) {
                const isFirstAxis = Object.keys(axes).length === 0;
                axes[axisId] = makeAxis(axisId, true, isFirstAxis, units);
                shownAxes[units] = axisId;
            }

            threadLines.lines.forEach((line, index) => {
                const subIndex = isExploded ? `.${index + 1}` : '';
                const label = `${threadIndex + 1}${subIndex}. ${line.label || thread.getLabel()}`;
                const units = thread.getUnits();
                const smoothedData = smoothLine(thread.smoothing, line.data, chartData.dates);
                const lineData: number[] = chartData.dates.map((d) => smoothedData[d]);
                const colorIndex = isExploded ? threadColourOffset + explodedLinesProcessed : threadsProcessed;
                const color = colors.atIndex(colorIndex);

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
        return chartData;
    }, [lineSignature, threadSignature, colors]);

    return chartData;
};
