import React from 'react';

import { useSources } from '../hooks/useSources';
import { useSourceFilters } from '../hooks/useSourceFilters';
import { useAppDispatch } from '../redux/hooks';
import { DataPlotDefinition, DataSourceDefinition } from '../models/DataSourceDefinition';
import { setActiveThreadFilters, setThreadExploder } from '../redux/threadsSlice';
import { SourceSelect } from './SourceSelect';
import { PlotSelect } from './PlotSelect';
import { Thread } from '../types';
import { ThreadDescription } from './ThreadDescription';
import { FilterSet } from './FilterSet';
import { Throbber } from './Throbber';

import { setActiveThreadSource, setActiveThreadPlot, setThreadDescription } from '../redux/threadsSlice';

interface SimpleThreadConfigPanelProps {
    thread: Thread;
}

export const SimpleThreadConfigPanel: React.FC<SimpleThreadConfigPanelProps> = ({ thread }) => {
    const onDescriptionChange = (newDescription: string) => {
        dispatch(setThreadDescription({ threadId: thread!.id, description: newDescription }));
    };

    const onExploderChange = (dimension: string): void => {
        const newDimension = thread!.exploderDimension === dimension ? undefined : dimension;
        dispatch(setThreadExploder({ threadId: thread!.id, exploderDimension: newDimension }));
    };

    const onFilterChange = (dimension: string, selected: string[]): void => {
        const newActiveFilters = {
            ...thread!.activeFilters,
            [dimension]: selected,
        };

        dispatch(setActiveThreadFilters(newActiveFilters));
    };

    const onSourceChange = (selectedSource: DataSourceDefinition): void => {
        dispatch(setActiveThreadSource(selectedSource));
    };

    const onPlotChange = (plot: DataPlotDefinition): void => {
        dispatch(setActiveThreadPlot(plot));
    };

    const dispatch = useAppDispatch();
    const { sources } = useSources();
    const sourceFilters = useSourceFilters(thread);

    return (
        <>
            <div className="flex flex-col p-6 w-1/3 h-full border-0 border-r border-gray-300">
                <SourceSelect sources={sources} selectedSource={thread.source} onSourceChange={onSourceChange} />
                <PlotSelect thread={thread} onPlotChange={onPlotChange} />
                <ThreadDescription thread={thread} onDescriptionChange={onDescriptionChange} />
            </div>
            <div className="flex flex-row p-6 w-2/3 h-full">
                {thread.source.id in sourceFilters ? (
                    <FilterSet
                        thread={thread}
                        filters={sourceFilters[thread.source.id]}
                        onFilterChange={onFilterChange}
                        onExploderChange={onExploderChange}
                    />
                ) : (
                    <Throbber />
                )}
            </div>
        </>
    );
};
