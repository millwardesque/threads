import { useState } from 'react';
import axios from 'axios';
import { DataSourceMap } from './models/DataSourceDefinition';
import { Throbber } from './components/Throbber';
import { LoadedThreadsApp } from './components/LoadedThreadsApp';

import { LoadingStatus } from './types';

function App() {
    const isReady = () => {
        return Object.keys(sources).length > 0;
    };

    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    const [sources, setSources] = useState<DataSourceMap>({});

    if (sourceStatus === 'not-started') {
        setSourceStatus('loading');
        axios
            .get('http://localhost:2999/api/datasource')
            .then((response) => {
                const { data: sources } = response;
                setSourceStatus('loaded');
                setSources(sources);
            })
            .catch((error) => {
                setSourceStatus('loaded');
                setSources({});
            });
    }

    return (
        <div className="App flex flex-col h-screen w-screen">
            <div id="header" className="flex w-full h-12 p-6 bg-green-500 items-center">
                <h1 className="text-2xl font-bold text-white">Threads</h1>
            </div>
            <div className="flex flex-col flex-1">
                {!isReady() && <Throbber />}
                {isReady() && <LoadedThreadsApp sources={sources} />}
            </div>
        </div>
    );
}

export default App;
