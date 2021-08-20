import React from 'react';

import { AdhocThread, SimpleThread, Thread } from '../models/Thread';
import { SimpleThreadConfigPanel } from './SimpleThreadConfigPanel';
import { AdhocThreadConfigPanel } from './AdhocThreadConfigPanel';

interface ThreadConfigPanelProps {
    thread: Thread;
}

export const ThreadConfigPanel: React.FC<ThreadConfigPanelProps> = ({ thread }) => {
    return (
        <>
            {thread.type === 'adhoc' && <AdhocThreadConfigPanel thread={thread as AdhocThread} />}
            {thread.type === 'simple' && <SimpleThreadConfigPanel thread={thread as SimpleThread} />}
        </>
    );
};
