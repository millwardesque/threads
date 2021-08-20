import React from 'react';

import { Thread } from '../models/Thread';
import { StandaloneInput } from './StandaloneInput';

interface ThreadDescriptionProps {
    thread: Thread;
    onDescriptionChange?: (newValue: string) => void;
}
export const ThreadDescription: React.FC<ThreadDescriptionProps> = ({ thread, onDescriptionChange }) => {
    const elementId = 'threadDescription';

    const onComplete = (newValue: string) => {
        if (onDescriptionChange && newValue !== thread.description) {
            onDescriptionChange(newValue);
        }
    };

    return (
        <div className="flex flex-col pb-2">
            <label className="block" htmlFor={elementId}>
                Description
            </label>
            <StandaloneInput
                initialValue={thread.description}
                isMultiline={true}
                onComplete={onComplete}
                placeholder="Add description, notes, etc. for this thread"
            ></StandaloneInput>
        </div>
    );
};
