import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

interface PageConfigState {
    title: string;
}

const initialState = {
    title: 'Threads',
} as PageConfigState;

const pageConfigSlice = createSlice({
    name: 'page',
    initialState,
    reducers: {
        setTitle(state, action: PayloadAction<string>) {
            state.title = action.payload;
        },
    },
});

export const { setTitle } = pageConfigSlice.actions;
export const selectTitle = (state: RootState) => state.page.title;

export default pageConfigSlice.reducer;
