import React from 'react';

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    id: string;
    label: string;
    options: SelectOption[];
    selected?: string;
    onChange?: (selected: string) => void;
}

export const Select: React.FC<SelectProps> = ({ id, label, options, selected, onChange }) => {
    const optionElements = options.map((o) => (
        <option key={o.value} value={o.value}>
            {o.label}
        </option>
    ));

    const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
            onChange(event.target.value);
        }
    };

    return (
        <div className="flex flex-col pb-2">
            <label className="block" htmlFor={id}>
                {label}
            </label>
            <select id={id} onChange={handleOnChange} value={selected}>
                {optionElements}
            </select>
        </div>
    );
};
