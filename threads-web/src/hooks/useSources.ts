import { useState } from 'react';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { replaceAll, selectAllSources } from '../redux/sourcesSlice';

import { DataSourceMap } from '../models/DataSourceDefinition';

export interface Sources {
    error: string;
    isLoaded: boolean;
    sources: DataSourceMap;
}

export const useSources = (): Sources => {
    const dispatch = useAppDispatch();
    const sources = useAppSelector(selectAllSources);
    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    let error = '';

    if (sourceStatus === 'not-started') {
        setSourceStatus('loading');
        axios
            .get('http://localhost:2999/api/datasource')
            .then((response) => {
                const { data: sources } = response;
                setSourceStatus('loaded');
                dispatch(replaceAll(sources));
            })
            .catch((e) => {
                setSourceStatus('error');
                error = e.toString();
            });
    }

    return {
        error,
        isLoaded: sourceStatus === 'loaded',
        isReady: isLoaded && !error;
        sources,
    };
};
