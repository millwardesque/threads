import { Throbber } from './components/molecules/Throbber';
import { LoadedThreadsApp } from './components/LoadedThreadsApp';
import { useSources } from './hooks/useSources';

function App() {
    const { sources } = useSources();

    const isReady = () => {
        return Object.keys(sources).length > 0;
    };

    return (
        <div className="App flex flex-col h-screen w-screen">
            <div className="flex flex-col flex-1 relative">
                {!isReady() && <Throbber />}
                {isReady() && <LoadedThreadsApp sources={sources} />}
            </div>
        </div>
    );
}

export default App;
