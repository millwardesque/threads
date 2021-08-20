import {
    DataPlotDefinition,
    DataSourceDefinition,
    DataSourceMap,
    FiltersAndValues,
    LineData,
} from './models/DataSourceDefinition';

export type ThreadType = 'simple' | 'adhoc';

export interface Thread {
    id: string;
    type: ThreadType;
    label?: string;
    description: string;
    source: DataSourceDefinition;
    plot: DataPlotDefinition;
    activeFilters: FiltersAndValues;
    exploderDimension?: string;
    dataVersion: number;
}

export interface ThreadMap {
    [id: string]: Thread;
}

export interface LineDefinition {
    threadId: string;
    label?: string;
    data: LineData;
}
export interface VersionedLines {
    lines: LineDefinition[];
    threadVersion: number;
}

export interface LineMap {
    [threadId: string]: VersionedLines;
}

export type LoadingStatus = 'not-started' | 'loading' | 'loaded' | 'error';

export interface ApplicationState {
    sources: DataSourceMap;
}
