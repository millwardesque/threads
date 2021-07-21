import {
    DataPlotDefinition,
    DataSourceDefinition,
    DataSourceMap,
    FiltersAndValues,
    LineData,
} from './models/DataSourceDefinition';

export interface Thread {
    id: string;
    source: DataSourceDefinition;
    plot: DataPlotDefinition;
    activeFilters: FiltersAndValues;
    label?: string;
    version: number;
}

export interface ThreadMap {
    [id: string]: Thread;
}

export interface LineDefinition {
    threadId: string;
    data: LineData;
}

export interface LineMap {
    [threadId: string]: {
        lines: LineDefinition[];
        threadVersion: number;
    };
}

export type LoadingStatus = 'not-started' | 'loading' | 'loaded' | 'error';

export interface ApplicationState {
    sources: DataSourceMap;
}
