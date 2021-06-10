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
        const dates = lines.length ? Object.keys(lines[0].data) : [];
        const lineData = lines.length ? Object.values(lines[0].data) : [];
        const lineUnits = lines.length ? lines[0].plot.units : '';
        const lineLabel = lines.length ? lines[0].plot.label : '';

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
                    position: 'right'
                },
            },
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value: string) {
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