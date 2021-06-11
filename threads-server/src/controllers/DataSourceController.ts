import { CsvQueryProcessor } from "../models/CsvQueryProcessor";
import { DataSourceDefinition, DataSourceMap, GetFilterResults, loadSourcesFromJson, QueryRequest, QueryResults } from "../models/DataSourceDefinition";

export const SOURCES_PATH = './data/datasources.json';

class DataSourceController {
    dataSources: DataSourceMap;

    constructor() {
        const result = loadSourcesFromJson(SOURCES_PATH);
        if (result.hasError) {
            throw Error(`Unable to create DataSourceController: ${result.error}`);
        }

        this.dataSources = result.sources!;
        console.log(`Loaded ${Object.keys(this.dataSources ?? []).length} sources`);
    }

    getSourceDefinition(sourceId: string): DataSourceDefinition | undefined {
        return this.dataSources ? this.dataSources[sourceId]: undefined;
    }

    getAllSourceDefinitions(): DataSourceMap {
        return this.dataSources ?? {};
    }

    getSourceFilterValues(sourceId: string): GetFilterResults {
        if (this.dataSources) {
            const processor = new CsvQueryProcessor();
            const loadResults = processor.load(this.dataSources[sourceId]);
            if (loadResults.hasError) {
                return {
                    ...loadResults,
                    filters: {}
                }
            }
            else {
                return processor.getFilterValues();
            }
        }
        else {
            return {
                hasError: true,
                error: `Data sources haven't been loaded`,
                filters: {}
            };
        }
    }

    query(sourceId: string, query: QueryRequest): QueryResults {
        if (this.dataSources) {
            const processor = new CsvQueryProcessor();
            const loadResults = processor.load(this.dataSources[sourceId]);
            if (loadResults.hasError) {
                return {
                    ...loadResults,
                    data: {}
                }
            }
            else {
                return processor.queryByQueryRequest(query);
            }
        }
        else {
            return {
                hasError: true,
                error: `Data sources haven't been loaded`,
                data: {}
            };
        }
    }
}

export default new DataSourceController();