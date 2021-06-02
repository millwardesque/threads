import fs from 'fs';

import { DataSourceDefinition, DataSourceMap } from "../models/DataSourceDefinition";

export const SOURCES_PATH = './data/datasources.json';

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

class DataSourceController {
    dataSources: DataSourceMap;

    constructor() {
        const result = loadSourcesFromJson(SOURCES_PATH);
        if (result.hasError) {
            throw Error(`Unable to create DataSourceController: ${result.error}`);
        }
        this.dataSources = result.sources!;        
    }

    getSourceDefinition(sourceId: string): DataSourceDefinition | undefined {
        return this.dataSources ? this.dataSources[sourceId]: undefined;
    }

    getAllSourceDefinitions(): DataSourceMap {
        return this.dataSources ?? {};
    }
}

export default new DataSourceController();