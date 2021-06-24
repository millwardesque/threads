import React from 'react';
import { DataDimensionDefinition } from '../models/DataSourceDefinition';

import { MultiSelect } from './MultiSelect';

interface FilterSelectProps {
    dimension: DataDimensionDefinition;
    values: string[];
    selected: string[];
    onFilterChange?: (dimension: string, selected: string[]) => void;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ dimension, values, selected, onFilterChange }) => {
    const onChange = (newSelection: string[]) => {
        console.log(`Filter ${dimension.id} changed. New selection: ${newSelection.join(', ')}`);

        if (onFilterChange) {
            onFilterChange(dimension.id, newSelection);
        }
    };

    const options = values.map((v) => {
        return { label: v, value: v };
    });

    return (
        <MultiSelect label={dimension.label} selected={selected} options={options} onChange={onChange}></MultiSelect>
    );
};
