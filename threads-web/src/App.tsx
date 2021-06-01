import React, { useState } from 'react';
import axios from 'axios';
import { DataSourceDefinition } from './models/DataSourceDefinition';
import { SelectOption, SourceSelector } from './components/SourceSelector';

type LoadingStatus = 'not-started' | 'loading' | 'loaded';

function App() {
    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    const [sources, setSources] = useState<DataSourceDefinition[]>([]);
    const sourceOptions: SelectOption[] = sources.map(s => { return { label: s.id, value: s.id } });

    console.log(sourceStatus);
    if (sourceStatus === 'not-started') {
        console.log("HERE");
        setSourceStatus('loading');
        axios.get('http://localhost:2999/api/datasource/test_datasource_1')
            .then((response) => {
                console.log("Reponse received!", response);
                const source = response.data;
                setSourceStatus('loaded');
                setSources([source]);
            })
            .catch((error) => {
                console.log("Caught error", error);
                setSourceStatus('loaded');
                setSources([]);
            });
    }

    return (
        <div className="App h-screen">
            <div className="row flex h-5/6 flex-col">
                <h1 className="w-full h-12 bg-red-100">Header</h1>
                <div className="flex flex-row w-full h-full">
                    <div className="graph-area w-10/12 h-full bg-green-100">Graph Area</div>
                    <div className="graph-area w-2/12 h-full bg-gray-100">Legend Area</div>
                </div>
            </div>
            <div className="row flex h-1/6">
                <div className="config-area flex-auto bg-blue-100">
                    <SourceSelector id="sourceSelector" label="Data Source" options={sourceOptions}></SourceSelector>
                </div>
            </div>
        </div>
    );
}

export default App;
