import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

interface ToggleButtonProps {
    isOn: boolean;
    onToggle: (isOn: boolean) => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ isOn, onToggle }) => {
    const handleClick = () => {
        if (onToggle) {
            onToggle(isOn ? false : true);
        }
    };

    const chevronClasses = 'h-5 w-5 text-blue-500 border-l pl-1 ml-1 border-gray-200';
    return (
        <>
            {isOn && <ChevronDownIcon onClick={handleClick} className={chevronClasses}></ChevronDownIcon>}
            {!isOn && <ChevronUpIcon onClick={handleClick} className={chevronClasses}></ChevronUpIcon>}
        </>
    );
};
