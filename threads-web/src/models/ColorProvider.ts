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
}
