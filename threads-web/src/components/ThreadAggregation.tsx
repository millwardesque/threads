import React from 'react';

import { Thread } from '../models/Thread';
import { AggregationType } from '../models/Aggregation';
import { Select } from './molecules/Select';

interface ThreadAggregationProps {
    thread: Thread;
    onAggregationChange?: (newValue: AggregationType) => void;
}
export const ThreadAggregation: React.FC<ThreadAggregationProps> = ({ thread, onAggregationChange }) => {
    const onChange = (newValue: string) => {
        const newAggregation = newValue as AggregationType;
        if (onAggregationChange && newAggregation !== thread.aggregation) {
            onAggregationChange(newAggregation);
        }
    };

    const options = [
        { label: 'Daily', value: 'daily' },
        { label: 'Week-over-week', value: 'week-over-week' },
    ];

    return (
        <div className="flex flex-col pb-2">
            <Select
                id="aggregationSelector"
                label="Aggregation"
                options={options}
                selected={thread.aggregation}
                onChange={onChange}
            ></Select>
        </div>
    );
};
