import React from 'react';

import { StandaloneInput } from './StandaloneInput';

interface ThreadDataInputProps {
    initialData: string[];
    hasValidData: boolean;
    onThreadDataChange?: (newValue: string[]) => void;
}
export const ThreadDataInput: React.FC<ThreadDataInputProps> = ({ initialData, hasValidData, onThreadDataChange }) => {
    const elementId = 'threadDataInput';

    const onComplete = (newValue: string) => {
        const newDataAsArray = newValue.split('\n');
        if (onThreadDataChange && newDataAsArray !== initialData) {
            console.log('Data changed');
            onThreadDataChange(newDataAsArray);
        }
    };

    let labelClasses = 'block';
    let inputClasses = '';
    if (!hasValidData) {
        labelClasses += ' text-red-700 ';
        inputClasses += ' border border-red-300 ';
    }

    return (
        <div className="flex flex-col pb-2">
            <label className={labelClasses} htmlFor={elementId}>
                Data {!hasValidData ? '[Invalid]' : ''}
            </label>
            <StandaloneInput
                initialValue={initialData.join('\n')}
                isMultiline={true}
                onComplete={onComplete}
                placeholder="CSV data without a header row in the format 'YYYY-MM-DD,metric_value'"
                classes={inputClasses}
            ></StandaloneInput>
            <div>Sample data</div>
            <pre>
                2020-05-30, 250000
                <br />
                2020-05-31, 275000
                <br />
                2020-06-01, 52000
            </pre>
        </div>
    );
};
