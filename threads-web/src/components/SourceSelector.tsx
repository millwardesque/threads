import React from 'react';

export interface SelectOption {
    label: string,
     value: string
};

interface SourceSelectorProps {
    id: string,
    label: string,
    options: SelectOption[]
};

export const SourceSelector: React.FC<SourceSelectorProps> = ({ id, label, options}) => {
    const optionElements = options.map(o => { return <option key="{o.value}" value={o.value}>{o.label}</option>; });

    return (
    <div>
        <label htmlFor={id}>
            {label}
        </label>
        <select id={id}>
            {optionElements}
        </select>
    </div>
    );
};
