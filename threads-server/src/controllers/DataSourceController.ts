import fs from 'fs';

import { DataSourceDefinition, DataSourceMap } from "../models/DataSourceDefinition";

const loadSourcesFromJson = (): DataSourceMap | undefined => {
    let dataSources: DataSourceMap = {};

    const rawData: Buffer = fs.readFileSync('./data/datasources.json');
    if (!rawData) {
        return undefined;
    }
    
    const sources = JSON.parse(rawData.toString());
    if (!sources) { 
        return undefined;
    }

    sources.forEach((source: DataSourceDefinition) => {
        dataSources[source.id] = source;
    });

    return dataSources;
};

class DataSourceController {
    dataSources: DataSourceMap | undefined;

    constructor() {
        this.dataSources = loadSourcesFromJson();
        console.log("Loaded data sources", this.dataSources);
    }

    getSourceDefinition(sourceId: string): DataSourceDefinition | undefined {
        return this.dataSources ? this.dataSources[sourceId]: undefined;
    }

    getSourceDimensionValues(sourceId: string, dimensionId: string): string[] | undefined {
        let values = new Array<string>();
        if (!this.dataSources || !this.dataSources[sourceId] || !this.dataSources[sourceId].dimensions[dimensionId]) {
            return undefined;
        }
        const dimension = this.dataSources[sourceId].dimensions[dimensionId];
        
        // @DEBUG STUB DATA
        for (let i = 1; i <= 10; i++) {
            values.push(`${dimension.fieldName}_${i}`);
        }        
        
        return values;
    }
}

export default new DataSourceController();