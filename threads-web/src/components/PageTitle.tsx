import { EditableString } from './EditableString';
import { selectTitle, setTitle } from '../redux/pageSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

export const PageTitle: React.FC = () => {
    const dispatch = useAppDispatch();
    const title = useAppSelector(selectTitle);

    return (
        <div className="flex w-full h-12 bg-green-400 items-center justify-center">
            <EditableString
                initialValue={title}
                onComplete={(newTitle: string) => dispatch(setTitle(newTitle))}
            ></EditableString>
        </div>
    );
};
