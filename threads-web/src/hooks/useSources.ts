import { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { replaceAll, selectAllSources } from '../redux/sourcesSlice';

export const useSources = () => {
    const dispatch = useAppDispatch();
    const sources = useAppSelector(selectAllSources);
    const [loading, setLoading] = useState<LoadingStatus>('not-started');

    useEffect(() => {
        const loadSources = async () => {
            setLoading('loading');

            try {
                const result = await axios('http://localhost:2999/api/datasource');
                dispatch(replaceAll(result.data));
                setLoading('loaded');
            } catch (error) {
                console.error('Error loading sources', error);
                setLoading('error');
            }
        };

        loadSources();
    }, [dispatch]);

    return {
        sources,
        loading,
    };
};
