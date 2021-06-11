import React from 'react';

interface TabProps {
    id: string,
    label: string,
    onSelect?: (selectedTab: string) => void;
};

export const Tab: React.FC<TabProps> = ({id, label, onSelect}) => {
    const handleSelect = () => {
        if (onSelect) {
            onSelect(id);
        }
    };

    return (
    <div id={id} onClick={handleSelect} className="border-2 border-b-0 border-red-300 bg-red-200 px-4 py-2 cursor-pointer">
        {label}
    </div>
    );
};