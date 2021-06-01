import React from 'react';
import PropTypes from 'prop-types';

export const FilterType = {
    'ONE_OF': 'One of',
    'EXACTLY': 'Exactly',
    'CONTAINS': 'Contains',
    'ANY_OF': 'Any of',
    'NONE_OF': 'None of',
};

/**
 * UI field for filtering data
 */
export default class FilterField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filterDefinition: "",
            filterType: 'EXACTLY',
        };
    }

    render() {
        let inputElement;
        switch(this.state.filterType) {
            default:
                inputElement = <input
                    type="text"
                    id="{id}"
                    {...this.props}
                />;
        }
        return (
            <div class="filterfield">
                <label for="{this.props.id}">{this.props.label} [{this.state.filterType}]</label>
                {inputElement}
            </div>
        );
    }
}

FilterField.propTypes = {
    /**
     * Field ID
     */
    id: PropTypes.string.isRequired,

    /**
     * Field label
     */
    label: PropTypes.string.isRequired,

    /**
     * Filter type
     */
    filterType: PropTypes.string.isRequired,

    /**
     * Choices
     */
    choices: PropTypes.string,
};

FilterField.defaultProps = {
    filterType: 'EXACTLY',
    choices: null,
};

