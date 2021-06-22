import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface MultiSelectOption {
    label: string,
    value: string
};

interface MultiSelectProps {
    label: string,
    options: MultiSelectOption[],
    selected?: string[],
    onChange?: (selected: string[]) => void,
};

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const optionElements = options.map(o => <option key={o.value} value={o.value}>{o.label}</option>);
    const id = uuidv4();

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
            {label} {selected && selected.length > 0 && <span>({selected.length ?? 0} / {options.length})</span>}
        </label>
        <select multiple onChange={handleOnChange} value={selected}>
            {optionElements}
        </select>
    </div>
    );
};
