import { Throbber } from './components/Throbber';
import { LoadedThreadsApp } from './components/LoadedThreadsApp';
import { useSources } from './hooks/useSources';

function App() {
    const { sources } = useSources();

    const isReady = () => {
        return Object.keys(sources).length > 0;
    };

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
