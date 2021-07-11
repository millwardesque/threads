import React, { useRef, useState } from 'react';
import { selectTitle, setTitle } from '../redux/pageSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useLayoutEffect } from 'react';

export const PageTitle: React.FC = () => {
    const dispatch = useAppDispatch();
    const title = useAppSelector(selectTitle);
    const inputElement = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [userTitle, setUserTitle] = useState<string>(title);

    const startEditing = () => {
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setUserTitle(title);
        setIsEditing(false);
    };

    const completeEditing = () => {
        dispatch(setTitle(userTitle));
        setIsEditing(false);
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserTitle(event.target.value);
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
                    value={userTitle}
                    onBlur={completeEditing}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                ></input>
            )}
            {!isEditing && (
                <h2 className="text-xl cursor-pointer font-bold text-white" onClick={startEditing}>
                    {title}
                </h2>
            )}
        </div>
    );
};
