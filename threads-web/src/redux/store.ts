import { configureStore } from '@reduxjs/toolkit';
import sourcesReducer from './sourcesSlice';

export const store = configureStore({
    reducer: {
        sources: sourcesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// @TODO
// Lines
// Thread config
