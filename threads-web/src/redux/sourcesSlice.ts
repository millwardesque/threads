import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { DataSourceMap } from '../models/DataSourceDefinition';

interface SourcesState {
    sources: DataSourceMap;
}

const initialState = {
    sources: {} as DataSourceMap,
} as SourcesState;

const sourcesSlice = createSlice({
    name: 'sources',
    initialState,
    reducers: {
        replaceAll(state, action: PayloadAction<DataSourceMap>) {
            state.sources = action.payload;
        },
    },
});

export const { replaceAll } = sourcesSlice.actions;
export const selectAllSources = (state: RootState) => state.sources.sources;

export default sourcesSlice.reducer;
