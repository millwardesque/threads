import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { AppDispatch } from '../redux/store';
import { initThreadLines, selectAllLines, selectOrderedLines, updateThreadLines } from '../redux/linesSlice';
import { selectOrderedThreads } from '../redux/threadsSlice';
import { LineDefinition, LineMap, Thread, VersionedLines } from '../types';
import { QueryRequest, QueryResults } from '../models/DataSourceDefinition';

const queryLineData = (dispatch: AppDispatch, thread: Thread) => {
    dispatch(initThreadLines(thread));

    const query: QueryRequest = {
        plotId: thread.plot.id,
        dimensionFilters: thread.activeFilters,
        dimensionExploder: thread.exploderDimension,
    };
    axios
        .post(`http://localhost:2999/api/datasource/${thread.source.id}/query`, query)
        .then((response) => {
            const payload = response.data as QueryResults;
            if (payload.hasError) {
                console.log('Error querying data', payload.error);
            } else {
                let newLines: LineDefinition[] = [];
                for (let [dimension, lineData] of Object.entries(payload.data)) {
                    newLines.push({
                        threadId: thread.id,
                        label: dimension !== '*' ? dimension : undefined,
                        data: lineData,
                    });
                }

                dispatch(
                    updateThreadLines({
                        [thread.id]: {
                            lines: newLines,
                            threadVersion: thread.dataVersion,
                        },
                    })
                );
            }
        })
        .catch((error) => {
            console.log('Error querying data', error);
        });
};

export const useLines = (): LineMap => {
    const dispatch = useAppDispatch();
    const lines = useAppSelector(selectAllLines);
    const orderedThreads = useAppSelector(selectOrderedThreads);

    const lineMap: LineMap = {};
    orderedThreads.forEach((thread, index) => {
        if (!(thread.id in lines)) {
            queryLineData(dispatch, thread);
        } else if (thread.dataVersion !== lines[thread.id].threadVersion) {
            queryLineData(dispatch, thread);
        } else {
            lineMap[thread.id] = lines[thread.id];
        }
    });

    return lineMap;
};

export const useOrderedLines = (): VersionedLines[] => {
    useLines();
    return useAppSelector(selectOrderedLines);
};
