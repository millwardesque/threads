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
        const lineToRender = lines.length ? lines[0] : undefined;
        const dates = Object.keys(lineToRender?.data ?? {}).sort();
        const lineData: number[] = lineToRender ? dates.map(d => lineToRender.data[d]) : [];
        const lineUnits = lineToRender ? lineToRender.plot.units : '';
        const lineLabel = lineToRender ? lineToRender.plot.label : '';

        const data = {
            labels: dates,
            datasets: [
                {
                    label: lineLabel,
                    data: lineData,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                },
            ],
        };

        const options = {
            animation: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: lineData.length > 0,
                    position: 'right'
                },
            },
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value: string) {
                            if (lineData.length === 0) {
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