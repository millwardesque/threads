export type DataSourceType = "csv" | "tsv";

export type DateFormatType = "yyyy-MM-dd";

export type MeasureAggregator = "sum" | "count" | "average";

export interface DataDimensionDefinition {
    fieldName: string,
    label: string
};

export interface DataMeasureDefinition {
    fieldName: string,
    label: string
};

export interface DataPlotDefinition {
    measureName: DataMeasureDefinition,
    aggregator: MeasureAggregator
}

export interface DataSourceDefinition {
    id: string;
    type: DataSourceType;
    dateField: string;
    dateFormat: DateFormatType;
    dimensions: {[name: string]: DataDimensionDefinition};
    measures: {[name: string]: DataMeasureDefinition};
    plots: {[name: string]: DataPlotDefinition};
};

export type DataSourceMap = { [id: string]: DataSourceDefinition };
  