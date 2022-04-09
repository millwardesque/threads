import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { compile } from 'mathjs';

import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues, LineData } from '../models/DataSourceDefinition';
import { LineDefinition, LineMap } from '../types';
import { AggregationType } from '../models/Aggregation';
import { Formula } from '../models/Formula';
import { SmoothingType } from '../models/Smoother';
import { ExploderType, ThreadType } from '../types';
import { getDateRangeFromLines } from '../utils';

export abstract class Thread {
    id: string;
    type: ThreadType;
    aggregation: AggregationType;
    smoothing: SmoothingType;
    customLabel: string | undefined;
    description: string;
    dataVersion: number;

    constructor(
        id: string,
        type: ThreadType,
        aggregation: AggregationType,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number
    ) {
        this.id = id;
        this.type = type;
        this.aggregation = aggregation;
        this.smoothing = smoothing;
        this.customLabel = customLabel;
        this.description = description;
        this.dataVersion = dataVersion;
    }

    getLabel(): string {
        return this.customLabel ?? this.getFallbackLabel();
    }

    abstract getUnits(): string;

    abstract getFallbackLabel(): string;

    abstract clone(thread: Thread): Thread | undefined;
}

interface CleanAdhocDatum {
    date: string | undefined;
    rawValue: string | undefined;
}

export class AdhocThread extends Thread {
    adhocData: LineData;
    units: string;

    constructor(
        id: string,
        aggregation: AggregationType,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        units: string
    ) {
        super(id, 'adhoc', aggregation, smoothing, customLabel, description, dataVersion);
        this.units = units;
        this.adhocData = {};
    }

    static adhocDataToLineData(adhocData: CleanAdhocDatum[]): LineData {
        const lines: LineData = {};
        adhocData.forEach((l) => {
            lines[l.date!] = Number(l.rawValue!);
        });
        return lines;
    }

    static isValidAdhocData(adhocData: CleanAdhocDatum[]): boolean {
        let datesAreValid = true;
        let valuesAreValid = true;

        adhocData.forEach((l) => {
            const { date, rawValue } = l;
            if (date === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                datesAreValid = false;
            }

            if (rawValue === undefined || isNaN(Number(rawValue))) {
                valuesAreValid = false;
            }
        });

        return datesAreValid && valuesAreValid;
    }

    static cleanAdhocDataFromStrings(lines: string[]): CleanAdhocDatum[] {
        const cleanedData: CleanAdhocDatum[] = [];
        lines.forEach((l) => {
            const trimmedLine = l.trim();
            if (trimmedLine) {
                const [date, value] = trimmedLine.split(',');
                const trimmedDate = date ? date.trim() : undefined;
                const trimmedValue = value ? value.trim() : undefined;
                cleanedData.push({
                    date: trimmedDate,
                    rawValue: trimmedValue,
                });
            }
        });

        return cleanedData;
    }

    getUnits(): string {
        return this.units;
    }

    getFallbackLabel(): string {
        return 'Adhoc line';
    }

    clone(thread: Thread): Thread | undefined {
        if (thread.type !== 'adhoc') {
            console.log(
                `Error: Unable to create Adhoc thread from non-adhoc source thread of type ${thread.type} with ID ${thread.id}`
            );
            return undefined;
        }

        const adhocThread = thread as AdhocThread;

        const newThread = new AdhocThread(
            uuidv4(),
            adhocThread.aggregation,
            adhocThread.smoothing,
            adhocThread.customLabel,
            adhocThread.description,
            0,
            adhocThread.units
        );
        newThread.adhocData = _.cloneDeep(adhocThread.adhocData);
        return newThread;
    }
}

export class SimpleThread extends Thread {
    source: DataSourceDefinition;
    plot: DataPlotDefinition;
    activeFilters: FiltersAndValues;
    exploderDimension: string | undefined;
    exploderType: ExploderType | undefined;

    constructor(
        id: string,
        aggregation: AggregationType,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        source: DataSourceDefinition,
        plot: DataPlotDefinition,
        activeFilters: FiltersAndValues,
        exploderDimension: string | undefined,
        exploderType: ExploderType | undefined
    ) {
        super(id, 'simple', aggregation, smoothing, customLabel, description, dataVersion);
        this.source = source;
        this.plot = plot;
        this.activeFilters = activeFilters;
        this.exploderDimension = exploderDimension;
        this.exploderType = exploderType;
    }

