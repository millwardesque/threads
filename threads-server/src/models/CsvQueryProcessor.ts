import fs from 'fs';
import parse from 'csv-parse/lib/sync';

import { DataSourceDefinition } from './DataSourceDefinition';

export interface QueryResults {
    hasError: boolean,
    error?: string,
    data: {
        [date: string]: number
    }
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
            return { hasError: true, error: `Source ${source.id} file ${source.file} wasn't found` };
        }

        const fileData = fs.readFileSync(source.file).toString();
        this.rawData = parse(fileData, {
            columns: true,
            skip_empty_lines: true
        });

        this.source = source;
        return { hasError: false };
    }

    canQuery(measureId?: string): QueryResults {
        if (!this.source) {
            return {
                hasError: true,
                error: "No datasource is loaded",
                data: {},
            };
        }
        else if (measureId !== undefined && !(measureId in this.source.measures)) {
            return {
                hasError: true,
                error: `[${this.source.id}] Measure ${measureId} doesn't exist on this source`,
                data: {},
            };
        }
        else {
            return {
                hasError: false,
                data: {},
            }
        }
    }

    queryByPlot(plotId: string): QueryResults {
        if (!this.source) {
            return {
                hasError: true,
                error: "No datasource is loaded",
                data: {},
            };
        }
        if (!(plotId in this.source.plots)) {
            return {
                hasError: true,
                error: `[${this.source.id}] Plot ${plotId} doesn't exist on this source`,
                data: {},
            };
        }

        const plot = this.source.plots[plotId];
        switch(plot.aggregator) {
            case 'average':
                return this.queryAverage(plot.measureName);
            case 'count':
                return this.queryCount();
            case 'sum':
                return this.querySum(plot.measureName);
            default:
                return {
                    hasError: true,
                    error: `[${this.source.id}.${plotId}] ${plot.aggregator}  isn't a recognized aggregator`,
                    data: {}
                };
        }
    }

    querySum(measureId: string): QueryResults {
        let results = this.canQuery(measureId);
        if (results.hasError) {
            return results;
        }

        const dateField = this.source!.dateField;
        const measure = this.source!.measures[measureId];

        let data: {
            [date: string]: number
        } = {};
        let lineNum = 2;    // Line 1 is the header
        this.rawData.forEach(row => {
            const date: string = row[dateField];
            const value = Number(row[measure.fieldName]);

            if (Number.isNaN(value)) {
                results.hasError = true;
                results.error = `[${lineNum}@${this.source!.id}:${measureId}] Measure is not a number: '${row[measure.fieldName]}'`;
            }
            else {
                data[date] = (data[date] ?? 0) + value;
            }
        });
        results.data = data;

        return results;
    }

    queryCount(): QueryResults {
        let results = this.canQuery();
        if (results.hasError) {
            return results;
        }

        const dateField = this.source!.dateField;

        let data: {
            [date: string]: number
        } = {};
        this.rawData.forEach(row => {
            const date: string = row[dateField];
            data[date] = (data[date] ?? 0) + 1;
        });
        results.data = data;

        return results;
    }

    queryAverage(measureId: string): QueryResults {
        let results = this.canQuery(measureId);
        if (results.hasError) {
            return results;
        }

        const dateField = this.source!.dateField;
        const measure = this.source!.measures[measureId];

        let dateCounts: {
            [date: string]: number
        } = {};
        let data: {
            [date: string]: number
        } = {};
        this.rawData.forEach(row => {
            const date: string = row[dateField];
            const value = Number(row[measure.fieldName]);
            data[date] = (data[date] ?? 0) + value;
            dateCounts[date] = (dateCounts[date] ?? 0) + 1
        });

        for (let date in dateCounts) {
            data[date] /= dateCounts[date];
        }

        results.data = data;
        return results;
    }
}