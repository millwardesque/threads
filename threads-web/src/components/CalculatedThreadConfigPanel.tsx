import React, { useState } from 'react';

import { AggregationType } from '../models/Aggregation';
import { SmoothingType } from '../models/Smoother';
import { CalculatedThread } from '../models/Thread';
import { useAppDispatch } from '../redux/hooks';
import {
    setCalculatedThreadFormula,
    setThreadAggregation,
    setThreadDescription,
    setThreadSmoothing,
    setThreadUnits,
} from '../redux/threadsSlice';
import { ThreadAggregation } from './ThreadAggregation';
import { ThreadFormula } from './ThreadFormula';
import { ThreadDescription } from './ThreadDescription';
import { ThreadSmoothing } from './ThreadSmoothing';
import { ThreadUnits } from './ThreadUnits';

interface CalculatedThreadConfigPanelProps {
    thread: CalculatedThread;
}

export const CalculatedThreadConfigPanel: React.FC<CalculatedThreadConfigPanelProps> = ({ thread }) => {
    const dispatch = useAppDispatch();
    const [hasValidFormula, setHasValidFormula] = useState<boolean>(true);

    const onFormulaChange = (newFormula: string) => {
        if (CalculatedThread.isValidFormula(newFormula)) {
            dispatch(setCalculatedThreadFormula({ threadId: thread!.id, formula: newFormula }));
            setHasValidFormula(true);
        } else {
            setHasValidFormula(false);
        }
    };

    const onAggregationChange = (aggregation: AggregationType) => {
        dispatch(setThreadAggregation({ threadId: thread!.id, aggregation }));
    };

    const onDescriptionChange = (newDescription: string) => {
        dispatch(setThreadDescription({ threadId: thread!.id, description: newDescription }));
    };

    const onSmoothingChange = (smoothing: SmoothingType) => {
        dispatch(setThreadSmoothing({ threadId: thread!.id, smoothing }));
    };

    const onUnitsChange = (newUnits: string) => {
        dispatch(setThreadUnits({ threadId: thread!.id, units: newUnits }));
    };

    return (
        <>
            <div className="flex flex-col p-6 w-1/3 h-full border-0 border-r border-gray-300">
                <ThreadDescription thread={thread} onDescriptionChange={onDescriptionChange} />
                <ThreadUnits thread={thread} onUnitsChange={onUnitsChange} />
                <ThreadAggregation thread={thread} onAggregationChange={onAggregationChange} />
                <ThreadSmoothing thread={thread} onSmoothingChange={onSmoothingChange} />
            </div>
            <div className="flex flex-col p-6 w-2/3 h-full">
                <ThreadFormula thread={thread} hasValidFormula={hasValidFormula} onFormulaChange={onFormulaChange} />
            </div>
        </>
    );
};
