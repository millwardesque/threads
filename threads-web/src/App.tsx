import React, { useState } from 'react';
import axios from 'axios';
import { DataPlotDefinition, DataSourceDefinition, DataSourceMap, FiltersAndValues, GetFilterResults, LineDefinition, QueryRequest, QueryResults } from './models/DataSourceDefinition';
import { Throbber } from './components/Throbber';
import { SelectOption, Select } from './components/Select';
import { MultiSelect } from './components/MultiSelect';
import { ThreadsChart } from './components/ThreadsChart';
import { Tab } from './components/Tab';

type LoadingStatus = 'not-started' | 'loading' | 'loaded';

interface Thread {
    source: DataSourceDefinition,
    plot?: DataPlotDefinition,

    filterLoadingStatus: LoadingStatus,
    sourceFilters?: FiltersAndValues,
    activeFilters?: FiltersAndValues,

    lineLoadingStatus: LoadingStatus,
    lines: LineDefinition[]
};

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
    const getFilterSelects = (source?: DataSourceDefinition, filters?: FiltersAndValues, activeFilters?: FiltersAndValues) => {
        if (!source || Object.keys(source).length === 0 || !filters || Object.keys(filters).length === 0) {
            return [];
        }

        let filterSelects = [];
        for (const dimension of Object.keys(filters)) {
            const options = filters[dimension].map((d) => {
                return { label: d, value: d };
            });

            const selected: string[] = (activeFilters && dimension in activeFilters) ? activeFilters[dimension] : [];
            const select = <MultiSelect id={`filter-${dimension}`} label={source.dimensions[dimension].label} selected={selected} options={options} onChange={(selected: string[]) => {onFilterChange(dimension, selected)}}></MultiSelect>;
            filterSelects.push(select);
        }
        return filterSelects;
    }

    const onSourceChange = (selected: string): void => {
        if (selected === selectedSource?.id) {
            return;
        }

        if (Object.keys(sources).includes(selected)) {
            const source = sources[selected];
            const plot = Object.values(source.plots)[0];

            console.log(`Updating source and plot: ${source.id}.${plot.id}`);
            const newActiveThread: Thread = {
                source,
                plot,

                filterLoadingStatus: 'not-started',
                sourceFilters: undefined,
                activeFilters: undefined,

                lineLoadingStatus: 'not-started',
                lines: []
            };
            setActiveThread(newActiveThread);

            setSelectedSource(source);

            query(source, plot);
            getSourceFilters(source);
        }
        else {
            console.log(`Unable to select source '${selected}'.  Source doesn't exist in current source list.`)
        }
    };

    const onPlotChange = (selected: string): void => {
        if (selectedSource && Object.keys(selectedSource.plots).includes(selected)) {
            const plot = selectedSource.plots[selected];

            console.log(`Updating plot: ${selectedSource.id}.${plot.id}`);
            setActiveThread((oldActiveThread) => {
                return {
                    ...oldActiveThread!,
                    plot
                }
            });

            query(selectedSource, plot);
        }
        else {
            console.log(`Unable to select plot '${selected}'.  No source selected, or plot doesn't exist in selected source ${selectedSource?.id}.`);
        }
    };

    const onFilterChange = (dimension: string, selected: string[]): void => {
        const newActiveFilters = {
            ...activeThread!.activeFilters,
            [dimension]: selected
        }

        setActiveThread((oldActiveThread) => {
            return {
                ...oldActiveThread!,
                activeFilters: newActiveFilters
            }
        });

        query(activeThread!.source, activeThread!.plot!, newActiveFilters);
    }

    const query = (source: DataSourceDefinition, plot: DataPlotDefinition, filters?: FiltersAndValues): void => {
        if (source !== undefined && plot !== undefined) {
            setLines([]);

            setActiveThread((oldActiveThread) => {
                return {
                    ...oldActiveThread!,
                    line: [],
                    lineLoadingStatus: 'loading'
                }
            });

            const query: QueryRequest = {
                plotId: plot.id,
                dimensionFilters: filters
            };
            axios.post(`http://localhost:2999/api/datasource/${source.id}/query`, query)
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
                            plot: plot,
                            data: line
                        });
                    }

                    setActiveThread((oldActiveThread) => {
                        return {
                            ...oldActiveThread!,
                            lines: newLines,
                        }
                    });

                    setLines(newLines);
                    console.log("Query results", payload, newLines);
                }
            })
            .catch((error) => {
                console.log("Error querying data", error);
            })
            .finally(() => {
                setActiveThread((oldActiveThread) => {
                    return {
                        ...oldActiveThread!,
                        lineLoadingStatus: 'loaded',
                    }
                });
            })
        }
    };

    const getSourceFilters = (source: DataSourceDefinition): void => {
        if (source !== undefined) {
            setActiveThread((oldActiveThread) => {
                return {
                    ...oldActiveThread!,
                    filterLoadingStatus: 'loading',
                    sourceFilters: {},
                    activeFilters: {}
                }
            });

            axios.get(`http://localhost:2999/api/datasource/${source.id}/filters`)
            .then((response) => {
                const payload = response.data as GetFilterResults;
                if (payload.hasError) {
                    console.log("Error fetching filter values", payload.error);
                }
                else {
                    setActiveThread((oldActiveThread) => {
                        return {
                            ...oldActiveThread!,
                            sourceFilters: payload.filters,
                        }
                    });
                    console.log("Filters retrieved", payload);
                }
            })
            .catch((error) => {
                console.log("Error retrieving filters", error);
            })
            .finally(() => {
                setActiveThread((oldActiveThread) => {
                    return {
                        ...oldActiveThread!,
                        filterLoadingStatus: 'loaded',
                    }
                });
            })
        }
    }

    const [activeThread, setActiveThread] = useState<Thread|undefined>(undefined);
    const [lines, setLines] = useState<LineDefinition[]>([]);
    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    const [sources, setSources] = useState<DataSourceMap>({});
    const sourceOptions: SelectOption[] = Object.values(sources).map(s => { return { label: s.label, value: s.id } });
    const [selectedSource, setSelectedSource] = useState<DataSourceDefinition | undefined>(undefined);
    const plotOptions: SelectOption[] = getPlotOptions(selectedSource);

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

    if (sourceOptions.length > 0 && selectedSource === undefined) {
        const sourceId = sourceOptions[0].value;
        onSourceChange(sourceId);
    }

    const filters = getFilterSelects(activeThread?.source, activeThread?.sourceFilters, activeThread?.activeFilters);

    return (
        <div className="App h-screen">
            <div className="row flex h-5/6 flex-col">
                <div id="header" className="flex w-full h-12 p-6 bg-green-500 items-center">
                    <h1 className="text-2xl font-bold text-white">Threads</h1>
                </div>
                <div className="flex flex-row w-full h-full">
                    <div className="graph-area w-full h-full p-4">
                        <ThreadsChart id="chart" lines={lines}/>
                    </div>
                </div>
            </div>
            <div className="row flex flex-col h-1/6">
                <div className="tabs-area flex flex-row bg-red-100">
                    <Tab id="tab-1" label={`${activeThread?.source?.label}: ${activeThread?.plot?.label}`} onSelect={(tabId: string) => { console.log("Opened tab", tabId); }} />
                </div>
                <div className="config-area flex flex-row flex-auto bg-gray-200">
                    <div className="flex flex-col p-6 w-1/3 h-full">
                        <Select id="sourceSelector" label="Source" options={sourceOptions} selected={activeThread?.source?.id} onChange={onSourceChange}></Select>
                        <Select id="plotSelector" label="Plot" options={plotOptions} selected={activeThread?.plot?.id} onChange={onPlotChange}></Select>

                        { activeThread?.lineLoadingStatus === "loading" && <Throbber /> }
                    </div>
                    <div className="flex flex-row p-6 w-2/3 h-full">
                        { activeThread?.filterLoadingStatus === "loading" ? <Throbber /> : filters }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
