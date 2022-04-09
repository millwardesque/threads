import { v4 as uuidv4 } from 'uuid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from './store';
import { AggregationType } from '../models/Aggregation';
import { SmoothingType } from '../models/Smoother';
import { ExploderType, ThreadMap } from '../types';
import { AdhocThread, CalculatedThread, SimpleThread, Thread } from '../models/Thread';
import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues, LineData } from '../models/DataSourceDefinition';

interface ThreadsState {
    threads: ThreadMap;
    orderedThreadIds: Array<string>;
    activeThreadKey: string | undefined;
}

interface ThreadLabelArgs {
    threadId: string;
    label: string;
}

interface AdhocThreadDataArgs {
    threadId: string;
    data: LineData;
}

interface CalculatedThreadFormulaArgs {
    threadId: string;
    formula: string;
}

interface ThreadDescriptionArgs {
    threadId: string;
    description: string;
}

interface ThreadSmoothingArgs {
    threadId: string;
    smoothing: SmoothingType;
}

interface ThreadAggregationArgs {
    threadId: string;
    aggregation: AggregationType;
}

interface ThreadUnitsArgs {
    threadId: string;
    units: string;
}

interface ThreadExploderArgs {
    threadId: string;
    exploderDimension: string | undefined;
    exploderType: ExploderType | undefined;
}

