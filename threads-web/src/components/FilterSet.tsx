import React from 'react';

import { DataSourceDefinition, FiltersAndValues } from '../models/DataSourceDefinition';
import { FilterSelect } from './FilterSelect';
import { SimpleThread } from '../models/Thread';

interface FilterSetProps {
    thread: SimpleThread;
    filters: FiltersAndValues;
    onFilterChange?: (dimension: string, selected: string[]) => void;
    onExploderChange?: (dimension: string) => void;
}

export const FilterSet: React.FC<FilterSetProps> = ({ thread, filters, onFilterChange, onExploderChange }) => {
    const getFilterSelects = (
        source?: DataSourceDefinition,
        filters?: FiltersAndValues,
        activeFilters?: FiltersAndValues
    ) => {
        if (!source || Object.keys(source).length === 0 || !filters || Object.keys(filters).length === 0) {
            return [];
        }

        let filterSelects = [];
        for (const dimension of Object.keys(filters)) {
            const selected: string[] = activeFilters && dimension in activeFilters ? activeFilters[dimension] : [];
            const isActiveExploder = thread.exploderDimension === dimension;
            const sortedFilters = [...filters[dimension]].sort();
            const select = (
                <FilterSelect
                    key={dimension}
                    dimension={source.dimensions[dimension]}
                    values={sortedFilters}
                    selected={selected}
                    onFilterChange={onFilterChange}
                    onExploderChange={onExploderChange}
                    isActiveExploder={isActiveExploder}
                ></FilterSelect>
            );
            filterSelects.push(select);
        }
        return filterSelects;
    };

    const filterElements = getFilterSelects(thread.source, filters, thread.activeFilters);
    return <div>{filterElements}</div>;
};
