import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { AppDispatch } from '../redux/store';
import { initThreadLines, selectAllLines, selectOrderedLines, updateThreadLines } from '../redux/linesSlice';
import { selectOrderedThreads } from '../redux/threadsSlice';
import { AdhocThread, CalculatedThread, SimpleThread, Thread } from '../models/Thread';
import { LineDefinition, LineMap, VersionedLines } from '../types';
import { LineData, QueryRequest, QueryResults } from '../models/DataSourceDefinition';
import { getDateRangeFromLines } from '../utils';

const refreshLineData = (dispatch: AppDispatch, thread: Thread, orderedThreads: Thread[], lines: LineMap) => {
    dispatch(initThreadLines(thread));

    if (thread.type === 'simple') {
        refreshSimpleThreadLines(dispatch, thread as SimpleThread);
    } else if (thread.type === 'adhoc') {
        refreshAdhocThreadLines(dispatch, thread as AdhocThread);
    } else if (thread.type === 'calculated') {
        refreshCalculatedThreadLines(dispatch, thread as CalculatedThread, orderedThreads, lines);
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

const refreshCalculatedThreadLines = (
    dispatch: AppDispatch,
    thread: CalculatedThread,
    orderedThreads: Thread[],
    lines: LineMap
) => {
    const lineData: LineData = {};
    const tokens = thread.formula.split(' ');

    const threadIndex1 = parseInt(tokens[0]) - 1;
    const operator = tokens[1];
    const threadIndex2 = parseInt(tokens[2]) - 1;

    if (orderedThreads.length > threadIndex1 && orderedThreads.length > threadIndex2) {
        const threadId1 = orderedThreads[threadIndex1].id;
        const threadId2 = orderedThreads[threadIndex2].id;
        if (Object.keys(lines).includes(threadId1) && Object.keys(lines).includes(threadId2)) {
        } else {
            console.error(
                `Unable to refresh calculated thread line ${thread.id}: At least one thread ID doesn't exist: '${threadId1}' and '${threadId2}'`
            );
        }

        const line1 = lines[threadId1].lines[0];
        const line2 = lines[threadId2].lines[0];
        const line2Dates = Object.keys(line2.data);
        const dates = getDateRangeFromLines([line1, line2]);
        dates.forEach((date) => {
            if (line2Dates.includes(date) && line2.data[date] !== 0) {
                switch (operator) {
                    case '/':
                        lineData[date] = (line1.data[date] ?? 0) / line2.data[date];
                        break;
                    default:
                        break;
                }
            }
        });
    }

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
                console.error('Error querying data', payload.error);
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
            console.error('Error querying data', error);
        });
};

export const useLines = (): LineMap => {
    const dispatch = useAppDispatch();
    const lines = useAppSelector(selectAllLines);
    const orderedThreads = useAppSelector(selectOrderedThreads);

    const lineMap: LineMap = {};
    orderedThreads.forEach((thread, index) => {
        if (!(thread.id in lines)) {
            refreshLineData(dispatch, thread, orderedThreads, lines);
        } else if (thread.dataVersion !== lines[thread.id].threadVersion) {
            refreshLineData(dispatch, thread, orderedThreads, lines);
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
