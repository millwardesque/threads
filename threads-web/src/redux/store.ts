import { configureStore } from '@reduxjs/toolkit';
import sourcesReducer from './sourcesSlice';
import linesReducer from './linesSlice';
import threadsReducer from './threadsSlice';
import pageConfigReducer from './pageSlice';

export const store = configureStore({
    reducer: {
        lines: linesReducer,
        page: pageConfigReducer,
        sources: sourcesReducer,
        threads: threadsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// @TODO
// source filters
