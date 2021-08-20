import React from 'react';

import { Color } from '../models/ColorProvider';
import useColorProvider from '../hooks/useColorProvider';
import { Thread } from '../models/Thread';
import { ThreadType } from '../types';
import { Tab } from './Tab';
import { useAppDispatch } from '../redux/hooks';
import { setThreadLabel } from '../redux/threadsSlice';

interface ThreadTabsProps {
    threads: {
        [id: string]: Thread;
    };
    orderedThreads: Array<Thread>;
    activeThread: Thread;
    onSelectTab: (thread: Thread) => void;
    onCloseTab: (thread: Thread) => void;
    onNewTab: (type: ThreadType) => void;
}

export const ThreadTabs: React.FC<ThreadTabsProps> = ({
    threads,
    orderedThreads,
    activeThread,
    onSelectTab,
    onCloseTab,
    onNewTab,
}) => {
    const handleSelectTab = (tabId: string) => {
        console.log('Requesting tab select', tabId);
        if (!(tabId in threads)) {
            console.warn(`Unable to select tab with ID '${tabId}': No thread with that ID exists.`, threads);
        } else if (onSelectTab) {
            onSelectTab(threads[tabId]);
        }
    };

    const handleCloseTab = (tabId: string) => {
        console.log('Requesting tab close', tabId);
        if (!(tabId in threads)) {
            console.warn(`Unable to close tab with ID '${tabId}': No thread with that ID exists.`);
        } else if (onCloseTab) {
            onCloseTab(threads[tabId]);
        }
    };

    const handleNewSimpleTab = () => {
        console.log('Requesting new simple tab');
        if (onNewTab) {
            onNewTab('simple');
        }
    };

    const handleNewAdhocTab = () => {
        console.log('Requesting new adhoc tab');
        if (onNewTab) {
            onNewTab('adhoc');
        }
    };

    const tabs = orderedThreads.map((thread, index) => {
        return {
            id: thread.id,
            index,
            label: `${index + 1}. ${thread.getLabel()}`,
            isActive: thread === activeThread,
            thread,
        };
    });

    const dispatch = useAppDispatch();
    const colors = useColorProvider();
    const tabElements = tabs.map((t, index) => {
        return (
            <Tab
                key={t.id}
                id={t.id}
                label={t.label}
                isActive={t.isActive}
                color={colors.atIndex(index)}
                onSelect={handleSelectTab}
                onClose={handleCloseTab}
                suppressClose={index === 0 && tabs.length === 1}
                onRename={(_tabId, newName) => {
                    dispatch(setThreadLabel({ threadId: t.id, label: newName }));
                }}
            ></Tab>
        );
    });
    const greyTab: Color = {
        light: '#ddd',
        dark: '#999',
    };

    return (
        <div className="flex w-full overflow-x-auto">
            <Tab
                key="tabSimpleNew"
                id="tabNew"
                label="+ Thread"
                onSelect={handleNewSimpleTab}
                suppressClose={true}
                color={greyTab}
            />
            <Tab
                key="tabAdhocNew"
                id="tabNew"
                label="+ Adhoc"
                onSelect={handleNewAdhocTab}
                suppressClose={true}
                color={greyTab}
            />
            {tabElements}
        </div>
    );
};
