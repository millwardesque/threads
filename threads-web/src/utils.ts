import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { DateRangeOption, LineDefinition } from './types';

const moment = extendMoment(Moment);
const DATE_FORMAT = 'YYYY-MM-DD';

export const getDateRangeFromLines = (
    lines: LineDefinition[],
    minAllowedDate?: string,
    maxAllowedDate?: string
): string[] => {
    let minDate: string | undefined = undefined,
        maxDate: string | undefined = undefined;

    lines.forEach((l) => {
        const lineDates = Object.keys(l.data ?? {});
        lineDates.forEach((d) => {
            if (!minDate || d < minDate) {
                minDate = d;
            }
            if (!maxDate || d > maxDate) {
                maxDate = d;
            }
        });
    });

    if (minAllowedDate && minDate) {
        minDate = minDate < minAllowedDate ? minAllowedDate : minDate;
    }

    if (maxAllowedDate && maxDate) {
        maxDate = maxDate > maxAllowedDate ? maxAllowedDate : maxDate;
    }

    const momentRange = moment.range(moment(minDate, DATE_FORMAT), moment(maxDate, DATE_FORMAT));
    const stringRange = Array.from(momentRange.by('days')).map((d) => d.format(DATE_FORMAT));
    return stringRange;
};

export const getDateRangeFromDateRangeOption = (dateRange: DateRangeOption): string[] => {
    const today = moment();
    const maxDate = today.format(DATE_FORMAT);

    let minDate = '1900-01-01';
    switch (dateRange) {
        case 'trailing-month':
            minDate = today.subtract(1, 'months').format(DATE_FORMAT);
            break;
        case 'trailing-3-months':
            minDate = today.subtract(3, 'months').format(DATE_FORMAT);
            break;
        case 'trailing-year':
            minDate = today.subtract(1, 'years').format(DATE_FORMAT);
            break;
        case 'all-time':
            break;
        default:
            break;
    }
    return [minDate, maxDate];
};
