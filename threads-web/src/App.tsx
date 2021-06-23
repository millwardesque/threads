import { useState } from 'react';
import axios from 'axios';
import { DataSourceDefinition, DataSourceMap, FiltersAndValues, GetFilterResults, LineDefinition, QueryRequest, QueryResults } from './models/DataSourceDefinition';
import { Throbber } from './components/Throbber';
import { SelectOption, Select } from './components/Select';
import { FilterSet } from './components/FilterSet';
import { ThreadsChart } from './components/ThreadsChart';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ThreadTabs } from './components/ThreadTabs';

import { LoadingStatus, Thread } from './types';

// @TODO Coloured line definition
const getPlotOptions = (source?: DataSourceDefinition) => {
    if (!source) {
        return [];
    }

    return Object.values(source.plots)
        .map(p => {
            return { label: p.label, value: p.id };
        }
    );
}

function App() {
    const makeNewThread = () => {
        if (Object.keys(sources).length === 0) {
            return;
        }

        const source = Object.values(sources)[0];
        const plot = Object.values(source.plots)[0];

        console.log(`Creating new source and plot: ${source.id}.${plot.id}`);
        const newThread: Thread = {
            id: uuidv4(),
            source,
            plot,
            activeFilters: undefined,
        };
        updateActiveThread(newThread);
    }

    const onSourceChange = (selected: string): void => {
        if (activeThread === undefined || selected === activeThread?.source.id) {
            return;
        }

        if (Object.keys(sources).includes(selected)) {
            const source = sources[selected];
            const plot = Object.values(source.plots)[0];

            console.log(`Updating source and plot: ${source.id}.${plot.id}`);
            const newActiveThread: Thread = {
                id: activeThread.id,
                source,
                plot,
                activeFilters: undefined,
            };
            updateActiveThread(newActiveThread);
        }
        else {
            console.log(`Unable to select source '${selected}'.  Source doesn't exist in current source list.`)
        }
    };

    const onPlotChange = (selected: string): void => {
        if (activeThread?.source && Object.keys(activeThread.source.plots).includes(selected)) {
            const plot = activeThread.source.plots[selected];

            console.log(`Updating plot: ${activeThread.source.id}.${plot.id}`);
            const newActiveThread: Thread = {
                ...activeThread!,
                plot
            };
            updateActiveThread(newActiveThread);
        }
        else {
            console.log(`Unable to select plot '${selected}'.  No source selected, or plot doesn't exist in selected source ${activeThread?.source.id}.`);
        }
    };

    const onFilterChange = (dimension: string, selected: string[]): void => {
        const newActiveFilters = {
            ...activeThread!.activeFilters,
            [dimension]: selected
        }

        const newActiveThread: Thread = {
            ...activeThread!,
            activeFilters: newActiveFilters
        };
        updateActiveThread(newActiveThread);
    }

    const updateActiveThread = (newActiveThread: Thread) => {
        setActiveThread(newActiveThread);
        setThreads((oldThreads) => {
            return {
                ...oldThreads,
                [newActiveThread.id]: newActiveThread
            };
        });
    };

    const onTabClose = (thread: Thread) => {
        const threadList = Object.values(threads);
        const threadIndex = threadList.indexOf(thread);

        let newActiveThread: Thread | undefined = undefined;
        if (threadIndex < threadList.length - 1) {
            newActiveThread = threadList[threadIndex + 1];
        }
        else if (threadIndex > 0) {
            newActiveThread = threadList[threadIndex - 1];
        }
        else {
            // This code is likely unreachable because of the restrictions around closing the final tab, but just in case...
            throw new Error(`Attemting to close tab that shouldn't be closed. Thread ID ${thread.id}, Tab # ${threadIndex}.`);
        }

        setActiveThread(newActiveThread);
        setThreads((oldThreads) => {
            delete oldThreads[thread.id];
            return {
                ...oldThreads
            };
        });

        setLineMap((oldMap) => {
            delete oldMap[thread.id];
            return {
                ...oldMap
            };
        });
    }

    const query = (thread?: Thread): void => {
        if (thread === undefined || thread.plot === undefined) {
            return;
        }

        setLineMap((oldMap) => {
            return {
                ...oldMap,
                [thread.id]: []
            };
        });
        setLineLoadingStatus('loading');

        const query: QueryRequest = {
            plotId: thread.plot.id,
            dimensionFilters: thread.activeFilters
        };
        axios.post(`http://localhost:2999/api/datasource/${thread.source.id}/query`, query)
        .then((response) => {
            const payload = response.data as QueryResults;
            if (payload.hasError) {
                console.log("Error querying data", payload.error);
            }
            else {
                const lineData = Object.values(payload.data);
                let newLines: LineDefinition[] = [];
                for (let line of lineData) {
                    newLines.push({
                        plot: thread.plot!,
                        data: line
                    });
                }

                setLineMap((oldMap) => {
                    return {
                        ...oldMap,
                        [thread.id]: newLines
                    };
                });
                console.log("Query results", payload, newLines);
            }
        })
        .catch((error) => {
            console.log("Error querying data", error);
        })
        .finally(() => {
            setLineLoadingStatus('loaded');
        });
    };

    const loadSourceFilters = (source: DataSourceDefinition): void => {
        if (source !== undefined) {
            setSourceFilters((oldSourceFilters) => {
                return {
                    ...oldSourceFilters,
                    [source.id]: {}
                };
            });
            setFilterLoadingStatus('loading');

            axios.get(`http://localhost:2999/api/datasource/${source.id}/filters`)
            .then((response) => {
                const payload = response.data as GetFilterResults;
                if (payload.hasError) {
                    console.log("Error fetching filter values", payload.error);
                }
                else {
                    setSourceFilters((oldSourceFilters) => {
                        return {
                            ...oldSourceFilters,
                            [source.id]: payload.filters,
                        };
                    });
                    console.log("Filters retrieved", payload);
                }
            })
            .catch((error) => {
                console.log("Error retrieving filters", error);
            })
            .finally(() => {
                setFilterLoadingStatus('loaded');
            });
        }
    }

    const switchThread = (thread: Thread) => {
        setActiveThread(thread);
    };

    const [lineMap, setLineMap] = useState<{[id: string]: LineDefinition[]}>({});

    const [threads, setThreads] = useState<{[id: string]: Thread}>({});
    const [activeThread, setActiveThread] = useState<Thread|undefined>(undefined);
    const [lineLoadingStatus, setLineLoadingStatus] = useState<LoadingStatus>('not-started');
    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    const [sources, setSources] = useState<DataSourceMap>({});
    const [filterLoadingStatus, setFilterLoadingStatus] = useState<LoadingStatus>('not-started');
    const [sourceFilters, setSourceFilters] = useState<{[source: string]: FiltersAndValues}>({});
    const sourceOptions: SelectOption[] = Object.values(sources).map(s => { return { label: s.label, value: s.id } });
    const plotOptions: SelectOption[] = getPlotOptions(activeThread?.source);

    if (sourceStatus === 'not-started') {
        setSourceStatus('loading');
        axios.get('http://localhost:2999/api/datasource')
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

    if (sourceOptions.length > 0 && activeThread === undefined) {
        makeNewThread();
    }

    if (activeThread?.source && !(activeThread.source.id in sourceFilters)) {
        loadSourceFilters(activeThread.source);
    }

    useEffect(() => {
        query(activeThread);
    }, [activeThread]);

    let allLines: LineDefinition[] = [];
    Object.values(lineMap).forEach((threadLines) => {
        allLines = allLines.concat(threadLines);
    });

    return (
        <div className="App h-screen">
            <div className="row flex h-5/6 flex-col">
                <div id="header" className="flex w-full h-12 p-6 bg-green-500 items-center">
                    <h1 className="text-2xl font-bold text-white">Threads</h1>
                </div>
                <div className="flex flex-row w-full h-full">
                    <div className="graph-area w-full h-full p-4">
                        <ThreadsChart id="chart" lines={allLines}/>
                    </div>
                </div>
            </div>
            <div className="row flex flex-col h-1/6">
                <div className="tabs-area flex flex-row bg-red-100">
                    <ThreadTabs threads={threads} onSelectTab={switchThread} onCloseTab={onTabClose} onNewTab={makeNewThread} />
                </div>
                <div className="config-area flex flex-row flex-auto bg-gray-200">
                    <div className="flex flex-col p-6 w-1/3 h-full">
                        <Select id="sourceSelector" label="Source" options={sourceOptions} selected={activeThread?.source?.id} onChange={onSourceChange}></Select>
                        <Select id="plotSelector" label="Plot" options={plotOptions} selected={activeThread?.plot?.id} onChange={onPlotChange}></Select>

                        { lineLoadingStatus === "loading" && <Throbber /> }
                    </div>
                    <div className="flex flex-row p-6 w-2/3 h-full">
                        { activeThread && filterLoadingStatus === "loaded" ? <FilterSet thread={activeThread} filters={sourceFilters[activeThread.source.id]} onFilterChange={onFilterChange} /> : <Throbber /> }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
