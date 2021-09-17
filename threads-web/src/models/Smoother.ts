import { LineData } from './DataSourceDefinition';

export type SmoothingType = 'daily' | '7-day trailing' | '28-day trailing';

export function smoothLine(smoothing: SmoothingType, line: LineData, dates: string[]): LineData {
    switch (smoothing) {
        case 'daily':
            return noSmoothing(line);
        case '7-day trailing':
            return trailingSmoothing(line, dates, 7);
        case '28-day trailing':
            return trailingSmoothing(line, dates, 28);
        default:
            return fixedValueSmoothing(line);
    }
}

function fixedValueSmoothing(line: LineData, fixedValue: number = -1.0): LineData {
    const smoothed: LineData = {};
    Object.keys(line).forEach((date) => {
        smoothed[date] = fixedValue;
    });

    return smoothed;
}

function trailingSmoothing(line: LineData, dates: string[], trailingDays: number): LineData {
    const smoothed: LineData = {};

    let trailingValues: number[] = [];
    dates.forEach((date) => {
        if (trailingValues.length === trailingDays) {
            trailingValues.shift();
        }

        if (date in line) {
            trailingValues.push(line[date]);

            let sum = trailingValues.reduce((sum, value) => sum + value, 0);
            smoothed[date] = sum / trailingValues.length;
        }
    });

    return smoothed;
}

function noSmoothing(line: LineData): LineData {
    return {
        ...line,
    };
}
