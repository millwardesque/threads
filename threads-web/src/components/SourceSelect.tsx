import React from 'react';

import { DataSourceMap, DataSourceDefinition } from '../models/DataSourceDefinition';
import { Select } from './molecules/Select';

interface SourceSelectProps {
    sources: DataSourceMap;
    selectedSource: DataSourceDefinition;
    onSourceChange?: (newSource: DataSourceDefinition) => void;
}

export const SourceSelect: React.FC<SourceSelectProps> = ({ sources, selectedSource, onSourceChange }) => {
    const handleChange = (selected: string) => {
        console.log('Source change requested', selected);

        const selectedSource = selected in sources ? sources[selected] : undefined;
        if (selectedSource && onSourceChange) {
            onSourceChange(selectedSource);
        }
    };

    const sourceOptions = Object.values(sources).map((s) => {
        return { label: s.label, value: s.id };
    });

    return (
        <Select
            id="sourceSelector"
            label="Source"
            options={sourceOptions}
            selected={selectedSource.id}
            onChange={handleChange}
        ></Select>
    );
};
