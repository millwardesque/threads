import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { LineMap, Thread } from '../types';

interface LinesState {
    lines: LineMap;
}

const initialState = {
    lines: {} as LineMap,
} as LinesState;

const linesSlice = createSlice({
    name: 'lines',
    initialState,
    reducers: {
        initThreadLines(state, action: PayloadAction<Thread>) {
            const { id: threadId, dataVersion: threadVersion } = action.payload as Thread;

            if (threadId in state.lines) {
                state.lines[threadId].lines = [];
                state.lines[threadId].threadVersion = threadVersion;
            } else {
                state.lines[threadId] = {
                    lines: [],
                    threadVersion,
                };
            }
        },
        deleteThreadLines(state, action: PayloadAction<string>) {
            delete state.lines[action.payload];
        },
        updateThreadLines(state, action: PayloadAction<LineMap>) {
            state.lines = {
                ...state.lines,
                ...action.payload,
            };
        },
    },
});

export const { deleteThreadLines, initThreadLines, updateThreadLines } = linesSlice.actions;
export const selectAllLines = (state: RootState) => state.lines.lines;
export const selectOrderedLines = (state: RootState) => {
    return state.threads.orderedThreadIds.map((id) => state.lines.lines[id]);
};
export const selectThreadLines = (state: RootState, thread: Thread) => state.lines.lines[thread.id];

export default linesSlice.reducer;
