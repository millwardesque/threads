import ColorProvider from '../models/ColorProvider';

const colorProvider = new ColorProvider();

const useColorProvider = (): ColorProvider => {
    return colorProvider;
};

export default useColorProvider;
