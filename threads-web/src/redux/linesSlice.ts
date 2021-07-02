import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { LineMap } from '../types';

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

export const { deleteThreadLines, updateThreadLines } = linesSlice.actions;
export const SelectAllLines = (state: RootState) => state.lines.lines;
export default linesSlice.reducer;
