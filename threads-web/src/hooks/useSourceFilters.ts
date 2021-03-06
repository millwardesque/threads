import { useEffect } from 'react';
import axios from 'axios';
import { AppDispatch } from '../redux/store';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { SimpleThread } from '../models/Thread';
import { FiltersAndValues } from '../models/DataSourceDefinition';
import { selectAllSourceFilters, setSourceFilters } from '../redux/sourcesSlice';
import { DataSourceDefinition, GetFilterResults } from '../models/DataSourceDefinition';

export interface SourceFiltersMap {
    [source: string]: FiltersAndValues;
}

const loadSourceFilters = (dispatch: AppDispatch, source: DataSourceDefinition): void => {
    if (source !== undefined) {
        dispatch(setSourceFilters({ [source.id]: {} }));

        axios
            .get(`http://localhost:2999/api/datasource/${source.id}/filters`)
            .then((response) => {
                const payload = response.data as GetFilterResults;
                if (payload.hasError) {
                    console.error('Error fetching filter values', payload.error);
                } else {
                    dispatch(setSourceFilters({ [source.id]: payload.filters }));
                }
            })
            .catch((error) => {
                console.error('Error retrieving filters', error);
            });
    }
};

export const useSourceFilters = (activeThread: SimpleThread | undefined): SourceFiltersMap => {
    const dispatch = useAppDispatch();
    const sourceFilters = useAppSelector(selectAllSourceFilters);
    const activeThreadSourceId = activeThread?.source.id;

    useEffect(() => {
        if (activeThread && !(activeThread.source.id in sourceFilters)) {
            loadSourceFilters(dispatch, activeThread.source);
        }
    }, [dispatch, activeThread, activeThreadSourceId, sourceFilters]);

    return sourceFilters;
};
