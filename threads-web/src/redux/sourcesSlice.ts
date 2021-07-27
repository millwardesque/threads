import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { DataSourceMap, FiltersAndValues } from '../models/DataSourceDefinition';

interface SourcesState {
    sources: DataSourceMap;
    sourceFilters: Record<string, FiltersAndValues>;
}

const initialState = {
    sources: {} as DataSourceMap,
    sourceFilters: {} as Record<string, FiltersAndValues>,
} as SourcesState;

const sourcesSlice = createSlice({
    name: 'sources',
    initialState,
    reducers: {
        replaceAll(state, action: PayloadAction<DataSourceMap>) {
            state.sources = action.payload;
            state.sourceFilters = {};
        },
        setSourceFilters(state, action: PayloadAction<Record<string, FiltersAndValues>>) {
            state.sourceFilters = {
                ...state.sourceFilters,
                ...action.payload,
            };
        },
    },
});

export const { replaceAll, setSourceFilters } = sourcesSlice.actions;
export const selectAllSources = (state: RootState) => state.sources.sources;
export const selectAllSourceFilters = (state: RootState) => state.sources.sourceFilters;

export default sourcesSlice.reducer;
