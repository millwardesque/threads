import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues, LineData } from '../models/DataSourceDefinition';
import { ThreadType } from '../types';

export abstract class Thread {
    id: string;
    type: ThreadType;
    customLabel: string | undefined;
    description: string;
    dataVersion: number;

    constructor(
        id: string,
        type: ThreadType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number
    ) {
        this.id = id;
        this.type = type;
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

export class AdhocThread extends Thread {
    adhocData: LineData;
    units: string;

    constructor(
        id: string,
        type: ThreadType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        units: string,
        adhocData: LineData
    ) {
        super(id, type, customLabel, description, dataVersion);
        this.units = units;
        this.adhocData = adhocData;
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
        type: ThreadType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        source: DataSourceDefinition,
        plot: DataPlotDefinition,
        activeFilters: FiltersAndValues,
        exploderDimension: string | undefined
    ) {
        super(id, type, customLabel, description, dataVersion);
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
