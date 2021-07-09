import { useState } from 'react';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { replaceAll, selectAllSources } from '../redux/sourcesSlice';

export const useSources = () => {
    const dispatch = useAppDispatch();
    const sources = useAppSelector(selectAllSources);
    const [loading, setLoading] = useState<LoadingStatus>('not-started');

    if (loading === 'not-started') {
        setLoading('loading');
        axios
            .get('http://localhost:2999/api/datasource')
            .then((response) => {
                const { data: sources } = response;
                console.log('Got our sources!');
                setLoading('loaded');
                dispatch(replaceAll(sources));
            })
            .catch((error) => {
                setLoading('error');
            });
    }

    return {
        sources,
        loading,
    };
};
