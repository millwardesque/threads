import React from 'react';
import { Color } from '../models/ColorProvider';

interface TabProps {
    id: string;
    label: string;
    onSelect?: (selectedTab: string) => void;
    onClose?: (selectedTab: string) => void;
    suppressClose: boolean;
    color: Color;
    isActive?: boolean;
}

export const Tab: React.FC<TabProps> = ({ id, label, onSelect, onClose, suppressClose, color, isActive = false }) => {
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
    };

    let styles = {
        color: color.dark,
        borderColor: color.dark,
    };
    let classes = 'max-w-sm px-4 py-2 cursor-pointer flex flex-row max-width-1/6 border-0 hover:bg-gray-50';
    if (isActive) {
        classes += ' border-b-2 font-bold';
    }

    return (
        <>
            {!isDeleted && (
                <div title={label} onClick={handleSelect} className={classes} style={styles}>
                    <div className="flex-grow truncate ...">{label}</div>
                    {!suppressClose && (
                        <div
                            className="flex-none ml-2 px-2 py-0 border border-gray-200 hover:border-opacity-100 hover:border-red-200 hover:bg-red-100"
                            onClick={handleClose}
                        >
                            &times;
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
