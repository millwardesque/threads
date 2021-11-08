import { LineData } from './DataSourceDefinition';

export type AggregationType = 'daily' | 'week-over-week';

export interface AggregatedData {
    line: LineData;
    unitsOverride?: string;
}

export function getAggregationUnitsOverride(aggregator: AggregationType): string | undefined {
    switch (aggregator) {
        case 'daily':
            return undefined;
        case 'week-over-week':
            return '%';
        default:
            return undefined;
    }
}

export function aggregateLine(aggregator: AggregationType, line: LineData, dates: string[]): AggregatedData {
    let aggregatedData: LineData = {};
    switch (aggregator) {
        case 'daily':
            aggregatedData = noAggregation(line);
            break;
        case 'week-over-week':
            aggregatedData = weekOverWeekAggregation(line, dates);
            break;
        default:
            aggregatedData = noAggregation(line);
            break;
    }
    return {
        line: aggregatedData,
        unitsOverride: getAggregationUnitsOverride(aggregator),
    };
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
                wowLine[date] = (100.0 * (line[date] - line[prevWeek])) / line[prevWeek];
            } else {
                wowLine[date] = 0;
            }
        }
    }

    return wowLine;
}
