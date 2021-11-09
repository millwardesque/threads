import { Md5 } from 'ts-md5/dist/md5';
import { LineData, QueryRequest } from './DataSourceDefinition';

export interface CacheData {
    [dimension: string]: LineData;
}

export class Cache {
    cacheData: { [key: string]: CacheData };

    constructor() {
        this.cacheData = {};
    }

    computeCacheKey(sourceId: string, query: QueryRequest): string {
        const key = Md5.hashStr(sourceId + '--' + JSON.stringify(query));
        return key;
    }

    exists(sourceId: string, query: QueryRequest): boolean {
        const key = this.computeCacheKey(sourceId, query);
        return key in this.cacheData;
    }

    get(sourceId: string, query: QueryRequest): CacheData | undefined {
        const key = this.computeCacheKey(sourceId, query);
        if (!(key in this.cacheData)) {
            return undefined;
        } else {
            return this.cacheData[key];
        }
    }

    set(sourceId: string, query: QueryRequest, dataToCache: CacheData) {
        const key = this.computeCacheKey(sourceId, query);
        this.cacheData[key] = dataToCache;
    }
}
