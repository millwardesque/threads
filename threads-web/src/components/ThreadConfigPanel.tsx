import React from 'react';

import { Thread } from '../types';
import { SimpleThreadConfigPanel } from './SimpleThreadConfigPanel';
import { AdhocThreadConfigPanel } from './AdhocThreadConfigPanel';

interface ThreadConfigPanelProps {
    thread: Thread;
}

export const ThreadConfigPanel: React.FC<ThreadConfigPanelProps> = ({ thread }) => {
    return (
        <>
            {thread.type === 'adhoc' && <AdhocThreadConfigPanel thread={thread} />}
            {thread.type === 'simple' && <SimpleThreadConfigPanel thread={thread} />}
        </>
    );
};
