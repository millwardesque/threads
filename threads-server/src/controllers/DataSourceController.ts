import { DataSourceDefinition, DataSourceMap, loadSourcesFromJson } from "../models/DataSourceDefinition";

export const SOURCES_PATH = './data/datasources.json';

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