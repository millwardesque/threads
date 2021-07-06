import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { Thread, ThreadMap } from '../types';

interface ThreadsState {
    threads: ThreadMap;
    activeThread: Thread | undefined;
}

const initialState = {
    threads: {} as ThreadMap,
    activeThread: undefined as Thread | undefined,
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
        },
        setActiveThread(state, action: PayloadAction<Thread>) {
            state.activeThread = action.payload;
        },
    },
});

export const { setThread, deleteThread, setActiveThread } = threadsSlice.actions;
export const selectAllThreads = (state: RootState) => state.threads.threads;
export const selectActiveThread = (state: RootState) => state.threads.activeThread;

export default threadsSlice.reducer;
