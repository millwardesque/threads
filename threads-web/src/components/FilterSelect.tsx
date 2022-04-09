import React from 'react';
import { DataDimensionDefinition } from '../models/DataSourceDefinition';

import { MultiSelect } from './molecules/MultiSelect';
import { ExploderType } from '../types';

interface FilterSelectProps {
    dimension: DataDimensionDefinition;
    values: string[];
    selected: string[];
    onFilterChange?: (dimension: string, selected: string[]) => void;
    onExploderChange?: (dimension: string, type: ExploderType | undefined) => void;
    isActiveExploder: boolean;
    activeExploderType: ExploderType | undefined;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    dimension,
    values,
    selected,
    onFilterChange,
    onExploderChange,
    isActiveExploder,
    activeExploderType,
}) => {
    const onChange = (newSelection: string[]) => {
        if (onFilterChange) {
            onFilterChange(dimension.id, newSelection);
        }
    };

    const options = values.map((v) => {
        return { label: v, value: v };
    });

    const onExploderClick = (type: ExploderType | undefined) => {
        if (onExploderChange) {
            onExploderChange(dimension.id, type);
        }
    };

    let lineButtonClasses = 'cursor-pointer bg-gray-200 hover:bg-gray-300 border text-xs font-bold py-1 px-2 rounded';
    if (isActiveExploder && activeExploderType === 'lines') {
        lineButtonClasses += ' border-red-500 text-red-700';
    } else {
        lineButtonClasses += ' border-gray-500 text-gray-700';
    }

    let stackedButtonClasses =
        'cursor-pointer bg-gray-200 hover:bg-gray-300 border text-xs font-bold py-1 px-2 rounded';
    if (isActiveExploder && activeExploderType === 'stacked') {
        stackedButtonClasses += ' border-red-500 text-red-700';
    } else {
        stackedButtonClasses += ' border-gray-500 text-gray-700';
    }

    return (
        <div className="flex flex-col mr-4">
            <MultiSelect
                label={dimension.label}
                selected={selected}
                options={options}
                onChange={onChange}
            ></MultiSelect>
            <div className="flex flex-row content-center justify-end">
                <span className="text-sm mr-1">Explode:</span>
                <input
                    className={lineButtonClasses}
                    type="button"
                    value="Lines"
                    onClick={() => {
                        onExploderClick('lines');
                    }}
                />
                <input
                    className={stackedButtonClasses}
                    type="button"
                    value="Stacked"
                    onClick={() => {
                        onExploderClick('stacked');
                    }}
                />
            </div>
        </div>
    );
};
