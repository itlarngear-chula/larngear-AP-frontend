import { ISlot } from '@/interfaces/ap';

export interface VerticalTimelineBoardProps {
    slots: ISlot[] | null;
    setSelectedEditSlot: React.Dispatch<React.SetStateAction<number | null>>;
}