import React from 'react';
import { DataPlotDefinition } from '../models/DataSourceDefinition';
import { SimpleThread } from '../models/Thread';
import { Select } from './molecules/Select';

interface PlotSelectProps {
    thread: SimpleThread;
    onPlotChange?: (plot: DataPlotDefinition) => void;
}

export const PlotSelect: React.FC<PlotSelectProps> = ({ thread, onPlotChange }) => {
    const handleChange = (selected: string) => {
        const selectedPlot = thread.source.plots[selected];
        if (onPlotChange) {
            onPlotChange(selectedPlot);
        }
    };

    const plotOptions = Object.values(thread.source.plots).map((p) => {
        return { label: p.label, value: p.id };
    });

    return (
        <Select
            id="plotSelector"
            label="Plot"
            options={plotOptions}
            selected={thread.plot!.id}
            onChange={handleChange}
        ></Select>
    );
};
