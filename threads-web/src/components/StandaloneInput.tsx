import React, { useEffect, useRef, useState } from 'react';

interface StandaloneInputProps {
    initialValue: string;
    onComplete?: (newValue: string) => void;
    placeholder?: string;
    isMultiline: boolean;
    classes?: string;
}

export const StandaloneInput: React.FC<StandaloneInputProps> = ({
    initialValue,
    placeholder,
    isMultiline,
    onComplete,
    classes,
}) => {
    const inputElement = useRef(null);
    const [userInput, setUserInput] = useState<string>(initialValue);

    const cancelEditing = () => {
        setUserInput(initialValue);
    };

    const completeEditing = () => {
        if (onComplete) {
            onComplete(userInput);
        }
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserInput(event.target.value);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            completeEditing();
        } else if (event.key === 'Escape') {
            cancelEditing();
        }
    };

    useEffect(() => {
        // Reset the user input whenever the initial value changes since this implies we're no longer using the same upstream piece of data
        setUserInput(initialValue);
    }, [initialValue]);

    return (
        <>
            {!isMultiline && (
                <input
                    ref={inputElement}
                    type="text"
                    value={userInput}
                    placeholder={placeholder}
                    onBlur={completeEditing}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    className={classes}
                ></input>
            )}
            {isMultiline && (
                <textarea
                    ref={inputElement}
                    value={userInput}
                    placeholder={placeholder}
                    onBlur={completeEditing}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    className={classes}
                ></textarea>
            )}
        </>
    );
};
