import React, { useCallback } from 'react';

import { DateRangeOption } from '../types';
import { Select } from './molecules/Select';

const DATE_SELECTOR_OPTIONS: Array<{ label: string; value: DateRangeOption }> = [
    {
        label: 'Trailing month',
        value: 'trailing-month',
    },
    {
        label: 'Trailing 3 months',
        value: 'trailing-3-months',
    },
    {
        label: 'Trailing year',
        value: 'trailing-year',
    },
    {
        label: 'All time',
        value: 'all-time',
    },
];

export interface DateSelectorProps {
    selectedDateRange: DateRangeOption;
    onChange: (newValue: DateRangeOption) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDateRange, onChange }) => {
    const handleChange = useCallback(
        (selected: string) => {
            // @TODO Make Select return values of types other than string.
            onChange(selected as DateRangeOption);
        },
        [onChange]
    );

    return (
        <Select
            id="datePicker"
            label=""
            options={DATE_SELECTOR_OPTIONS}
            selected={selectedDateRange}
            onChange={handleChange}
        />
    );
};
