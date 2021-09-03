import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues, LineData } from '../models/DataSourceDefinition';
import { SmoothingType } from '../models/Smoother';
import { ThreadType } from '../types';

export abstract class Thread {
    id: string;
    type: ThreadType;
    smoothing: SmoothingType;
    customLabel: string | undefined;
    description: string;
    dataVersion: number;

    constructor(
        id: string,
        type: ThreadType,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number
    ) {
        this.id = id;
        this.type = type;
        this.smoothing = smoothing;
        this.customLabel = customLabel;
        this.description = description;
        this.dataVersion = dataVersion;
    }

    getLabel(): string {
        return this.customLabel ?? this.getFallbackLabel();
    }

    abstract getUnits(): string;

    abstract getFallbackLabel(): string;
}

interface CleanAdhocDatum {
    date: string | undefined;
    rawValue: string | undefined;
}

export class AdhocThread extends Thread {
    adhocData: LineData;
    units: string;

    constructor(
        id: string,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        units: string
    ) {
        super(id, 'adhoc', smoothing, customLabel, description, dataVersion);
        this.units = units;
        this.adhocData = {};
    }

    static adhocDataToLineData(adhocData: CleanAdhocDatum[]): LineData {
        const lines: LineData = {};
        adhocData.forEach((l) => {
            lines[l.date!] = Number(l.rawValue!);
        });
        return lines;
    }

    static isValidAdhocData(adhocData: CleanAdhocDatum[]): boolean {
        let datesAreValid = true;
        let valuesAreValid = true;

        adhocData.forEach((l) => {
            const { date, rawValue } = l;
            if (date === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                datesAreValid = false;
            }

            if (rawValue === undefined || isNaN(Number(rawValue))) {
                valuesAreValid = false;
            }
        });

        return datesAreValid && valuesAreValid;
    }

    static cleanAdhocDataFromStrings(lines: string[]): CleanAdhocDatum[] {
        const cleanedData: CleanAdhocDatum[] = [];
        lines.forEach((l) => {
            const trimmedLine = l.trim();
            if (trimmedLine) {
                const [date, value] = trimmedLine.split(',');
                const trimmedDate = date ? date.trim() : undefined;
                const trimmedValue = value ? value.trim() : undefined;
                cleanedData.push({
                    date: trimmedDate,
                    rawValue: trimmedValue,
                });
            }
        });

        return cleanedData;
    }

    getUnits(): string {
        return this.units;
    }

    getFallbackLabel(): string {
        return 'Adhoc line';
    }
}

export class SimpleThread extends Thread {
    source: DataSourceDefinition;
    plot: DataPlotDefinition;
    activeFilters: FiltersAndValues;
    exploderDimension: string | undefined;

    constructor(
        id: string,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        source: DataSourceDefinition,
        plot: DataPlotDefinition,
        activeFilters: FiltersAndValues,
        exploderDimension: string | undefined
    ) {
        super(id, 'simple', smoothing, customLabel, description, dataVersion);
        this.source = source;
        this.plot = plot;
        this.activeFilters = activeFilters;
        this.exploderDimension = exploderDimension;
    }

    getUnits(): string {
        return this.plot.units;
    }

    getFallbackLabel(): string {
        return this.plot.label;
    }
}
