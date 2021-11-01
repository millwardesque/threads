import { Cache } from '../models/Cache';
import { CsvQueryProcessor } from '../models/CsvQueryProcessor';
import {
    DataSourceDefinition,
    DataSourceMap,
    GetFilterResults,
    loadSourcesFromJson,
    QueryRequest,
    QueryResults,
} from '../models/DataSourceDefinition';

export const SOURCES_PATH = './data/datasources.json';

class DataSourceController {
    dataSources: DataSourceMap;
    cache: Cache;

    constructor() {
        const result = loadSourcesFromJson(SOURCES_PATH);
        if (result.hasError) {
            throw Error(`Unable to create DataSourceController: ${result.error}`);
        }

        this.dataSources = result.sources!;
        this.cache = new Cache();
        console.log(`Loaded ${Object.keys(this.dataSources ?? []).length} sources`);
    }

    getSourceDefinition(sourceId: string): DataSourceDefinition | undefined {
        return this.dataSources ? this.dataSources[sourceId] : undefined;
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
                    filters: {},
                };
            } else {
                return processor.getFilterValues();
            }
        } else {
            return {
                hasError: true,
                error: `Data sources haven't been loaded`,
                filters: {},
            };
        }
    }

    query(sourceId: string, query: QueryRequest): QueryResults {
        if (this.dataSources) {
            if (this.cache.exists(sourceId, query)) {
                console.log(`Loading cached query results`, sourceId, JSON.stringify(query));
                const lines = this.cache.get(sourceId, query);
                if (lines) {
                    return {
                        hasError: false,
                        data: lines,
                    };
                } else {
                    return {
                        hasError: true,
                        error: 'Expected cache data, but none was found',
                        data: {},
                    };
                }
            } else {
                console.log(`Executing uncached query`, sourceId, JSON.stringify(query));
                const processor = new CsvQueryProcessor();
                const loadResults = processor.load(this.dataSources[sourceId]);
                if (loadResults.hasError) {
                    return {
                        ...loadResults,
                        data: {},
                    };
                } else {
                    const results = processor.queryByQueryRequest(query);
                    this.cache.set(sourceId, query, results.data);
                    console.log(`Executing uncached query`, sourceId, JSON.stringify(query));
                    return results;
                }
            }
        } else {
            return {
                hasError: true,
                error: `Data sources haven't been loaded`,
                data: {},
            };
        }
    }
}

export default new DataSourceController();
