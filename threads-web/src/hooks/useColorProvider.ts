import ColorProvider from '../models/ColorProvider';

console.log("Creating new color provider");
const colorProvider = new ColorProvider();

const useColorProvider = (): ColorProvider => {
    return colorProvider;
}

export default useColorProvider;