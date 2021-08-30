import React from 'react';
import { DataDimensionDefinition } from '../models/DataSourceDefinition';

import { MultiSelect } from './molecules/MultiSelect';

interface FilterSelectProps {
    dimension: DataDimensionDefinition;
    values: string[];
    selected: string[];
    onFilterChange?: (dimension: string, selected: string[]) => void;
    onExploderChange?: (dimension: string) => void;
    isActiveExploder: boolean;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    dimension,
    values,
    selected,
    onFilterChange,
    onExploderChange,
    isActiveExploder,
}) => {
    const onChange = (newSelection: string[]) => {
        if (onFilterChange) {
            onFilterChange(dimension.id, newSelection);
        }
    };

    const options = values.map((v) => {
        return { label: v, value: v };
    });

    const onExploderClick = () => {
        if (onExploderChange) {
            onExploderChange(dimension.id);
        }
    };

    let buttonClasses = 'cursor-pointer bg-gray-200 hover:bg-gray-300 border text-xs font-bold py-1 px-2 rounded';
    if (isActiveExploder) {
        buttonClasses += ' border-red-500 text-red-700';
    } else {
        buttonClasses += ' border-gray-500 text-gray-700';
    }

    return (
        <>
            <div className="flex flex-col">
                <MultiSelect
                    label={dimension.label}
                    selected={selected}
                    options={options}
                    onChange={onChange}
                ></MultiSelect>
                <div className="flex flex-row content-center justify-end">
                    <span className="text-sm mr-1">Explode:</span>
                    <input className={buttonClasses} type="button" value="Lines" onClick={onExploderClick} />
                </div>
            </div>
        </>
    );
};
