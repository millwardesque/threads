import { EditableString } from './EditableString';
import { selectTitle, setTitle } from '../redux/pageSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

export const PageTitle: React.FC = () => {
    const dispatch = useAppDispatch();
    const title = useAppSelector(selectTitle);

    return (
        <EditableString
            initialValue={title}
            onComplete={(newTitle: string) => dispatch(setTitle(newTitle))}
        ></EditableString>
    );
};
