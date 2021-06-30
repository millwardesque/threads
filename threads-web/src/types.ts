import {
    DataPlotDefinition,
    DataSourceDefinition,
    DataSourceMap,
    FiltersAndValues,
    LineDefinition,
} from './models/DataSourceDefinition';

export interface LineMap {
    [threadId: string]: LineDefinition[];
}

export interface Thread {
    id: string;
    source: DataSourceDefinition;
    plot: DataPlotDefinition;
    activeFilters: FiltersAndValues;
}

export type LoadingStatus = 'not-started' | 'loading' | 'loaded';

export interface ApplicationState {
    sources: DataSourceMap;
}
