import fs from 'fs';

export type DataSourceType = "csv" | "tsv";

export type DateFormatType = "yyyy-MM-dd";

export type MeasureAggregator = "sum" | "count" | "average";

export interface DataDimensionDefinition {
    fieldName: string,
    id: string,
    label: string
};

export interface DataMeasureDefinition {
    fieldName: string,
    id: string,
    label: string
};

export interface DataPlotDefinition {
    aggregator: MeasureAggregator
    id: string,
    label: string,
    measureName: string,
}

export interface DataSourceDefinition {
    id: string;
    label: string;
    type: DataSourceType;
    file?: string
    dateField: string;
    dateFormat: DateFormatType;
    dimensions: {[name: string]: DataDimensionDefinition};
    measures: {[name: string]: DataMeasureDefinition};
    plots: {[name: string]: DataPlotDefinition};
};

export type DataSourceMap = { [id: string]: DataSourceDefinition };

export type LoadSourcesReturn = { hasError: boolean, sources?: DataSourceMap, error?: string };

export const loadSourcesFromJson = (filename: string): LoadSourcesReturn => {
    let dataSources: DataSourceMap = {};

    if (!fs.existsSync(filename)) {
        return { hasError: true, error: `File ${filename} not found` };
    }
    const rawData: string = fs.readFileSync(filename, {encoding: 'utf8'});
    if (rawData.length === 0) {
        return { hasError: true, error: `File ${filename} is empty` };
    }

    let sources: any;
    try {
        sources = JSON.parse(rawData);
    }
    catch (error) {
        return { hasError: true, error: `JSON error parsing ${filename}: ${error}` };
    }

    sources.forEach((source: DataSourceDefinition) => {
        dataSources[source.id] = source;
    });
    return { hasError: false, sources: dataSources };
};
  