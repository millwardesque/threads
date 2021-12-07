import React from 'react';

import { CalculatedThread } from '../models/Thread';
import { StandaloneInput } from './molecules/StandaloneInput';

interface ThreadFormulaProps {
    thread: CalculatedThread;
    onFormulaChange?: (newValue: string) => void;
}

export const ThreadFormula: React.FC<ThreadFormulaProps> = ({ thread, onFormulaChange }) => {
    const onComplete = (newValue: string) => {
        if (onFormulaChange) {
            onFormulaChange(newValue);
        }
    };

    return (
        <div className="flex flex-col pb-2">
            <label className="block">Formula</label>
            <StandaloneInput
                initialValue={thread.formula}
                isMultiline={false}
                onComplete={onComplete}
                placeholder="Formula for the line"
            ></StandaloneInput>
        </div>
    );
};
