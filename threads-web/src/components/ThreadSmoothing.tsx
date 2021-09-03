import React from 'react';

import { Thread } from '../models/Thread';
import { SmoothingType } from '../models/Smoother';
import { Select } from './molecules/Select';

interface ThreadSmoothingProps {
    thread: Thread;
    onSmoothingChange?: (newValue: SmoothingType) => void;
}
export const ThreadSmoothing: React.FC<ThreadSmoothingProps> = ({ thread, onSmoothingChange }) => {
    const onChange = (newValue: string) => {
        const newSmoothing = newValue as SmoothingType;
        if (onSmoothingChange && newSmoothing !== thread.smoothing) {
            onSmoothingChange(newSmoothing);
        }
    };

    const options = [
        { label: 'Daily', value: 'daily' },
        { label: '7-day trailing', value: '7-day trailing' },
        { label: '28-day trailing', value: '28-day trailing' },
    ];

    return (
        <div className="flex flex-col pb-2">
            <Select
                id="smoothingSelector"
                label="Smoothing"
                options={options}
                selected={thread.smoothing}
                onChange={onChange}
            ></Select>
        </div>
    );
};
