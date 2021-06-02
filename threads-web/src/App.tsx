import React, { useState } from 'react';
import axios from 'axios';
import { DataPlotDefinition, DataSourceDefinition, DataSourceMap } from './models/DataSourceDefinition';
import { SelectOption, Select } from './components/Select';

type LoadingStatus = 'not-started' | 'loading' | 'loaded';

function App() {
    const getPlotOptions = () => {
        if (!selectedSource) {
            return [];
        }

        return Object.values(selectedSource.plots)
            .map(p => {
                return { label: p.label, value: p.id };
            }
        );
    };

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
        }
        else {
            console.log(`Unable to select plot '${selected}'.  No source selected, or plot doesn't exist in selected source ${selectedSource?.id}.`);
        }
    };

    const [sourceStatus, setSourceStatus] = useState<LoadingStatus>('not-started');
    const [sources, setSources] = useState<DataSourceMap>({});
    const sourceOptions: SelectOption[] = Object.values(sources).map(s => { return { label: s.label, value: s.id } });
    const [selectedSource, setSelectedSource] = useState<DataSourceDefinition | undefined>(undefined);
    const [selectedPlot, setSelectedPlot] = useState<DataPlotDefinition | undefined>(undefined);
    const plotOptions: SelectOption[] = getPlotOptions();

    console.log(sourceStatus);
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
                    <Select id="sourceSelector" label="Data Source" options={sourceOptions} selected={selectedSource?.id} onChange={onSourceChange}></Select>
                    <Select id="plotSelector" label="Plot" options={plotOptions} selected={selectedPlot?.id} onChange={onPlotChange}></Select>
                </div>
            </div>
        </div>
    );
}

export default App;
