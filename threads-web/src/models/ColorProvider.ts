import randomColor from 'randomcolor';
const MAX_COLORS = 1000;

export interface Color {
    dark: string,
    light: string
}

export default class ColorProvider {
    index: number;
    lightColors: string[];
    darkColors: string[];

    constructor() {
        this.index = 0;
        this.lightColors = randomColor({
            seed: 0,
            count: MAX_COLORS,
            luminosity: 'light'
        });
        this.darkColors = randomColor({
            seed: 0,
            count: MAX_COLORS,
            luminosity: 'dark'
        });
    }

    next(): Color {
        const color: Color = {
            light: this.lightColors[this.index],
            dark: this.darkColors[this.index],
        };
        this.index = (this.index + 1) % MAX_COLORS;
        return color;
    }

    atIndex(index: number): Color {
        if (index < 0 || index >= MAX_COLORS) {
            console.warn(`Unable to fetch colour, Requested index ${index} isn't in the valid range: 0 - ${MAX_COLORS - 1}.`);
            index = 0;
        }

        return {
            light: this.lightColors[index],
            dark: this.darkColors[index],
        };
    }
}
