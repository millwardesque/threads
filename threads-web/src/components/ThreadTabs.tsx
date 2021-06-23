import React from 'react';

import { Thread } from '../types';
import { Tab } from './Tab';

interface ThreadTabsProps {
    threads: {
        [id: string]: Thread,
    },
    onSelectTab: (thread: Thread) => void,
    onCloseTab: (thread: Thread) => void,
    onNewTab: () => void,
};

export const ThreadTabs: React.FC<ThreadTabsProps> = ({threads, onSelectTab, onCloseTab, onNewTab}) => {
    const handleSelectTab = (tabId: string) => {
        console.log("Requesting tab select", tabId);
        if (!(tabId in threads)) {
            console.warn(`Unable to select tab with ID '${tabId}': No thread with that ID exists.`);
        }
        else if (onSelectTab) {
            onSelectTab(threads[tabId]);
        }
    };

    const handleCloseTab = (tabId: string) => {
        console.log("Requesting tab close", tabId);
        if (!(tabId in threads)) {
            console.warn(`Unable to close tab with ID '${tabId}': No thread with that ID exists.`);
        }
        else if (onCloseTab) {
            onCloseTab(threads[tabId]);
        }
    };

    const handleNewTab = () => {
        console.log("Requesting new tab");
        if (onNewTab) {
            onNewTab();
        }
    };

    const tabs = Object.values(threads).map((thread) => {
        return {
            id: thread.id,
            label: `${thread.source?.label}: ${thread.plot?.label}`,
            thread
        };
    });

    const tabElements = tabs.map((t, index) => <Tab id={t.id} label={t.label} onSelect={handleSelectTab} onClose={handleCloseTab} suppressClose={index === 0 && tabs.length === 1}></Tab>);

    return (
        <div className="flex">
            {tabElements}
            <Tab id="tabNew" label="+" onSelect={handleNewTab} suppressClose={true} />
        </div>
    );
}