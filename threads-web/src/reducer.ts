import { Action } from 'redux';

export function counterReducer(state: number = 0, action: Action) {
    switch (action.type) {
        default:
            return state;
    }
}
