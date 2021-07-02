import { configureStore } from '@reduxjs/toolkit';
import sourcesReducer from './sourcesSlice';
import linesReducer from './linesSlice';

export const store = configureStore({
    reducer: {
        lines: linesReducer,
        sources: sourcesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// @TODO
// Thread config
