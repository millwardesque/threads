import { ToggleButton } from './ToggleButton';

import React, { useState } from 'react';
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

/**
 * Summarizes the state of the multiselect
 * @param selected Currently selected options
 * @param options Available options
 * @returns A string summarizing the multiselect
 */
function getSummary(selected: string[], options: MultiSelectOption[]) {
    if (selected.length > 0 && selected.length === options.length) {
        return 'All';
    } else if (selected.length === 0 && options.length > 0) {
        return 'All';
    } else if (selected.length === 0 && options.length === 0) {
        return 'N/A';
    } else {
        return selected.join(', ');
    }
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

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

    const summary = getSummary(selected ?? [], options);

    const handleOnCollapse = () => {
        setIsCollapsed(true);
    };

    const handleToggle = (newValue: boolean) => {
        setIsCollapsed(newValue);
    };

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
        <div className="flex flex-col pb-2 w-80 max-w-xs relative">
            <label className="block" htmlFor={id}>
                {label}{' '}
                {selected && selected.length > 0 && selected.length !== options.length && (
                    <span>
                        ({selected.length ?? 0} / {options.length})
                    </span>
                )}
            </label>

            <div
                className="rounded border border-gray-200 bg-white px-2 py-1 text-right cursor-pointer flex flex-row justify-end"
                title={summary}
            >
                <div
                    className="flex-grow truncate"
                    onClick={() => {
                        handleToggle(isCollapsed ? false : true);
                    }}
                >
                    {summary}
                </div>
                <div className="flex-none">
                    <ToggleButton onToggle={handleToggle} isOn={isCollapsed} />
                </div>
            </div>

            {!isCollapsed && (
                <select
                    multiple
                    className="w-full absolute mt-16 text-right p-1 z-50"
                    onBlur={handleOnCollapse}
                    onChange={handleOnChange}
                    value={selected}
                >
                    {optionElements}
                </select>
            )}
        </div>
    );
};
