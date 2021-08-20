import React from 'react';

import { Thread } from '../models/Thread';
import { StandaloneInput } from './StandaloneInput';

interface ThreadUnitsProps {
    thread: Thread;
    onUnitsChange?: (newValue: string) => void;
}

export const ThreadUnits: React.FC<ThreadUnitsProps> = ({ thread, onUnitsChange }) => {
    const elementId = 'threadUnits';

    const onComplete = (newValue: string) => {
        if (onUnitsChange && newValue !== thread.getUnits()) {
            onUnitsChange(newValue);
        }
    };

    return (
        <div className="flex flex-col pb-2">
            <label className="block" htmlFor={elementId}>
                Units
            </label>
            <StandaloneInput
                initialValue={thread.getUnits()}
                isMultiline={false}
                onComplete={onComplete}
                placeholder="Units for this data"
            ></StandaloneInput>
        </div>
    );
};
