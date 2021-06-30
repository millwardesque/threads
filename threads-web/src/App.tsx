import { useState } from 'react';
import axios from 'axios';
import { Throbber } from './components/Throbber';
import { LoadedThreadsApp } from './components/LoadedThreadsApp';
import { LoadingStatus } from './types';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { replaceAll, selectAllSources } from './redux/sourcesSlice';

function App() {
    const dispatch = useAppDispatch();
    const sources = useAppSelector(selectAllSources);
    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');

    const isReady = () => {
        return Object.keys(sources).length > 0;
    };

    if (sourceStatus === 'not-started') {
        setSourceStatus('loading');
        axios
            .get('http://localhost:2999/api/datasource')
            .then((response) => {
                const { data: sources } = response;
                setSourceStatus('loaded');
                dispatch(replaceAll(sources));
            })
            .catch((error) => {
                setSourceStatus('loaded');
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
