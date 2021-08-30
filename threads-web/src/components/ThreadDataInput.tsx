import React from 'react';
import { LineData } from '../models/DataSourceDefinition';

import { StandaloneInput } from './molecules/StandaloneInput';

interface ThreadDataInputProps {
    initialData: LineData;
    hasValidData: boolean;
    onThreadDataChange?: (newValue: string[]) => void;
}
export const ThreadDataInput: React.FC<ThreadDataInputProps> = ({ initialData, hasValidData, onThreadDataChange }) => {
    const elementId = 'threadDataInput';

    const onComplete = (newValue: string) => {
        if (onThreadDataChange && newValue !== initialDataAsString) {
            console.log('Data changed');
            const newDataAsArray = newValue.split('\n');
            onThreadDataChange(newDataAsArray);
        }
    };

    const initialDataAsString = Object.keys(initialData)
        .sort()
        .map((l) => {
            return `${l}, ${initialData[l]}`;
        })
        .join('\n');

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
                initialValue={initialDataAsString}
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
