import fs from 'fs';

export type DataSourceType = 'csv' | 'tsv';

export type DateFormatType = 'yyyy-MM-dd';

export type MeasureAggregator = 'sum' | 'count' | 'average';

export interface DataDimensionDefinition {
    id: string;
    label: string;
}

export interface DataMeasureDefinition {
    id: string;
    label: string;
}

export interface DataPlotDefinition {
    aggregator: MeasureAggregator;
    id: string;
    label: string;
    measureId: string;
    units: string;
}

export interface DataSourceDefinition {
    id: string;
    label: string;
    description?: string;
    type: DataSourceType;
    file?: string;
    dateField: string;
    dateFormat: DateFormatType;
    dimensions: { [id: string]: DataDimensionDefinition };
    measures: { [id: string]: DataMeasureDefinition };
    plots: { [id: string]: DataPlotDefinition };
}

export type DataSourceMap = { [id: string]: DataSourceDefinition };

export interface FiltersAndValues {
    [dimensionId: string]: string[];
}

export interface GetFilterResults {
    hasError: boolean;
    error?: string;
    filters: FiltersAndValues;
}

export type LoadSourcesReturn = { hasError: boolean; sources?: DataSourceMap; error?: string };

export interface QueryFilter {
    [dimensionId: string]: string[];
}

export interface QueryRequest {
    plotId: string;
    dimensionFilters?: QueryFilter;
    dimensionExploder?: string;
}

export interface LineData {
    [date: string]: number;
}

export interface QueryResults {
    hasError: boolean;
    error?: string;
    data: {
        [dimension: string]: LineData;
    };
}

export const loadSourcesFromJson = (filename: string): LoadSourcesReturn => {
    let dataSources: DataSourceMap = {};

    if (!fs.existsSync(filename)) {
        return { hasError: true, error: `File ${filename} not found` };
    }
    const rawData: string = fs.readFileSync(filename, { encoding: 'utf8' });
    if (rawData.length === 0) {
        return { hasError: true, error: `File ${filename} is empty` };
    }

    let sources: any;
    try {
        sources = JSON.parse(rawData);
    } catch (error) {
        return { hasError: true, error: `JSON error parsing ${filename}: ${error}` };
    }

    sources.forEach((source: DataSourceDefinition) => {
        dataSources[source.id] = source;
    });
    return { hasError: false, sources: dataSources };
};
