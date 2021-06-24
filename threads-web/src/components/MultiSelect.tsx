import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface MultiSelectOption {
    label: string;
    value: string;
}

interface MultiSelectProps {
    label: string;
    options: MultiSelectOption[];
    selected?: string[];
    onChange?: (selected: string[]) => void;
}

const ALL_VALUE = '_all_';

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const optionElements = options.map((o) => (
        <option key={o.value} value={o.value}>
            {o.label}
        </option>
    ));
    optionElements.unshift(
        <option key={ALL_VALUE} value={ALL_VALUE}>
            -All-
        </option>
    );
    const id = uuidv4();

    const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptionElements = event.target.selectedOptions;
        let selectedOptions: string[] = [];

        if (selectedOptionElements.length === 1 && selectedOptionElements.item(0)!.value === ALL_VALUE) {
            selectedOptions = options.map((o) => o.value);
        } else {
            for (let i = 0; i < selectedOptionElements.length; ++i) {
                const value = selectedOptionElements.item(i)!.value;
                if (value !== ALL_VALUE) {
                    selectedOptions.push(selectedOptionElements.item(i)!.value);
                }
            }
        }

        if (onChange) {
            onChange(selectedOptions);
        }
    };

    return (
        <div className="flex flex-col pb-2">
            <label className="block" htmlFor={id}>
                {label}{' '}
                {selected && selected.length > 0 && (
                    <span>
                        ({selected.length ?? 0} / {options.length})
                    </span>
                )}
            </label>
            <select multiple onChange={handleOnChange} value={selected}>
                {optionElements}
            </select>
        </div>
    );
};
