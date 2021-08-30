import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { AppDispatch } from '../redux/store';
import { initThreadLines, selectAllLines, selectOrderedLines, updateThreadLines } from '../redux/linesSlice';
import { selectOrderedThreads } from '../redux/threadsSlice';
import { AdhocThread, SimpleThread, Thread } from '../models/Thread';
import { LineDefinition, LineMap, VersionedLines } from '../types';
import { LineData, QueryRequest, QueryResults } from '../models/DataSourceDefinition';

const refreshLineData = (dispatch: AppDispatch, thread: Thread) => {
    dispatch(initThreadLines(thread));

    if (thread.type === 'simple') {
        refreshSimpleThreadLines(dispatch, thread as SimpleThread);
    } else if (thread.type === 'adhoc') {
        refreshAdhocThreadLines(dispatch, thread as AdhocThread);
    }
};

const dispatchUpdatedLines = (dispatch: AppDispatch, thread: Thread, lines: LineDefinition[]) => {
    dispatch(
        updateThreadLines({
            [thread.id]: {
                lines: lines,
                threadVersion: thread.dataVersion,
            },
        })
    );
};

const refreshAdhocThreadLines = (dispatch: AppDispatch, thread: AdhocThread) => {
    const lineData: LineData = {};
    Object.keys(thread.adhocData).forEach((k) => {
        lineData[k] = thread.adhocData[k];
    });

    const newLines = [
        {
            threadId: thread.id,
            label: undefined,
            data: lineData,
        },
    ];
    dispatchUpdatedLines(dispatch, thread, newLines);
};

const refreshSimpleThreadLines = (dispatch: AppDispatch, thread: SimpleThread) => {
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

                dispatchUpdatedLines(dispatch, thread, newLines);
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
            refreshLineData(dispatch, thread);
        } else if (thread.dataVersion !== lines[thread.id].threadVersion) {
            refreshLineData(dispatch, thread);
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