const initialState = {
    threads: {} as ThreadMap,
    orderedThreadIds: [] as Array<string>,
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
        newSimpleThread(state, action: PayloadAction<DataSourceDefinition>) {
            const source = action.payload as DataSourceDefinition;
            const plot = Object.values(source.plots)[0];

            const thread = new SimpleThread(
                uuidv4(),
                'daily',
                '7-day trailing',
                undefined,
                '',
                0,
                source,
                plot,
                {},
                undefined,
                undefined
            );
            state.threads[thread.id] = thread;
            state.activeThreadKey = thread.id;
            state.orderedThreadIds.push(thread.id);
        },
        newAdhocThread(state) {
            const defaultUnits = '';

            const thread = new AdhocThread(uuidv4(), 'daily', '7-day trailing', undefined, '', 0, defaultUnits);
            state.threads[thread.id] = thread;
            state.activeThreadKey = thread.id;
            state.orderedThreadIds.push(thread.id);
        },
        newCalculatedThread(state) {
            const defaultFormula = '';
            const defaultUnits = '';

            const thread = new CalculatedThread(
                uuidv4(),
                'daily',
                '7-day trailing',
                undefined,
                '',
                0,
                defaultFormula,
                defaultUnits
            );
            state.threads[thread.id] = thread;
            state.activeThreadKey = thread.id;
            state.orderedThreadIds.push(thread.id);
        },
        duplicateThread(state, action: PayloadAction<Thread>) {
            const sourceThread = action.payload as Thread;
            const newThread = sourceThread.clone(sourceThread);

            if (newThread) {
                state.threads[newThread.id] = newThread;
                state.activeThreadKey = newThread.id;
                state.orderedThreadIds.push(newThread.id);
            }
        },
        setThread(state, action: PayloadAction<Thread>) {
            const thread = action.payload;
            state.threads[thread.id] = thread;
        },
        deleteThread(state, action: PayloadAction<string>) {
            const threadId = action.payload;
            delete state.threads[threadId];

            const threadIndex = state.orderedThreadIds.findIndex((id) => id === threadId);
            if (threadIndex !== -1) {
                state.orderedThreadIds.splice(threadIndex, 1);
            }

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
            if (activeThread && activeThread.type === 'simple') {
                let activeSimpleThread = activeThread as SimpleThread;
                activeSimpleThread.source = source;
                activeSimpleThread.plot = plot;
                activeSimpleThread.activeFilters = {};
                updateThreadDataVersion(activeThread);
            }
        },
        setActiveThreadPlot(state, action: PayloadAction<DataPlotDefinition>) {
            const activeThread = getActiveThread(state);
            if (activeThread) {
                let activeSimpleThread = activeThread as SimpleThread;
                activeSimpleThread.plot = action.payload;
                updateThreadDataVersion(activeThread);
            }
        },
        setActiveThreadFilters(state, action: PayloadAction<FiltersAndValues>) {
            const activeThread = getActiveThread(state);
            if (activeThread) {
                let activeSimpleThread = activeThread as SimpleThread;
                activeSimpleThread.activeFilters = action.payload;
                updateThreadDataVersion(activeThread);
            }
        },
        setThreadLabel(state, action: PayloadAction<ThreadLabelArgs>) {
            const { threadId, label } = action.payload;
            if (threadId in state.threads) {
                state.threads[threadId].customLabel = label === '' ? undefined : label;
            }
        },
        clearThreadLabel(state, action: PayloadAction<string>) {
            const threadId = action.payload;
            if (threadId in state.threads) {
                state.threads[threadId].customLabel = undefined;
            }
        },
        setAdhocThreadData(state, action: PayloadAction<AdhocThreadDataArgs>) {
            const { threadId, data } = action.payload;
            if (threadId in state.threads && state.threads[threadId].type === 'adhoc') {
                const thread = state.threads[threadId] as AdhocThread;
                thread.adhocData = data;
                updateThreadDataVersion(thread);
            }
        },
        setCalculatedThreadFormula(state, action: PayloadAction<CalculatedThreadFormulaArgs>) {
            const { threadId, formula } = action.payload;
            if (threadId in state.threads && state.threads[threadId].type === 'calculated') {
                const thread = state.threads[threadId] as CalculatedThread;
                thread.formula = formula;
                updateThreadDataVersion(thread);
            }
        },
        setThreadAggregation(state, action: PayloadAction<ThreadAggregationArgs>) {
            const { threadId, aggregation } = action.payload;
            if (threadId in state.threads) {
                state.threads[threadId].aggregation = aggregation;
            }
        },
        setThreadDescription(state, action: PayloadAction<ThreadDescriptionArgs>) {
            const { threadId, description } = action.payload;
            if (threadId in state.threads) {
                state.threads[threadId].description = description;
            }
        },
        setThreadExploder(state, action: PayloadAction<ThreadExploderArgs>) {
            const { threadId, exploderDimension, exploderType } = action.payload;
            if (threadId in state.threads && state.threads[threadId].type === 'simple') {
                const thread = state.threads[threadId] as SimpleThread;
                thread.exploderDimension = exploderDimension;
                thread.exploderType = exploderType;
                updateThreadDataVersion(thread);
            }
        },
        setThreadSmoothing(state, action: PayloadAction<ThreadSmoothingArgs>) {
            const { threadId, smoothing } = action.payload;
            if (threadId in state.threads) {
                state.threads[threadId].smoothing = smoothing;
            }
        },
        setThreadUnits(state, action: PayloadAction<ThreadUnitsArgs>) {
            const { threadId, units } = action.payload;
            if (threadId in state.threads && state.threads[threadId].type === 'adhoc') {
                const thread = state.threads[threadId] as AdhocThread;
                thread.units = units;
            } else if (threadId in state.threads && state.threads[threadId].type === 'calculated') {
                const thread = state.threads[threadId] as CalculatedThread;
                thread.units = units;
            }
        },
    },
});

export const {
    deleteThread,
    duplicateThread,
    newSimpleThread,
    newAdhocThread,
    newCalculatedThread,
    setActiveThread,
    setActiveThreadSource,
    setActiveThreadPlot,
    setActiveThreadFilters,
    setAdhocThreadData,
    setCalculatedThreadFormula,
    setThread,
    setThreadAggregation,
    setThreadDescription,
    setThreadExploder,
    setThreadLabel,
    setThreadSmoothing,
    setThreadUnits,
    clearThreadLabel,
} = threadsSlice.actions;
export const selectAllThreads = (state: RootState) => state.threads.threads;
export const selectOrderedThreads = (state: RootState): Array<Thread> => {
    return state.threads.orderedThreadIds.map((id) => state.threads.threads[id]);
};
export const selectActiveThreadKey = (state: RootState) => state.threads.activeThreadKey;
export const selectActiveThread = (state: RootState): Thread | undefined => {
    return getActiveThread(state.threads);
};

export default threadsSlice.reducer;
