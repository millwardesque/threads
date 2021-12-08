import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { DataPlotDefinition, DataSourceDefinition, FiltersAndValues, LineData } from '../models/DataSourceDefinition';
import { LineDefinition, LineMap } from '../types';
import { AggregationType } from '../models/Aggregation';
import { Formula } from '../models/Formula';
import { SmoothingType } from '../models/Smoother';
import { ThreadType } from '../types';
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
        exploderDimension: string | undefined
    ) {
        super(id, 'simple', aggregation, smoothing, customLabel, description, dataVersion);
        this.source = source;
        this.plot = plot;
        this.activeFilters = activeFilters;
        this.exploderDimension = exploderDimension;
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
            simpleThread.exploderDimension
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

        const threadIndex1 = parseInt(tokens[0].value.substr(1)) - 1;
        const operator = tokens[1].value;
        const threadIndex2 = parseInt(tokens[2].value.substr(1)) - 1;

        if (orderedThreads.length > threadIndex1 && orderedThreads.length > threadIndex2) {
            const threadId1 = orderedThreads[threadIndex1].id;
            const threadId2 = orderedThreads[threadIndex2].id;
            if (threadId1 === this.id || threadId2 === this.id) {
                console.error(
                    `Unable to compute thread line ${this.id}: At least one thread-reference in equation points to the calculating thread`
                );
            } else if (
                Object.keys(referenceLines).includes(threadId1) &&
                Object.keys(referenceLines).includes(threadId2)
            ) {
                const line1 = referenceLines[threadId1].lines[0];
                const line2 = referenceLines[threadId2].lines[0];
                const line2Dates = Object.keys(line2.data);
                const dates = getDateRangeFromLines([line1, line2]);
                dates.forEach((date) => {
                    const line1Value = line1.data[date] ?? 0;
                    const line2Value = line2.data[date] ?? 0;
                    switch (operator) {
                        case '*':
                            lineData[date] = line1Value * line2Value;
                            break;
                        case '/':
                            if (line2Dates.includes(date) && line2.data[date] !== 0) {
                                lineData[date] = line1Value / line2Value;
                            }
                            break;
                        case '+':
                            lineData[date] = line1Value + line2Value;
                            break;
                        case '-':
                            lineData[date] = line1Value - line2Value;
                            break;
                        default:
                            break;
                    }
                });
            } else {
                console.error(
                    `Unable to compute thread line ${this.id}: At least one thread ID doesn't exist: '${threadId1}' and '${threadId2}'`
                );
            }
        }

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
        const formula = new Formula(formulaToCheck);
        const tokens = formula.tokenize();
        if (tokens.length !== 3) {
            return false;
        } else if (tokens[0].type !== 'threadref') {
            return false;
        } else if (tokens[1].type !== 'operator') {
            return false;
        } else if (tokens[2].type !== 'threadref') {
            return false;
        } else {
            return true;
        }
    }
}
