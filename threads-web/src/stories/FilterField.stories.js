import React from 'react';

import { FilterField, FilterType } from '../FilterField';

export default {
    title: 'Example/Filter Field',
    component: FilterField,
    argTypes: {
        filterType: {
            control: {
                type: 'select',
                options: FilterType.map(t => t.value).sort(),
            }
        },
    },
};

const Template = (args) => <FilterField {...args} />;

export const Inactive = Template.bind({});
Inactive.args = {
    label: 'Inactive filter',
    id: 'inactiveFilter'
};
