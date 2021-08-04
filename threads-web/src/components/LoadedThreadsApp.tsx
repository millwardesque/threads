import { useEffect } from 'react';
import { DataPlotDefinition, DataSourceDefinition, DataSourceMap } from '../models/DataSourceDefinition';
import { SourceSelect } from './SourceSelect';
import { PlotSelect } from './PlotSelect';
import { Throbber } from './Throbber';
import { FilterSet } from './FilterSet';
import { PageTitle } from './PageTitle';
import { ThreadsChart } from './ThreadsChart';
import { ThreadDescription } from './ThreadDescription';
import { ThreadTabs } from './ThreadTabs';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteThreadLines } from '../redux/linesSlice';
import {
    newThread,
    deleteThread,
    setActiveThread,
    setActiveThreadSource,
    setActiveThreadPlot,
    setActiveThreadFilters,
    selectActiveThread,
    selectAllThreads,
    setThreadDescription,
    setThreadExploder,
} from '../redux/threadsSlice';
import { Thread } from '../types';
import { useLines } from '../hooks/useLines';
import { useSourceFilters } from '../hooks/useSourceFilters';

interface LoadedThreadsAppProps {
    sources: DataSourceMap;
}

export const LoadedThreadsApp: React.FC<LoadedThreadsAppProps> = ({ sources }) => {
    const makeNewThread = () => {
        dispatch(newThread(Object.values(sources)[0]));
    };

    const switchThread = (thread: Thread) => {
        dispatch(setActiveThread(thread));
    };

    const removeThread = (thread: Thread) => {
        dispatch(deleteThreadLines(thread.id));
        dispatch(deleteThread(thread.id));
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

        dispatch(setActiveThreadFilters(newActiveFilters));
    };

    const onDescriptionChange = (newDescription: string) => {
        dispatch(setThreadDescription({ threadId: activeThread!.id, description: newDescription }));
    };

    const onExploderChange = (dimension: string): void => {
        const newDimension = activeThread!.exploderDimension === dimension ? undefined : dimension;
        dispatch(setThreadExploder({ threadId: activeThread!.id, exploderDimension: newDimension }));
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

    const dispatch = useAppDispatch();
    const threads = useAppSelector(selectAllThreads);
    const activeThread = useAppSelector(selectActiveThread);
    const sourceFilters = useSourceFilters(activeThread);
    const allLines = useLines();

    useEffect(() => {
        if (Object.keys(threads).length === 0) {
            dispatch(newThread(Object.values(sources)[0]));
        }
    }, [sources, dispatch, threads]);

    useEffect(() => {
        if (!activeThread && Object.values(threads).length > 0) {
            dispatch(setActiveThread(Object.values(threads)[0]));
        }
    }, [threads, activeThread, dispatch]);

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
                            <ThreadDescription thread={activeThread} onDescriptionChange={onDescriptionChange} />
                        </div>
                        <div className="flex flex-row p-6 w-2/3 h-full">
                            {activeThread && activeThread.source.id in sourceFilters ? (
                                <FilterSet
                                    thread={activeThread}
                                    filters={sourceFilters[activeThread.source.id]}
                                    onFilterChange={onFilterChange}
                                    onExploderChange={onExploderChange}
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
