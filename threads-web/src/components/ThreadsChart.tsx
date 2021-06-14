import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {LineDefinition} from '../models/DataSourceDefinition';

interface ThreadsChartProps {
    id: string,
    lines: LineDefinition[]
};

export const ThreadsChart: React.FC<ThreadsChartProps> = ({ id, lines }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
        let lineUnits: string = '';

        // First pass: Collect, merge, and sort all the dates from all the lines to get the true date range.
        const dateSet = new Set<string>();
        for (let line of lines) {
            const lineDates = Object.keys(line?.data ?? {});
            lineDates.forEach(item => dateSet.add(item));
        }
        const dates: string[] = Array.from(dateSet).sort();

        // Second pass, create datasets based on available date range
        const datasets = [];
        for (let line of lines) {
            const lineLabel = line.plot.label;
            const lineData: number[] = dates.map(d => line.data[d]);
            datasets.push(
                {
                    label: lineLabel,
                    data: lineData,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                },
            );

            if (!lineUnits) {
                lineUnits = line.plot.units;
            }
        }

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
                    position: 'right'
                },
            },
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value: string) {
                            if (datasets.length === 0) {
                                return '';
                            }

                            switch (lineUnits) {
                                case '$':
                                    return lineUnits + value;
                                case '%':
                                default:
                                    return value + lineUnits;
                            }
                        }
                    },
                },
            },
        };

        const chartCanvas = canvasRef.current;
        if (isRebuildingCanvas || chartCanvas === null) {
            return;
        }

        const chartInstance = new Chart(canvasRef.current, {
            'type': 'line',
            data,
            options
        });

        return () => {
            chartInstance.destroy();
        }
    }, [lines, isRebuildingCanvas]);

    return (
        <>
            {isRebuildingCanvas ? undefined : (<canvas id={id} ref={canvasRef} />)}
        </>
    );
};