import { ISlot } from '@/interfaces/ap';

export interface TimelineBoardProps {
    slots: ISlot[] | null;
    setSelectedEditSlot: React.Dispatch<React.SetStateAction<number | null>>;
}