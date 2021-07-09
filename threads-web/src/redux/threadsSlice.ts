import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { Thread, ThreadMap } from '../types';
import { DataPlotDefinition, DataSourceDefinition } from '../models/DataSourceDefinition';

interface ThreadsState {
    threads: ThreadMap;
    activeThreadKey: string | undefined;
}

const initialState = {
    threads: {} as ThreadMap,
    activeThreadKey: undefined as string | undefined,
} as ThreadsState;

const getActiveThread = (state: ThreadsState): Thread | undefined => {
    return state.activeThreadKey ? state.threads[state.activeThreadKey] : undefined;
};

const threadsSlice = createSlice({
    name: 'threads',
    initialState,
    reducers: {
        setThread(state, action: PayloadAction<Thread>) {
            const thread = action.payload;
            state.threads[thread.id] = thread;
        },
        deleteThread(state, action: PayloadAction<string>) {
            const threadId = action.payload;
            delete state.threads[threadId];

            if (threadId === state.activeThreadKey) {
                state.activeThreadKey = undefined;
            }
        },
        setActiveThread(state, action: PayloadAction<Thread>) {
            if (action.payload.id in state.threads) {
                state.activeThreadKey = action.payload.id;
            }
        },
        setActiveThreadSource(state, action: PayloadAction<DataSourceDefinition>) {
            const source = action.payload;
            const plot = Object.values(source.plots)[0];
            const activeThread = getActiveThread(state);
            if (activeThread) {
                activeThread.source = source;
                activeThread.plot = plot;
                activeThread.activeFilters = {};
            }
        },
        setActiveThreadPlot(state, action: PayloadAction<DataPlotDefinition>) {
            const activeThread = getActiveThread(state);
            if (activeThread) {
                activeThread.plot = action.payload;
            }
        },
    },
});

export const { setThread, deleteThread, setActiveThread, setActiveThreadSource, setActiveThreadPlot } =
    threadsSlice.actions;
export const selectAllThreads = (state: RootState) => state.threads.threads;
export const selectActiveThreadKey = (state: RootState) => state.threads.activeThreadKey;
export const selectActiveThread = (state: RootState): Thread | undefined => {
    return getActiveThread(state.threads);
};

export default threadsSlice.reducer;
