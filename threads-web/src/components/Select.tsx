import React, { useState } from 'react';

export interface SelectOption {
    label: string,
    value: string
};

interface SelectProps {
    id: string,
    label: string,
    options: SelectOption[],
    onChange?: (selected: string) => void,
};

export const Select: React.FC<SelectProps> = ({ id, label, options, onChange }) => {
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const optionElements = options.map(o => { return <option key={o.value} value={o.value}>{o.label}</option>; });

    const setSelectedWrapper = (selected: string): void => {
        setSelected(selected);
        if (onChange) {
            onChange(selected);
        }
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWrapper(event.target.value);
    };

    if (selected === undefined && options.length) {
        setSelectedWrapper(options[0].value);
    }

    return (
    <div>
        <label htmlFor={id}>
            {label}
        </label>
        <select id={id} onChange={handleOnChange} value={selected}>
            {optionElements}
        </select>
    </div>
    );
};
