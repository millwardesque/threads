import { v4 as uuidv4 } from 'uuid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from './store';
import { Thread, ThreadMap } from '../types';
import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues } from '../models/DataSourceDefinition';

interface ThreadsState {
    threads: ThreadMap;
    activeThreadKey: string | undefined;
}

interface ThreadLabelArgs {
    threadId: string;
    label: string;
}

const initialState = {
    threads: {} as ThreadMap,
    activeThreadKey: undefined as string | undefined,
} as ThreadsState;

const getActiveThread = (state: ThreadsState): Thread | undefined => {
    return state.activeThreadKey ? state.threads[state.activeThreadKey] : undefined;
};

const updateThreadDataVersion = (thread: Thread) => {
    thread.dataVersion += 1;
};

const threadsSlice = createSlice({
    name: 'threads',
    initialState,
    reducers: {
        newThread(state, action: PayloadAction<DataSourceDefinition>) {
            const source = action.payload as DataSourceDefinition;
            const plot = Object.values(source.plots)[0];

            console.log(`Creating new source and plot: ${source.id}.${plot.id}`);
            const thread: Thread = {
                id: uuidv4(),
                source,
                plot,
                activeFilters: {},
                dataVersion: 0,
            };
            state.threads[thread.id] = thread;
            state.activeThreadKey = thread.id;
        },
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
                updateThreadDataVersion(activeThread);
            }
        },
        setActiveThreadPlot(state, action: PayloadAction<DataPlotDefinition>) {
            const activeThread = getActiveThread(state);
            if (activeThread) {
                activeThread.plot = action.payload;
                updateThreadDataVersion(activeThread);
            }
        },
        setActiveThreadFilters(state, action: PayloadAction<FiltersAndValues>) {
            const activeThread = getActiveThread(state);
            if (activeThread) {
                activeThread.activeFilters = action.payload;
                updateThreadDataVersion(activeThread);
            }
        },
        setThreadLabel(state, action: PayloadAction<ThreadLabelArgs>) {
            const { threadId, label } = action.payload;
            if (threadId in state.threads) {
                console.log('Updating thread label', action.payload);
                state.threads[threadId].label = label;
            }
        },
        clearThreadLabel(state, action: PayloadAction<string>) {
            const threadId = action.payload;
            if (threadId in state.threads) {
                state.threads[threadId].label = undefined;
            }
        },
    },
});

export const {
    deleteThread,
    newThread,
    setActiveThread,
    setActiveThreadSource,
    setActiveThreadPlot,
    setActiveThreadFilters,
    setThread,
    setThreadLabel,
    clearThreadLabel,
} = threadsSlice.actions;
export const selectAllThreads = (state: RootState) => state.threads.threads;
export const selectActiveThreadKey = (state: RootState) => state.threads.activeThreadKey;
export const selectActiveThread = (state: RootState): Thread | undefined => {
    return getActiveThread(state.threads);
};

export default threadsSlice.reducer;
