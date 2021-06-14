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
        <div onClick={handleSelect} className="border-2 border-b-0 max-w-sm border-red-300 bg-red-200 px-4 py-2 cursor-pointer flex flex-row max-width-1/6">
            <div className="flex-grow truncate ...">{label}</div>
            { !suppressClose && <div className="flex-none ml-2" onClick={handleClose}>X</div> }
        </div>
        }
        </>
    );
};