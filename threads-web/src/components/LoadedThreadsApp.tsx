import { useEffect } from 'react';
import { DataSourceMap } from '../models/DataSourceDefinition';
import { Throbber } from './molecules/Throbber';
import { PageTitle } from './PageTitle';
import { ThreadsChart } from './ThreadsChart';
import { ThreadConfigPanel } from './ThreadConfigPanel';
import { ThreadTabs } from './ThreadTabs';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteThreadLines } from '../redux/linesSlice';
import {
    newSimpleThread,
    newAdhocThread,
    newCalculatedThread,
    deleteThread,
    duplicateThread,
    setActiveThread,
    selectActiveThread,
    selectAllThreads,
    selectOrderedThreads,
} from '../redux/threadsSlice';
import { ThreadType } from '../types';
import { Thread } from '../models/Thread';
import { useOrderedLines } from '../hooks/useLines';

interface LoadedThreadsAppProps {
    sources: DataSourceMap;
}

export const LoadedThreadsApp: React.FC<LoadedThreadsAppProps> = ({ sources }) => {
    const makeNewThread = (type: ThreadType) => {
        if (type === 'simple') {
            dispatch(newSimpleThread(Object.values(sources)[0]));
        } else if (type === 'adhoc') {
            dispatch(newAdhocThread());
        } else if (type === 'calculated') {
            dispatch(newCalculatedThread());
        } else {
            console.error(`Unable to make new thread: Unsupported thread type ${type}`);
        }
    };

    const makeDuplicateThread = (thread: Thread) => {
        dispatch(duplicateThread(thread));
    };

    const switchThread = (thread: Thread) => {
        dispatch(setActiveThread(thread));
    };

    const removeThread = (thread: Thread) => {
        dispatch(deleteThreadLines(thread.id));
        dispatch(deleteThread(thread.id));
    };

    const onTabClose = (thread: Thread) => {
        const threadList = Object.values(threads);
        const threadIndex = threadList.indexOf(thread);

        let newActiveThread: Thread | undefined = undefined;
        if (threadIndex < threadList.length - 1) {
            newActiveThread = threadList[threadIndex + 1];
        } else if (threadIndex > 0) {
            newActiveThread = threadList[threadIndex - 1];
        } else {
            // This code is likely unreachable because of the restrictions around closing the final tab, but just in case...
            throw new Error(
                `Attemting to close tab that shouldn't be closed. Thread ID ${thread.id}, Tab # ${threadIndex}.`
            );
        }

        switchThread(newActiveThread);
        removeThread(thread);
    };

    const dispatch = useAppDispatch();
    const threads = useAppSelector(selectAllThreads);
    const orderedThreads = useAppSelector(selectOrderedThreads);
    const activeThread = useAppSelector(selectActiveThread);
    const lines = useOrderedLines();

    useEffect(() => {
        if (Object.keys(threads).length === 0) {
            dispatch(newSimpleThread(Object.values(sources)[0]));
        }
    }, [sources, dispatch, threads]);

    useEffect(() => {
        if (!activeThread && Object.values(threads).length > 0) {
            dispatch(setActiveThread(Object.values(threads)[0]));
        }
    }, [threads, activeThread, dispatch]);

    return !activeThread ? (
        <Throbber />
    ) : (
        <>
            <div className="flex h-12">
                <PageTitle />
            </div>
            <div className="flex flex-col h-full width-full">
                <div className="row flex h-3/4 flex-col">
                    <div className="flex flex-row w-full h-full">
                        <div className="relative w-full h-full p-4">
                            <ThreadsChart id="chart" lines={lines} />
                        </div>
                    </div>
                </div>
                <div className="row flex flex-col h-1/4 absolute bottom-0 left-0 w-full">
                    <div className="tabs-area flex flex-row">
                        <ThreadTabs
                            threads={threads}
                            orderedThreads={orderedThreads}
                            activeThread={activeThread}
                            onSelectTab={switchThread}
                            onCloseTab={onTabClose}
                            onNewTab={makeNewThread}
                            onDuplicateThread={makeDuplicateThread}
                        />
                    </div>
                    <div className="config-area flex flex-row flex-auto bg-gray-100">
                        <ThreadConfigPanel thread={activeThread} />
                    </div>
                </div>
            </div>
        </>
    );
};
