import React from 'react';

import { AdhocThread } from '../models/Thread';
import { StandaloneInput } from './StandaloneInput';

interface ThreadDataInputProps {
    thread: AdhocThread;
    onThreadDataChange?: (newValue: string[]) => void;
}
export const ThreadDataInput: React.FC<ThreadDataInputProps> = ({ thread, onThreadDataChange }) => {
    const elementId = 'threadDataInput';

    const onComplete = (newValue: string) => {
        const newDataAsArray = newValue.split('\n');
        if (onThreadDataChange && newDataAsArray !== thread.adhocData) {
            onThreadDataChange(newDataAsArray);
        }
    };

    return (
        <div className="flex flex-col pb-2">
            <label className="block" htmlFor={elementId}>
                Data
            </label>
            <StandaloneInput
                initialValue={thread.adhocData.join('\n')}
                isMultiline={true}
                onComplete={onComplete}
                placeholder="CSV data without a header row in the format 'YYYY-MM-DD,metric_value'"
            ></StandaloneInput>
        </div>
    );
};
