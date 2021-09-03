import React, { useState } from 'react';

import { SmoothingType } from '../models/Smoother';
import { AdhocThread } from '../models/Thread';
import { useAppDispatch } from '../redux/hooks';
import { setAdhocThreadData, setThreadDescription, setThreadSmoothing, setThreadUnits } from '../redux/threadsSlice';
import { ThreadDataInput } from './ThreadDataInput';
import { ThreadDescription } from './ThreadDescription';
import { ThreadSmoothing } from './ThreadSmoothing';
import { ThreadUnits } from './ThreadUnits';

interface AdhocThreadConfigPanelProps {
    thread: AdhocThread;
}

export const AdhocThreadConfigPanel: React.FC<AdhocThreadConfigPanelProps> = ({ thread }) => {
    const [hasValidData, setHasValidData] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    const onThreadDataChange = (newData: string[]) => {
        const cleanedData = AdhocThread.cleanAdhocDataFromStrings(newData);
        if (AdhocThread.isValidAdhocData(cleanedData)) {
            const adhocData = AdhocThread.adhocDataToLineData(cleanedData);

            setHasValidData(true);
            dispatch(setAdhocThreadData({ threadId: thread!.id, data: adhocData }));
        } else {
            setHasValidData(false);
        }
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
                <ThreadSmoothing thread={thread} onSmoothingChange={onSmoothingChange} />
            </div>
            <div className="flex flex-col p-6 w-2/3 h-full">
                <ThreadDataInput
                    initialData={thread.adhocData}
                    onThreadDataChange={onThreadDataChange}
                    hasValidData={hasValidData}
                />
            </div>
        </>
    );
};
