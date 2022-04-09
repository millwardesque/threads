import { DataSourceMap, LineData } from './models/DataSourceDefinition';

import { Thread } from './models/Thread';

export type DateRangeOption = 'all-time' | 'trailing-month' | 'trailing-year';

export type ThreadType = 'simple' | 'adhoc' | 'calculated';

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

export type ExploderType = 'lines' | 'stacked';
