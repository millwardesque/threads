import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { Thread, ThreadMap } from '../types';

interface ThreadsState {
    threads: ThreadMap;
    activeThreadKey: string | undefined;
}

const initialState = {
    threads: {} as ThreadMap,
    activeThreadKey: undefined as string | undefined,
} as ThreadsState;

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
    },
});

export const { setThread, deleteThread, setActiveThread } = threadsSlice.actions;
export const selectAllThreads = (state: RootState) => state.threads.threads;
export const selectActiveThreadKey = (state: RootState) => state.threads.activeThreadKey;
export const selectActiveThread = (state: RootState): Thread | undefined => {
    return state.threads.activeThreadKey ? state.threads.threads[state.threads.activeThreadKey] : undefined;
};

export default threadsSlice.reducer;
