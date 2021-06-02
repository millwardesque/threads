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
    measureName: DataMeasureDefinition,
}

export interface DataSourceDefinition {
    id: string;
    label: string;
    type: DataSourceType;
    dateField: string;
    dateFormat: DateFormatType;
    dimensions: {[name: string]: DataDimensionDefinition};
    measures: {[name: string]: DataMeasureDefinition};
    plots: {[name: string]: DataPlotDefinition};
};

export type DataSourceMap = { [id: string]: DataSourceDefinition };
  