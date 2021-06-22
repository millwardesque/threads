import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {LineDefinition} from '../models/DataSourceDefinition';
import ColorProvider from '../models/ColorProvider';

interface ThreadsChartProps {
    id: string,
    lines: LineDefinition[]
};

interface ChartAxes {
    [id: string]: {},
};

const makeAxis = (showAxis: boolean, drawGrid: boolean, units: string) => {
    return {
        beginAtZero: true,
        position: units === '%' ? 'right' : 'left',
        ticks: {
            callback: function(value: string) {
                if (!showAxis) {
                    return '';
                }

                switch (units) {
                    case '$':
                        return units + value;
                    case '%':
                    default:
                        return value + units;
                };
            },
        },
        grid: {
            drawOnChartArea: drawGrid,
        },
    };
}
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
        const colors = new ColorProvider();
        let lineUnits: string = '';
        let axes: ChartAxes = {};

        // First pass: Collect, merge, and sort all the dates from all the lines to get the true date range.
        const dateSet = new Set<string>();
        for (let line of lines) {
            const lineDates = Object.keys(line?.data ?? {});
            lineDates.forEach(item => dateSet.add(item));
        }
        const dates: string[] = Array.from(dateSet).sort();

        // Second pass, create datasets based on available date range
        const datasets = [];
        for (let index in lines) {
            const line = lines[index];
            const axisId = `y${index}`;
            const lineLabel = line.plot.label;
            const lineData: number[] = dates.map(d => line.data[d]);
            const color = colors.next();
            axes[axisId] = makeAxis(lineData.length > 0, index === '0', line.plot.units);

            datasets.push(
                {
                    label: lineLabel,
                    data: lineData,
                    fill: false,
                    borderColor: color.dark,
                    yAxisID: axisId,
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
            scales: axes,
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