    clone(thread: Thread): Thread | undefined {
        if (thread.type !== 'simple') {
            console.log(
                `Error: Unable to create Simple thread from non-simple source thread of type ${thread.type} with ID ${thread.id}`
            );
            return undefined;
        }

        const simpleThread = thread as SimpleThread;

        const newThread = new SimpleThread(
            uuidv4(),
            simpleThread.aggregation,
            simpleThread.smoothing,
            simpleThread.customLabel,
            simpleThread.description,
            0,
            simpleThread.source,
            simpleThread.plot,
            _.cloneDeep(simpleThread.activeFilters),
            simpleThread.exploderDimension,
            simpleThread.exploderType
        );
        return newThread;
    }

    getUnits(): string {
        return this.plot.units;
    }

    getFallbackLabel(): string {
        return this.plot.label;
    }
}

export class CalculatedThread extends Thread {
    formula: string;
    units: string;

    constructor(
        id: string,
        aggregation: AggregationType,
        smoothing: SmoothingType,
        customLabel: string | undefined,
        description: string,
        dataVersion: number,
        formula: string,
        units: string
    ) {
        super(id, 'calculated', aggregation, smoothing, customLabel, description, dataVersion);
        this.formula = formula;
        this.units = units;
    }

    clone(thread: Thread): Thread | undefined {
        if (thread.type !== 'calculated') {
            console.log(
                `Error: Unable to create Calculated thread from non-calculated source thread of type ${thread.type} with ID ${thread.id}`
            );
            return undefined;
        }

        const calculatedThread = thread as CalculatedThread;

        const newThread = new CalculatedThread(
            uuidv4(),
            calculatedThread.aggregation,
            calculatedThread.smoothing,
            calculatedThread.customLabel,
            calculatedThread.description,
            0,
            calculatedThread.formula,
            calculatedThread.units
        );
        return newThread;
    }

    getUnits(): string {
        return this.units;
    }

    getFallbackLabel(): string {
        return 'Calculated line';
    }

    computeLines(orderedThreads: Thread[], referenceLines: LineMap): LineDefinition[] {
        if (!CalculatedThread.isValidFormula(this.formula)) {
            return [];
        }

        const lineData: LineData = {};
        const formula = new Formula(this.formula);
        const tokens = formula.tokenize();

        const placeholders = tokens
            .filter((token) => token.type === 'threadref')
            .reduce<Map<string, LineDefinition>>((threadMap, placeholder) => {
                const threadIndex = parseInt(placeholder.value.substring(1)) - 1;
                if (threadIndex < 0 || threadIndex >= orderedThreads.length) {
                    throw new Error(
                        `Unable to compute thread line ${this.id}: Thread reference ${placeholder.value} doesn't exist`
                    );
                }

                const thread = orderedThreads[threadIndex];
                if (thread.id === this.id) {
                    throw new Error(
                        `Unable to compute thread line ${this.id}: Thread reference ${placeholder.value} points to this calculated thread`
                    );
                }

                if (!Object.keys(referenceLines).includes(thread.id)) {
                    throw new Error(
                        `Unable to compute thread line ${this.id}: Thread reference ${placeholder.value} points thread with ID ${thread.id}, which has no corresponding line.`
                    );
                }

                const line = referenceLines[thread.id].lines[0];
                return threadMap.set(placeholder.value, line);
            }, new Map<string, LineDefinition>());

        const expression = compile(this.formula);
        const dates = getDateRangeFromLines(Array.from(placeholders.values()));
        dates.forEach((date) => {
            const expressionParams: Record<string, number> = {};
            placeholders.forEach((line, threadRef) => {
                expressionParams[threadRef] = line.data[date];
            });
            try {
                lineData[date] = expression.evaluate(expressionParams);
            } catch (error) {}
        });

        const newLines: LineDefinition[] = [
            {
                threadId: this.id,
                label: undefined,
                data: lineData,
            },
        ];
        return newLines;
    }

    static isValidFormula(formulaToCheck: string): boolean {
        try {
            compile(formulaToCheck);
            return true;
        } catch (error) {
            return false;
        }
    }
}
