import React from 'react';

import { CalculatedThread } from '../models/Thread';
import { StandaloneInput } from './molecules/StandaloneInput';

interface ThreadFormulaProps {
    thread: CalculatedThread;
    hasValidFormula: boolean;
    onFormulaChange?: (newValue: string) => void;
}

export const ThreadFormula: React.FC<ThreadFormulaProps> = ({ thread, hasValidFormula, onFormulaChange }) => {
    const onComplete = (newValue: string) => {
        if (onFormulaChange) {
            onFormulaChange(newValue);
        }
    };

    let labelClasses = 'block';
    let inputClasses = '';
    if (!hasValidFormula) {
        labelClasses += ' text-red-700 ';
        inputClasses += ' border border-red-300 ';
    }

    return (
        <div className="flex flex-col pb-2">
            <label className={labelClasses}>Formula {!hasValidFormula ? '[Invalid]' : ''}</label>
            <StandaloneInput
                initialValue={thread.formula}
                isMultiline={false}
                onComplete={onComplete}
                placeholder="Formula for the line"
                classes={inputClasses}
            ></StandaloneInput>
        </div>
    );
};
