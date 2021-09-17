import React from 'react';

interface ButtonProps {
    label: string;
    onClick?: () => void;
}
export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
    const buttonClasses =
        'cursor-pointer bg-gray-200 hover:bg-gray-300 border text-xs font-bold py-1 px-2 rounded border-gray-500 text-gray-700';

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return <input className={buttonClasses} type="button" value={label} onClick={handleClick} />;
};
