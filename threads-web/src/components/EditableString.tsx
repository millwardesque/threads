import React, { useRef, useState } from 'react';
import { useLayoutEffect } from 'react';

interface EditableStringProps {
    initialValue: string;
    onComplete?: (newValue: string) => void;
}

export const EditableString: React.FC<EditableStringProps> = ({ initialValue, onComplete }) => {
    const inputElement = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>(initialValue);

    const startEditing = () => {
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setUserInput(initialValue);
        setIsEditing(false);
    };

    const completeEditing = () => {
        if (onComplete) {
            onComplete(userInput);
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
        }
    }, [isEditing]);

    return (
        <div className="flex w-full h-12 bg-green-400 items-center justify-center">
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
                <h2 className="text-xl cursor-pointer font-bold text-white" onClick={startEditing}>
                    {initialValue}
                </h2>
            )}
        </div>
    );
};
