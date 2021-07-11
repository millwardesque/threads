import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    DataPlotDefinition,
    DataSourceDefinition,
    DataSourceMap,
    FiltersAndValues,
    GetFilterResults,
    LineDefinition,
    QueryRequest,
    QueryResults,
} from '../models/DataSourceDefinition';
import { SourceSelect } from './SourceSelect';
import { PlotSelect } from './PlotSelect';
import { Throbber } from './Throbber';
import { FilterSet } from './FilterSet';
import { PageTitle } from './PageTitle';
import { ThreadsChart } from './ThreadsChart';
import { v4 as uuidv4 } from 'uuid';
import { ThreadTabs } from './ThreadTabs';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteThreadLines, updateThreadLines, selectAllLines } from '../redux/linesSlice';
import {
    setThread,
    deleteThread,
    setActiveThread,
    setActiveThreadSource,
    setActiveThreadPlot,
    selectActiveThread,
    selectAllThreads,
} from '../redux/threadsSlice';
import { LoadingStatus, Thread } from '../types';

interface LoadedThreadsAppProps {
    sources: DataSourceMap;
}

export const LoadedThreadsApp: React.FC<LoadedThreadsAppProps> = ({ sources }) => {
    const updateThread = (newActiveThread: Thread) => {
        dispatch(setThread(newActiveThread));
        query(newActiveThread);
    };

    const switchThread = (thread: Thread) => {
        dispatch(setActiveThread(thread));
    };

    const clearThreadLines = (thread: Thread) => {
        dispatch(deleteThreadLines(thread.id));
    };

    const removeThread = (thread: Thread) => {
        clearThreadLines(thread);
        dispatch(deleteThread(thread.id));
    };

    const replaceThreadLines = (thread: Thread, lines: LineDefinition[]) => {
        dispatch(
            updateThreadLines({
                [thread.id]: lines,
            })
        );
    };

    const makeNewThread = () => {
        const source = Object.values(sources)[0];
        const plot = Object.values(source.plots)[0];

        console.log(`Creating new source and plot: ${source.id}.${plot.id}`);
        const newThread: Thread = {
            id: uuidv4(),
            source,
            plot,
            activeFilters: {},
        };

        updateThread(newThread);
        switchThread(newThread);
    };

    const onSourceChange = (selectedSource: DataSourceDefinition): void => {
        dispatch(setActiveThreadSource(selectedSource));
    };

    const onPlotChange = (plot: DataPlotDefinition): void => {
        dispatch(setActiveThreadPlot(plot));
    };

    const onFilterChange = (dimension: string, selected: string[]): void => {
        const newActiveFilters = {
            ...activeThread!.activeFilters,
            [dimension]: selected,
        };

        const newActiveThread: Thread = {
            ...activeThread!,
            activeFilters: newActiveFilters,
        };
        updateThread(newActiveThread);
    };

    const onTabClose = (thread: Thread) => {
        const threadList = Object.values(threads);
        const threadIndex = threadList.indexOf(thread);

        let newActiveThread: Thread | undefined = undefined;
        if (threadIndex < threadList.length - 1) {
            newActiveThread = threadList[threadIndex + 1];
        } else if (threadIndex > 0) {
            newActiveThread = threadList[threadIndex - 1];
        } else {
            // This code is likely unreachable because of the restrictions around closing the final tab, but just in case...
            throw new Error(
                `Attemting to close tab that shouldn't be closed. Thread ID ${thread.id}, Tab # ${threadIndex}.`
            );
        }

        switchThread(newActiveThread);
        removeThread(thread);
    };

    const query = (thread?: Thread): void => {
        if (thread === undefined || thread.plot === undefined) {
            return;
        }

        clearThreadLines(thread);

        const query: QueryRequest = {
            plotId: thread.plot.id,
            dimensionFilters: thread.activeFilters,
        };
        axios
            .post(`http://localhost:2999/api/datasource/${thread.source.id}/query`, query)
            .then((response) => {
                const payload = response.data as QueryResults;
                if (payload.hasError) {
                    console.log('Error querying data', payload.error);
                } else {
                    const lineData = Object.values(payload.data);
                    let newLines: LineDefinition[] = [];
                    for (let line of lineData) {
                        newLines.push({
                            plot: thread.plot!,
                            data: line,
                        });
                    }

                    replaceThreadLines(thread, newLines);
                    console.log('Query results', payload, newLines);
                }
            })
            .catch((error) => {
                console.log('Error querying data', error);
            });
    };

    const loadSourceFilters = (source: DataSourceDefinition): void => {
        if (source !== undefined) {
            setSourceFilters((oldSourceFilters) => {
                return {
                    ...oldSourceFilters,
                    [source.id]: {},
                };
            });
            setFilterLoadingStatus('loading');

            axios
                .get(`http://localhost:2999/api/datasource/${source.id}/filters`)
                .then((response) => {
                    const payload = response.data as GetFilterResults;
                    if (payload.hasError) {
                        console.log('Error fetching filter values', payload.error);
                    } else {
                        setSourceFilters((oldSourceFilters) => {
                            return {
                                ...oldSourceFilters,
                                [source.id]: payload.filters,
                            };
                        });
                        console.log('Filters retrieved', payload);
                    }
                })
                .catch((error) => {
                    console.log('Error retrieving filters', error);
                })
                .finally(() => {
                    setFilterLoadingStatus('loaded');
                });
        }
    };

    const dispatch = useAppDispatch();
    const threads = useAppSelector(selectAllThreads);
    const activeThread = useAppSelector(selectActiveThread);
    const lines = useAppSelector(selectAllLines);
    const [filterLoadingStatus, setFilterLoadingStatus] = useState<LoadingStatus>('not-started');
    const [sourceFilters, setSourceFilters] = useState<{ [source: string]: FiltersAndValues }>({});

    // On mount
    useEffect(() => {
        if (!threads.length) {
            makeNewThread();
        }
    }, []);

    if (activeThread && !(activeThread.source.id in sourceFilters)) {
        loadSourceFilters(activeThread.source);
    }

    let allLines: LineDefinition[] = [];
    Object.values(lines).forEach((threadLines) => {
        allLines = allLines.concat(threadLines);
    });

    return !activeThread ? (
        <Throbber />
    ) : (
        <>
            <div className="flex h-12">
                <PageTitle />
            </div>
            <div className="flex flex-col h-full width-full">
                <div className="row flex h-3/4 flex-col">
                    <div className="flex flex-row w-full h-full">
                        <div className="graph-area w-full h-full p-4">
                            <ThreadsChart id="chart" lines={allLines} />
                        </div>
                    </div>
                </div>
                <div className="row flex flex-col h-1/4">
                    <div className="tabs-area flex flex-row">
                        <ThreadTabs
                            threads={threads}
                            activeThread={activeThread}
                            onSelectTab={switchThread}
                            onCloseTab={onTabClose}
                            onNewTab={makeNewThread}
                        />
                    </div>
                    <div className="config-area flex flex-row flex-auto bg-gray-100">
                        <div className="flex flex-col p-6 w-1/3 h-full border-0 border-r border-gray-300">
                            <SourceSelect
                                sources={sources}
                                selectedSource={activeThread.source}
                                onSourceChange={onSourceChange}
                            />
                            <PlotSelect thread={activeThread} onPlotChange={onPlotChange} />
                        </div>
                        <div className="flex flex-row p-6 w-2/3 h-full">
                            {activeThread && filterLoadingStatus === 'loaded' ? (
                                <FilterSet
                                    thread={activeThread}
                                    filters={sourceFilters[activeThread.source.id]}
                                    onFilterChange={onFilterChange}
                                />
                            ) : (
                                <Throbber />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
