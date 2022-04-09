import React from 'react';

import { useSources } from '../hooks/useSources';
import { useSourceFilters } from '../hooks/useSourceFilters';
import { useAppDispatch } from '../redux/hooks';
import { DataPlotDefinition, DataSourceDefinition } from '../models/DataSourceDefinition';
import { setActiveThreadFilters, setThreadAggregation, setThreadExploder } from '../redux/threadsSlice';
import { SourceSelect } from './SourceSelect';
import { PlotSelect } from './PlotSelect';
import { SimpleThread } from '../models/Thread';
import { ThreadDescription } from './ThreadDescription';
import { ThreadAggregation } from './ThreadAggregation';
import { ThreadSmoothing } from './ThreadSmoothing';
import { FilterSet } from './FilterSet';
import { Throbber } from './molecules/Throbber';

import {
    setActiveThreadSource,
    setActiveThreadPlot,
    setThreadDescription,
    setThreadSmoothing,
} from '../redux/threadsSlice';
import { AggregationType } from '../models/Aggregation';
import { SmoothingType } from '../models/Smoother';
import { ExploderType } from '../types';

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

    const onAggregationChange = (aggregation: AggregationType) => {
        dispatch(setThreadAggregation({ threadId: thread!.id, aggregation }));
    };

    const onExploderChange = (dimension: string, type: ExploderType | undefined): void => {
        const isCurrentExploder = thread.exploderDimension === dimension && thread.exploderType === type;
        const newDimension = isCurrentExploder ? undefined : dimension;
        const newType = isCurrentExploder ? undefined : type;
        dispatch(setThreadExploder({ threadId: thread.id, exploderDimension: newDimension, exploderType: newType }));
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
                <ThreadAggregation thread={thread} onAggregationChange={onAggregationChange} />
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
