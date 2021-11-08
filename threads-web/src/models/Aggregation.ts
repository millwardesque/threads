import { LineData } from './DataSourceDefinition';

export type AggregationType = 'daily' | 'week-over-week';

export function aggregateLine(aggregator: AggregationType, line: LineData, dates: string[]): LineData {
    switch (aggregator) {
        case 'daily':
            return noAggregation(line);
        case 'week-over-week':
            return weekOverWeekAggregation(line, dates);
        default:
            return noAggregation(line);
    }
}

function noAggregation(line: LineData): LineData {
    return {
        ...line,
    };
}

function weekOverWeekAggregation(line: LineData, dates: string[]): LineData {
    const wowLine: LineData = {};
    const weekLength = 7;

    for (let i = 0; i < dates.length; ++i) {
        const date = dates[i];
        if (i - weekLength < 0) {
            continue;
        } else {
            const prevWeek = dates[i - weekLength];
            if (line[prevWeek] !== 0) {
                wowLine[date] = (line[date] - line[prevWeek]) / line[prevWeek];
            } else {
                wowLine[date] = 0;
            }
        }
    }

    return wowLine;
}
