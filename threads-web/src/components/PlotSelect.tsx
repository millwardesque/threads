import React from 'react';
import { DataPlotDefinition } from '../models/DataSourceDefinition';
import { Thread } from '../types';
import { Select } from './Select';

interface PlotSelectProps {
    thread: Thread,
    onPlotChange?: (plot: DataPlotDefinition) => void,
};

export const PlotSelect: React.FC<PlotSelectProps> = ({thread, onPlotChange}) => {
    const handleChange = (selected: string) => {
        console.log("Plot change requested", selected);

        const selectedPlot = thread.source.plots[selected];
        if (onPlotChange) {
            onPlotChange(selectedPlot);
        }
    };

    const plotOptions = Object.values(thread.source.plots)
        .map(p => {
            return { label: p.label, value: p.id }
        });

    return <Select id="plotSelector" label="Plot" options={plotOptions} selected={thread.plot!.id} onChange={handleChange}></Select>;
};