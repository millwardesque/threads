import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { LineDefinition, VersionedLines } from '../types';
import useColorProvider from '../hooks/useColorProvider';
import { useAppSelector } from '../redux/hooks';
import { selectAllThreads } from '../redux/threadsSlice';

interface ThreadsChartProps {
    id: string;
    lines: VersionedLines[];
}

interface ChartAxes {
    [id: string]: {};
}

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
    const colors = useColorProvider();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const threads = useAppSelector(selectAllThreads);
    const [isRebuildingCanvas, setIsRebuildingCanvas] = useState(false);

    useEffect(() => {
        setIsRebuildingCanvas(true);
    }, [lines]);

    useEffect(() => {
        if (isRebuildingCanvas) {
            setIsRebuildingCanvas(false);
        }
    }, [isRebuildingCanvas]);

    useEffect(() => {
        let axes: ChartAxes = {};
        let linesAsArray: LineDefinition[] = [];
        lines.forEach((threadLines) => {
            linesAsArray = linesAsArray.concat(threadLines.lines);
        });

        // First pass: Collect, merge, and sort all the dates from all the lines to get the true date range.
        const dateSet = new Set<string>();
        for (let line of linesAsArray) {
            const lineDates = Object.keys(line?.data ?? {});
            lineDates.forEach((item) => dateSet.add(item));
        }
        const dates: string[] = Array.from(dateSet).sort();

        // Second pass, create datasets based on available date range
        const datasets: Array<any> = [];
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
            const units = thread.plot.units;
            const isExploded = threadLines.lines.length > 1;

            const createAxis = !(units in shownAxes);
            if (createAxis) {
                const isFirstAxis = Object.keys(axes).length === 0;
                axes[axisId] = makeAxis(axisId, true, isFirstAxis, units);
                shownAxes[units] = axisId;
            }

            threadLines.lines.forEach((line, index) => {
                const subIndex = isExploded ? `.${index + 1}` : '';
                const label = `${threadIndex + 1}${subIndex}. ${line.label || thread.label || thread.plot.label}`;
                const units = thread.plot.units;
                const lineData: number[] = dates.map((d) => line.data[d]);
                const colorIndex = isExploded ? threadColourOffset + explodedLinesProcessed : threadsProcessed;
                const color = colors.atIndex(colorIndex);

                const dataset = {
                    label,
                    data: lineData,
                    fill: false,
                    borderColor: color.dark,
                    borderWidth: 2,
                    backgroundColor: color.light,
                    pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                    pointBorderColor: 'rgba(0, 0, 0, 0)',
                    pointHoverBackgroundColor: color.light,
                    pointHoverBorderColor: color.dark,
                    pointRadius: 5,
                    pointHoverBorderWidth: 1,
                    yAxisID: shownAxes[units],
                };

                datasets.push(dataset);

                if (isExploded) {
                    explodedLinesProcessed += 1;
                }
            });

            threadsProcessed += 1;
        });

        const data = {
            labels: dates,
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
            },
            responsive: true,
            scales: axes,
        };

        const chartCanvas = canvasRef.current;
        if (isRebuildingCanvas || chartCanvas === null) {
            return;
        }

        const chartInstance = new Chart(canvasRef.current, {
            type: 'line',
            data,
            options,
        });

        return () => {
            chartInstance.destroy();
        };
    }, [lines, threads, isRebuildingCanvas, colors]);

    return <>{isRebuildingCanvas ? undefined : <canvas id={id} ref={canvasRef} />}</>;
};
