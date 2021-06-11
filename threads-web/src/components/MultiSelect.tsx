import React from 'react';

export interface MultiSelectOption {
    label: string,
    value: string
};

interface MultiSelectProps {
    id: string,
    label: string,
    options: MultiSelectOption[],
    selected?: string[],
    onChange?: (selected: string[]) => void,
};

export const MultiSelect: React.FC<MultiSelectProps> = ({ id, label, options, selected, onChange }) => {
    const optionElements = options.map(o => <option key={o.value} value={o.value}>{o.label}</option>);

    const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptionElements = event.target.selectedOptions;
        let selectedOptions: string[] = [];

        if (selectedOptionElements.length < options.length) {
            for (let i = 0; i < selectedOptionElements.length; ++i) {
                selectedOptions.push(selectedOptionElements.item(i)!.value);
            }
        }

        if (onChange) {
            onChange(selectedOptions);
        }
    };

    return (
    <div className="flex flex-col pb-2">
        <label className="block" htmlFor={id}>
            {label}
        </label>
        <select id={id} multiple onChange={handleOnChange} value={selected}>
            {optionElements}
        </select>
    </div>
    );
};
