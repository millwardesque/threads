import React from 'react';

import { AdhocThread, CalculatedThread, SimpleThread, Thread } from '../models/Thread';
import { SimpleThreadConfigPanel } from './SimpleThreadConfigPanel';
import { AdhocThreadConfigPanel } from './AdhocThreadConfigPanel';
import { CalculatedThreadConfigPanel } from './CalculatedThreadConfigPanel';

interface ThreadConfigPanelProps {
    thread: Thread;
}

export const ThreadConfigPanel: React.FC<ThreadConfigPanelProps> = ({ thread }) => {
    return (
        <>
            {thread.type === 'adhoc' && <AdhocThreadConfigPanel thread={thread as AdhocThread} />}
            {thread.type === 'calculated' && <CalculatedThreadConfigPanel thread={thread as CalculatedThread} />}
            {thread.type === 'simple' && <SimpleThreadConfigPanel thread={thread as SimpleThread} />}
        </>
    );
};
