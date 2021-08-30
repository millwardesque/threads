import React, { useLayoutEffect, useRef, useState } from 'react';
import { Color } from '../../models/ColorProvider';

interface TabProps {
    id: string;
    label: string;
    onSelect?: (selectedTab: string) => void;
    onClose?: (selectedTab: string) => void;
    suppressClose: boolean;
    color: Color;
    isActive?: boolean;
    onRename?: (tabId: string, newName: string) => void;
}

export const Tab: React.FC<TabProps> = ({
    id,
    label,
    onSelect,
    onClose,
    suppressClose,
    color,
    isActive = false,
    onRename,
}) => {
    const inputElement = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>(label);

    const startEditing = () => {
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setUserInput(label);
        setIsEditing(false);
    };

    const completeEditing = () => {
        if (onRename) {
            onRename(id, userInput);
        }

        setIsEditing(false);
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            completeEditing();
        } else if (event.key === 'Escape') {
            cancelEditing();
        }
    };

    useLayoutEffect(() => {
        if (isEditing && inputElement.current !== null) {
            inputElement.current.focus();
            inputElement.current.select();
        }
    }, [isEditing]);

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

    let isDeleted = false;
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
                    {isEditing && (
                        <input
                            ref={inputElement}
                            type="text"
                            value={userInput}
                            onBlur={completeEditing}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                        ></input>
                    )}
                    {!isEditing && (
                        <div
                            className="flex-grow truncate ..."
                            onClick={() => {
                                if (isActive && onRename) {
                                    startEditing();
                                }
                            }}
                        >
                            {label}
                        </div>
                    )}

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
