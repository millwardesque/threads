import React, { useCallback, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

import { useChartData } from '../hooks/useChartData';
import { useAppSelector } from '../redux/hooks';
import { selectAllThreads } from '../redux/threadsSlice';
import { DateRangeOption, VersionedLines } from '../types';
import { Button } from './molecules/Button';
import { Throbber } from './molecules/Throbber';
import { DateSelector } from './DateSelector';

Chart.register(zoomPlugin);

interface ThreadsChartProps {
    id: string;
    lines: VersionedLines[];
}

export const ThreadsChart: React.FC<ThreadsChartProps> = ({ id, lines }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('trailing-3-months');
    const threads = useAppSelector(selectAllThreads);
    const [isRebuildingCanvas, setIsRebuildingCanvas] = useState(false);
    const chartInstance = useRef<Chart>(undefined);
    const chartData = useChartData(threads, lines, selectedDateRange);

    const resetZoom = useCallback(() => {
        if (chartInstance) {
            chartInstance.current.resetZoom();
        }
    }, []);

    // These are hacks to get around useEffect's lack of a deep-compare for objects and arrays

    useEffect(() => {
        setIsRebuildingCanvas(true);
    }, []);

    useEffect(() => {
        if (isRebuildingCanvas) {
            setIsRebuildingCanvas(false);
        }
    }, [isRebuildingCanvas]);

    useEffect(() => {
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

    useEffect(() => {
        if (!chartInstance.current) {
            return;
        }

        const datasets = chartData.lineData.map((line) => ({
            label: line.label,
            data: line.data,
            fill: line.fill,
            borderColor: line.color.dark,
            borderDash: line.borderDash,
            borderWidth: 2,
            backgroundColor: line.color.light,
            pointBackgroundColor: 'rgba(0, 0, 0, 0)',
            pointBorderColor: line.color.dark,
            pointHoverBackgroundColor: line.color.light,
            pointHoverBorderColor: line.color.dark,
            pointRadius: 1,
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
    }, [chartInstance.current, chartData]);

    return (
        <div className="flex flex-col h-full">
            {!isRebuildingCanvas && (
                <>
                    <div className="flex justify-end pr-2">
                        <div className="mr-2">
                            <DateSelector selectedDateRange={selectedDateRange} onChange={setSelectedDateRange} />
                        </div>
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
