import fs from 'fs';
import parse from 'csv-parse/lib/sync';

import { DataSourceDefinition, LineData, QueryFilter, QueryRequest, QueryResults } from './DataSourceDefinition';

export interface DataRow {
    [field: string]: string
}

export class CsvQueryProcessor {
    private rawData: [];
    private source: DataSourceDefinition | undefined;

    constructor() {
        this.rawData = [];
    }

    load(source: DataSourceDefinition): { hasError: boolean, error?: string} {
        if (source.type !== 'csv') {
            return { hasError: true, error: `Source ${source.id} isn't a CSV file` };
        }
        else if (source.file === undefined) {
            return { hasError: true, error: `Source ${source.id} doesn't have a file specified` };
        }
        else if (!fs.existsSync(source.file)) {
            return { hasError: true, error: `Source ${source.id} file ${source.file} wasn't found (relative to ${process.cwd()})` };
        }

        const fileData = fs.readFileSync(source.file).toString();
        this.rawData = parse(fileData, {
            columns: true,
            skip_empty_lines: true
        });

        this.source = source;
        return { hasError: false };
    }

    canQuery(query: QueryRequest): QueryResults {
        if (!this.source) {
            return {
                hasError: true,
                error: "No datasource is loaded",
                data: {},
            };
        }

        if (!(query.plotId in this.source.plots)) {
            return {
                hasError: true,
                error: `[${this.source.id}] Plot ${query.plotId} doesn't exist on this source`,
                data: {},
            };
        }

        const plot = this.source.plots[query.plotId];
        if (!(plot.measureId in this.source.measures)) {
            return {
                hasError: true,
                error: `[${this.source.id}] Measure ${plot.measureId} doesn't exist on this source`,
                data: {},
            };
        }

        for (let filter of Object.keys(query.dimensionFilters ?? {})) {
            if (!Object.keys(this.source.dimensions).includes(filter)) {
                return {
                    hasError: true,
                    error: `[${this.source.id} "Filter dimension doesn't exist on this source: '${filter}'"]`,
                    data: {},
                }
            }
        }

        if (query.dimensionExploder) {
            if (!Object.keys(this.source.dimensions).includes(query.dimensionExploder)) {
                return {
                    hasError: true,
                    error: `[${this.source.id} "Dimension exploder doesn't exist on this source: '${query.dimensionExploder}'"]`,
                    data: {},
                }
            }
        }

        return {
            error: '',
            hasError: false,
            data: {},
        }
    }

    queryByQueryRequest(query: QueryRequest): QueryResults {
        const validationResults = this.canQuery(query);
        if (validationResults.hasError) {
            return validationResults;
        }

        const plot = this.source!.plots[query.plotId];
        switch(plot.aggregator) {
            case 'average':
                return this._queryAverage(query);
            case 'count':
                return this._queryCount(query);
            case 'sum':
                return this._querySum(query);
            default:
                return {
                    hasError: true,
                    error: `[${this.source!.id}.${plot.id}] ${plot.aggregator}  isn't a recognized aggregator`,
                    data: {}
                };
        }
    }

    filterData(row: DataRow, filters: QueryFilter): {} {
        for (const filter in filters) {
            if (!filters[filter].includes(row[filter])) {
                return false;
            }
        }
        return true;
    }

    _querySum(query: QueryRequest): QueryResults {
        const dateField = this.source!.dateField;
        const plot = this.source!.plots[query.plotId];
        const measure = this.source!.measures[plot.measureId];
        const dimensionExploder = query.dimensionExploder;

        let results = {
            error: '',
            hasError: false,
            data: {},
        };

        let data: {
            [dimension: string]: LineData
        } = {};
        let lineNum = 2;    // Line 1 is the header
        this.rawData.filter((row) => {
            return query.dimensionFilters ? this.filterData(row, query.dimensionFilters) : true;
        }).forEach(row => {
            const date: string = row[dateField];
            const dimension = dimensionExploder ? row[dimensionExploder] : '*';
            const value = Number(row[measure.fieldName]);

            if (Number.isNaN(value)) {
                results.hasError = true;
                results.error = `[${lineNum}@${this.source!.id}:${measure.id}] Measure is not a number: '${row[measure.fieldName]}'`;
            }
            else {
                if (!Object.keys(data).includes(dimension)) {
                    data[dimension] = {};
                    data[dimension][date] = 0;
                }
                else if (!Object.keys(data[dimension]).includes(date)) {
                    data[dimension][date] = 0;
                }

                data[dimension][date] += value;
            }
            lineNum += 1;
        });
        results.data = data;

        return results;
    }

    _queryCount(query: QueryRequest): QueryResults {
        const dateField = this.source!.dateField;
        const dimensionExploder = query.dimensionExploder;
        let results = {
            error: '',
            hasError: false,
            data: {},
        };

        let data: {
            [dimension: string]: LineData
        } = {};
        this.rawData.filter((row) => {
            return query.dimensionFilters ? this.filterData(row, query.dimensionFilters) : true
        }).forEach(row => {
            const date: string = row[dateField];
            const dimension = dimensionExploder ? row[dimensionExploder] : '*';

            if (!Object.keys(data).includes(dimension)) {
                data[dimension] = {};
                data[dimension][date] = 0;
            }
            else if (!Object.keys(data[dimension]).includes(date)) {
                data[dimension][date] = 0;
            }

            data[dimension][date] += 1;
        });
        results.data = data;

        return results;
    }

    _queryAverage(query: QueryRequest): QueryResults {
        const dateField = this.source!.dateField;
        const plot = this.source!.plots[query.plotId];
        const measure = this.source!.measures[plot.measureId];
        const dimensionExploder = query.dimensionExploder;

        let results = {
            error: '',
            hasError: false,
            data: {},
        };

        let dateDimensionCounts: {
            [dimension: string]: LineData
        } = {};
        let data: {
            [dimension: string]: LineData
        } = {};
        let lineNum = 2;    // Line 1 is the header
        this.rawData.filter((row) => {
            return query.dimensionFilters ? this.filterData(row, query.dimensionFilters) : true
        }).forEach(row => {
            const date: string = row[dateField];
            const value = Number(row[measure.fieldName]);
            const dimension = dimensionExploder ? row[dimensionExploder] : '*';

            if (Number.isNaN(value)) {
                results.hasError = true;
                results.error = `[${lineNum}@${this.source!.id}:${measure.id}] Measure is not a number: '${row[measure.fieldName]}'`;
            }
            else {
                if (!Object.keys(data).includes(dimension)) {
                    data[dimension] = {};
                    data[dimension][date] = 0;

                    dateDimensionCounts[dimension] = {
                        [date]: 0
                    };
                }
                else if (!Object.keys(data[dimension]).includes(date)) {
                    data[dimension][date] = 0;
                    dateDimensionCounts[dimension][date] = 0;
                }
                data[dimension][date] += value;
                dateDimensionCounts[dimension][date] += 1;
            }

            lineNum++;
        });

        for (let dimension in dateDimensionCounts) {
            for (let date in dateDimensionCounts[dimension]) {
                data[dimension][date] /= dateDimensionCounts[dimension][date];
            }
        }

        results.data = data;
        return results;
    }
}