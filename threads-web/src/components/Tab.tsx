import React from 'react';

interface TabProps {
    id: string,
    label: string,
    onSelect?: (selectedTab: string) => void,
    onClose?: (selectedTab: string) => void,
    suppressClose: boolean
};

export const Tab: React.FC<TabProps> = ({id, label, onSelect, onClose, suppressClose}) => {
    let isDeleted = false;

    const handleSelect = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        if (onSelect) {
            onSelect(id);
        }
    };

    const handleClose = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        if (onClose) {
            onClose(id);
        }
        isDeleted = true;
    }

    return (
        <>
        {!isDeleted &&
        <div onClick={handleSelect} className="border-2 border-b-0 border-red-300 bg-red-200 px-4 py-2 cursor-pointer">
            {label}
            { !suppressClose && <span onClick={handleClose}>X</span> }
        </div>
        }
        </>
    );
};