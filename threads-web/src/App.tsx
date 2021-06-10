import React, { useState } from 'react';
import axios from 'axios';
import { DataPlotDefinition, DataSourceDefinition, DataSourceMap, LineDefinition, QueryResults } from './models/DataSourceDefinition';
import { Throbber } from './components/Throbber';
import { SelectOption, Select } from './components/Select';
import { ThreadsChart } from './components/ThreadsChart';

type LoadingStatus = 'not-started' | 'loading' | 'loaded';

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
    const onSourceChange = (selected: string): void => {
        if (selected === selectedSource?.id) {
            return;
        }

        if (Object.keys(sources).includes(selected)) {
            const source = sources[selected];
            const plot = Object.values(source.plots)[0];

            console.log(`Updating source and plot: ${source.id}.${plot.id}`);
            setSelectedSource(source);
            setSelectedPlot(plot);
            query(source, plot);
        }
        else {
            console.log(`Unable to select source '${selected}'.  Source doesn't exist in current source list.`)
        }
    };

    const onPlotChange = (selected: string): void => {
        if (selectedSource && Object.keys(selectedSource.plots).includes(selected)) {
            const plot = selectedSource.plots[selected];

            console.log(`Updating plot: ${selectedSource.id}.${plot.id}`);
            setSelectedPlot(plot);
            query(selectedSource, plot);
        }
        else {
            console.log(`Unable to select plot '${selected}'.  No source selected, or plot doesn't exist in selected source ${selectedSource?.id}.`);
        }
    };

    const query = (source: DataSourceDefinition, plot: DataPlotDefinition): void => {
        if (source !== undefined && plot !== undefined) {
            setLines([]);
            setIsLoadingLine('loading');
            axios.post(`http://localhost:2999/api/datasource/${source.id}/query`, { plotId: plot.id })
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
                    setLines(newLines);
                    console.log("Query results", payload, newLines);
                }
            })
            .catch((error) => {
                console.log("Error querying data", error);
            })
            .finally(() => {
                setIsLoadingLine('loaded');
            })
        }
    };

    const [isLoadingLine, setIsLoadingLine] = useState<LoadingStatus>('not-started');
    const [lines, setLines] = useState<LineDefinition[]>([]);
    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    const [sources, setSources] = useState<DataSourceMap>({});
    const sourceOptions: SelectOption[] = Object.values(sources).map(s => { return { label: s.label, value: s.id } });
    const [selectedSource, setSelectedSource] = useState<DataSourceDefinition | undefined>(undefined);
    const [selectedPlot, setSelectedPlot] = useState<DataPlotDefinition | undefined>(undefined);
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

    const filters = selectedSource ? Object.values(selectedSource.dimensions).map(d => <Select id={`filter-{d.id}`} label={d.label} options={[]}></Select>) : [];

    return (
        <div className="App h-screen">
            <div className="row flex h-5/6 flex-col">
                <h1 className="w-full h-12 bg-red-100">Header</h1>
                <div className="flex flex-row w-full h-full">
                    <div className="graph-area w-full h-full p-4">
                        <ThreadsChart id="chart" lines={lines}/>
                    </div>
                </div>
            </div>
            <div className="row flex h-1/6">
                <div className="config-area flex flex-row flex-auto bg-blue-100">
                    <div className="flex flex-col w-1/3 h-full">
                        <Select id="sourceSelector" label="Data Source" options={sourceOptions} selected={selectedSource?.id} onChange={onSourceChange}></Select>
                        <Select id="plotSelector" label="Plot" options={plotOptions} selected={selectedPlot?.id} onChange={onPlotChange}></Select>
                    </div>
                    <div className="flex flex-row w-2/3 h-full">
                        { isLoadingLine === "loading" ? <Throbber /> : filters }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
