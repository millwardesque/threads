import { CsvQueryProcessor } from "../models/CsvQueryProcessor";
import { DataSourceDefinition, DataSourceMap, loadSourcesFromJson, QueryRequest, QueryResults } from "../models/DataSourceDefinition";

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

    query(sourceId: string, query: QueryRequest): QueryResults {
        if (!this.dataSources) {
            throw Error(`Unable to query data source ${sourceId}: No sources are loaded`);
        }

        const processor = new CsvQueryProcessor();
        processor.load(this.dataSources[sourceId]);
        return processor.queryByQueryRequest(query);
    }
}

export default new DataSourceController();