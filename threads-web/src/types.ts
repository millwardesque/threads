import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues } from './models/DataSourceDefinition';

export interface Thread {
    id: string,
    source: DataSourceDefinition,
    plot: DataPlotDefinition,
    activeFilters: FiltersAndValues,
};

export type LoadingStatus = 'not-started' | 'loading' | 'loaded';