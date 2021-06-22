import React from 'react';

import { DataSourceDefinition, FiltersAndValues } from '../models/DataSourceDefinition';
import { FilterSelect } from './FilterSelect';
import { Thread } from '../types';

interface FilterSetProps {
    thread: Thread,
    filters: FiltersAndValues,
    onFilterChange?: (dimension: string, selected: string[]) => void,
};

export const FilterSet: React.FC<FilterSetProps> = ({thread, filters, onFilterChange}) => {

    const getFilterSelects = (source?: DataSourceDefinition, filters?: FiltersAndValues, activeFilters?: FiltersAndValues) => {
        if (!source || Object.keys(source).length === 0 || !filters || Object.keys(filters).length === 0) {
            return [];
        }

        let filterSelects = [];
        for (const dimension of Object.keys(filters)) {
            const selected: string[] = (activeFilters && dimension in activeFilters) ? activeFilters[dimension] : [];
            const select = <FilterSelect dimension={source.dimensions[dimension]} values={filters[dimension]} selected={selected} onFilterChange={onFilterChange}></FilterSelect>;
            filterSelects.push(select);
        }
        return filterSelects;
    }

    const filterElements = getFilterSelects(thread.source, filters, thread.activeFilters);
    return (
        <div>
            {filterElements}
        </div>
    );
};