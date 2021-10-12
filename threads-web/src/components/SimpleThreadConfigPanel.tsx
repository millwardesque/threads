import React from 'react';

import { useSources } from '../hooks/useSources';
import { useSourceFilters } from '../hooks/useSourceFilters';
import { useAppDispatch } from '../redux/hooks';
import { DataPlotDefinition, DataSourceDefinition } from '../models/DataSourceDefinition';
import { setActiveThreadFilters, setThreadExploder } from '../redux/threadsSlice';
import { SourceSelect } from './SourceSelect';
import { PlotSelect } from './PlotSelect';
import { SimpleThread } from '../models/Thread';
import { ThreadDescription } from './ThreadDescription';
import { ThreadSmoothing } from './ThreadSmoothing';
import { FilterSet } from './FilterSet';
import { Throbber } from './molecules/Throbber';

import {
    setActiveThreadSource,
    setActiveThreadPlot,
    setThreadDescription,
    setThreadSmoothing,
} from '../redux/threadsSlice';
import { SmoothingType } from '../models/Smoother';

interface SimpleThreadConfigPanelProps {
    thread: SimpleThread;
}

export const SimpleThreadConfigPanel: React.FC<SimpleThreadConfigPanelProps> = ({ thread }) => {
    const onDescriptionChange = (newDescription: string) => {
        dispatch(setThreadDescription({ threadId: thread!.id, description: newDescription }));
    };

    const onSmoothingChange = (smoothing: SmoothingType) => {
        dispatch(setThreadSmoothing({ threadId: thread!.id, smoothing }));
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
                <ThreadSmoothing thread={thread} onSmoothingChange={onSmoothingChange} />
            </div>
            <div className="flex flex-row p-6 w-2/3 h-full flex-wrap">
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
