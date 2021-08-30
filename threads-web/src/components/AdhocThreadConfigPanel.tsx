import React, { useState } from 'react';
import { LineData } from '../models/DataSourceDefinition';

import { AdhocThread } from '../models/Thread';
import { useAppDispatch } from '../redux/hooks';
import { setAdhocThreadData, setThreadDescription, setThreadUnits } from '../redux/threadsSlice';
import { ThreadDataInput } from './ThreadDataInput';
import { ThreadDescription } from './ThreadDescription';
import { ThreadUnits } from './ThreadUnits';

interface AdhocThreadConfigPanelProps {
    thread: AdhocThread;
}

interface CleanDatum {
    date: string | undefined;
    rawValue: string | undefined;
}

export const AdhocThreadConfigPanel: React.FC<AdhocThreadConfigPanelProps> = ({ thread }) => {
    const [hasValidData, setHasValidData] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    const onThreadDataChange = (newData: string[]) => {
        const cleanedData = cleanThreadData(newData);
        if (validateThreadData(cleanedData)) {
            const adhocData: LineData = {};
            cleanedData.forEach((l) => {
                adhocData[l.date!] = Number(l.rawValue!);
            });

            setHasValidData(true);
            dispatch(setAdhocThreadData({ threadId: thread!.id, data: adhocData }));
        } else {
            setHasValidData(false);
        }
    };

    const cleanThreadData = (newData: string[]): CleanDatum[] => {
        let cleanData: CleanDatum[] = [];
        newData.forEach((l) => {
            const trimmedLine = l.trim();
            if (trimmedLine) {
                const [date, value] = trimmedLine.split(',');
                const trimmedDate = date ? date.trim() : undefined;
                const trimmedValue = value ? value.trim() : undefined;
                cleanData.push({
                    date: trimmedDate,
                    rawValue: trimmedValue,
                });
            }
        });

        return cleanData;
    };

    const validateThreadData = (newData: CleanDatum[]): boolean => {
        let datesAreValid = true;
        let valuesAreValid = true;

        newData.forEach((l) => {
            const { date, rawValue } = l;
            if (date === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                datesAreValid = false;
            }

            if (rawValue === undefined || isNaN(Number(rawValue))) {
                valuesAreValid = false;
            }
        });

        return datesAreValid && valuesAreValid;
    };

    const onDescriptionChange = (newDescription: string) => {
        dispatch(setThreadDescription({ threadId: thread!.id, description: newDescription }));
    };

    const onUnitsChange = (newUnits: string) => {
        dispatch(setThreadUnits({ threadId: thread!.id, units: newUnits }));
    };

    return (
        <>
            <div className="flex flex-col p-6 w-1/3 h-full border-0 border-r border-gray-300">
                <ThreadDescription thread={thread} onDescriptionChange={onDescriptionChange} />
                <ThreadUnits thread={thread} onUnitsChange={onUnitsChange} />
            </div>
            <div className="flex flex-col p-6 w-2/3 h-full">
                <ThreadDataInput
                    initialData={Object.keys(thread.adhocData)
                        .sort()
                        .map((l) => {
                            return `${l}, ${thread.adhocData[l]}`;
                        })}
                    onThreadDataChange={onThreadDataChange}
                    hasValidData={hasValidData}
                />
            </div>
        </>
    );
};
