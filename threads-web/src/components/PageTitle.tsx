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

    const stopEditing = () => {
        dispatch(setTitle(userTitle));
        setIsEditing(false);
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserTitle(event.target.value);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && inputElement.current) {
            setUserTitle(inputElement.current.value);
            dispatch(setTitle(inputElement.current.value));
            setIsEditing(false);
        } else if (event.key === 'Escape') {
            setUserTitle(title);
            setIsEditing(false);
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
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onBlur={stopEditing}
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
