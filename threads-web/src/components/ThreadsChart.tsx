import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Throbber } from './molecules/Throbber';
import { LineDefinition, VersionedLines } from '../types';
import useColorProvider from '../hooks/useColorProvider';
import { useAppSelector } from '../redux/hooks';
import { selectAllThreads } from '../redux/threadsSlice';
import { smoothLine } from '../models/Smoother';
import { Button } from './molecules/Button';
import { Color } from '../models/ColorProvider';

Chart.register(zoomPlugin);

const moment = extendMoment(Moment);

const DATE_FORMAT = 'YYYY-MM-DD';

interface ThreadsChartProps {
    id: string;
    lines: VersionedLines[];
}

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
export const ThreadsChart: React.FC<ThreadsChartProps> = ({ id, lines }) => {
    const resetZoom = () => {
        if (chartInstance) {
            console.log('RESETTING');
            chartInstance.current.resetZoom();
        }
    };

    const colors = useColorProvider();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const threads = useAppSelector(selectAllThreads);
    const [isRebuildingCanvas, setIsRebuildingCanvas] = useState(false);
    const chartInstance = useRef<Chart>(undefined);

    // These are hacks to get around useEffect's lack of a deep-compare for objects and arrays
    const lineSignature = JSON.stringify(lines);

    useEffect(() => {
        setIsRebuildingCanvas(true);
    }, []);

    useEffect(() => {
        if (isRebuildingCanvas) {
            setIsRebuildingCanvas(false);
        }
    }, [isRebuildingCanvas]);

    useEffect(() => {
        console.log('Resetting canvas');
        const chartCanvas = canvasRef.current;
        if (isRebuildingCanvas || chartCanvas === null) {
            return;
        }

        chartInstance.current = new Chart(canvasRef.current, {
            type: 'line',
            data: {},
            options: {},
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = undefined;
            }
        };
    }, [isRebuildingCanvas]);

    const chartData = useMemo<ChartDataset>(() => {
        console.log('Recreating data');
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
    }, [lineSignature, colors, threads]);

    useEffect(() => {
        console.log('Updating chart');
        if (!chartInstance.current) {
            return;
        }

        const datasets = chartData.lineData.map((line) => ({
            label: line.label,
            data: line.data,
            fill: false,
            borderColor: line.color.dark,
            borderWidth: 2,
            backgroundColor: line.color.light,
            pointBackgroundColor: 'rgba(0, 0, 0, 0)',
            pointBorderColor: line.color.dark,
            pointHoverBackgroundColor: line.color.light,
            pointHoverBorderColor: line.color.dark,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 1,
            spanGaps: false,
            yAxisID: line.yAxisID,
        }));

        const data = {
            labels: chartData.dates,
            datasets: datasets,
        };

        const options = {
            animation: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: datasets.length > 0,
                    position: 'right',
                },
                zoom: {
                    zoom: {
                        drag: {
                            enabled: true,
                            threshold: 50,
                            mode: 'xy ',
                        },
                    },
                    pan: {
                        enabled: true,
                        modifierKey: 'alt',
                        mode: 'xy',
                    },
                },
            },
            responsive: true,
            scales: chartData.yAxes,
        };

        chartInstance.current.data = data;
        chartInstance.current.options = options;
        chartInstance.current.update();
    }, [chartData.dates, chartData.lineData, chartData.yAxes]);

    return (
        <div className="flex flex-col h-full">
            {!isRebuildingCanvas && (
                <>
                    <div className="flex justify-end pr-2">
                        <Button label="Reset zoom" onClick={resetZoom} />
                    </div>
                    <div className="flex h-full">
                        <canvas id={id} ref={canvasRef} />
                    </div>
                </>
            )}
            {isRebuildingCanvas && <Throbber />}
        </div>
    );
};
