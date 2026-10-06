import { ISlot } from '@/interfaces/ap';
import { IUser } from '@/interfaces/user';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { BarLoader } from 'react-spinners';
import moment from 'moment';
import { ToastMessageData } from '@/components/ToastMessage';

interface EditProps {
    slot?: number;
    onFinished?: () => void;
    onCancel?: () => void;
    onToast: (toast: ToastMessageData) => void;
    user: IUser | null;
    hasSelectedSlot: boolean;
}

const Edit: React.FC<EditProps> = ({
    slot: inputSlot,
    onFinished,
    onCancel,
    onToast,
    user,
    hasSelectedSlot,
}) => {
    const [offset, setOffset] = useState<number>(0);
    const [slot, setSlot] = useState<number>(0);
    const [changedSlot, setChangedSlot] = useState<number>(0);
    const [upcomingSlot, setUpcomingSlot] = useState<ISlot | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [slots, setSlots] = useState<ISlot[] | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const config = {
        headers: {
            'ngrok-skip-browser-warning': '1',
        },
    };

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const res = await axios.get(
                    process.env.NEXT_PUBLIC_API_URL + '/ap',
                    config
                );

                const fetchedSlots: ISlot[] = Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

                setSlots(fetchedSlots);

                const upcomingSlots = fetchedSlots.filter((slot: ISlot) => {
                    const currentTime = moment();
                    const startTime = moment(
                        moment(slot.start).format('HH:mm:ss'),
                        'HH:mm:ss'
                    );

                    return startTime.isAfter(currentTime);
                });

                setSlot(upcomingSlots[0]?.slot ?? 1);
                if (hasSelectedSlot) {
                    setChangedSlot(inputSlot || upcomingSlots[0]?.slot);
                } else setChangedSlot(upcomingSlots[0]?.slot);
            } catch (error) {
                console.error(error);
                setSlot(1);
            }
        };

        fetchSlots();
    }, []);

    const announceHandler = async () => {
        setIsLoading(true);
        const targetSlot = changedSlot || inputSlot || slot;

        if (!user?.userId || !user.displayName) {
            onToast({
                type: 'error',
                title: 'แก้ไข AP ไม่สำเร็จ',
                message: 'เกิดข้อผิดพลาด',
            });
            setOffset(0);
            setIsLoading(false);
            onFinished?.();
            return;
        }

        try {
            await axios.patch(process.env.NEXT_PUBLIC_API_URL + '/ap/offset', {
                slot: targetSlot,
                offset,
                userId: user.userId,
                displayName: user.displayName,
                reason: reason || '-',
            });
            onToast({
                type: 'success',
                title: 'แก้ไข AP สำเร็จ',
                message: `ตั้งแต่ #${String(targetSlot).padStart(3, '0')} ${offset > 0 ? '+' : ''}${offset} นาที`,
            });
        } catch (error) {
            console.error(error);
            onToast({
                type: 'error',
                title: 'แก้ไข AP ไม่สำเร็จ',
                message: 'เกิดข้อผิดพลาด',
            });
        } finally {
            setOffset(0);
            setIsLoading(false);
            onFinished?.();
        }
    };

    const cancelHandler = () => {
        if (hasSelectedSlot) {
            onCancel?.();
            return;
        }

        setOffset(0);
        setReason(null);
        setChangedSlot(slot);
    };

    if (isLoading)
        return (
            <div className="flex flex-col justify-center items-center w-full rounded-xl px-6 py-4 select-none h-36 space-y-4">
                <BarLoader color="#8B5CF6" />
                <p className="font-bold text-neutral-400 text-xs">
                    รอแปปนะฮะ...
                </p>
            </div>
        );

    return (
        <div className="w-full flex flex-col items-center rounded-xl shadow-md bg-white px-4 py-6 gap-6">
            <div className="w-full flex justify-center items-center gap-2">
                <div className="w-full flex items-center justify-center space-x-2">
                    <div
                        onClick={() =>
                            setChangedSlot((prev) =>
                                prev >= slot ? prev - 1 : prev
                            )
                        }
                        className="text-xs text-neutral-700 rounded-full shadow-md p-3 bg-white"
                    >
                        <FiMinus />
                    </div>
                    <div className="flex flex-col items-center space-x-2 gap-2">
                        <span className="whitespace-nowrap text-xs font-bold text-neutral-400">ตั้งแต่ Slot:</span>
                        <span className="font-bold text-primary-500 text-4xl">
                            {changedSlot || 1}
                        </span>
                    </div>
                    <div
                        onClick={() => setChangedSlot((prev) => prev + 1)}
                        className="text-xs text-neutral-700 rounded-full shadow-md p-3 bg-white"
                    >
                        <FiPlus />
                    </div>
                </div>
                <div className="w-full flex items-center justify-center space-x-2">
                    <div
                        onClick={() => setOffset((prev) => prev - 5)}
                        className="text-xs text-neutral-700 rounded-full shadow-md p-3 bg-white"
                    >
                        <FiMinus />
                    </div>
                    <div className="flex flex-col items-center space-x-2 gap-2">
                        <span className="whitespace-nowrap text-xs font-bold text-neutral-400">เวลา (นาที)</span>
                        <div className='space-x-1'>
                            <span className="font-bold text-primary-500 text-4xl">
                                {offset === 0
                                    ? 0
                                    : offset > 0
                                        ? `+${offset}`
                                        : offset}
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => setOffset((prev) => prev + 5)}
                        className="text-xs text-neutral-700 rounded-full shadow-md p-3 bg-white"
                    >
                        <FiPlus />
                    </div>

                </div>
            </div>
            {
                hasSelectedSlot ? null : (
                    <span className='text-xs text-neutral-600'>หมายเหตุ: เลข Slot ที่แสดงคือ Slot ที่กำลังจะถึง ไม่ใช่ Slot ปัจจุบัน</span>

                )
            }
            <div className='w-full'>
                <div className="mb-2 flex flex-wrap gap-2">
                    {[
                        'ฝนตก',
                        `กิจกรรมใช้เวลาเกินกำหนด`,
                        `กิจกรรมใช้เวลาน้อยกว่ากำหนด`,
                    ].map((suggestedReason) => (
                        <button
                            key={suggestedReason}
                            type="button"
                            onClick={() => setReason(suggestedReason)}
                            className="rounded-2xl bg-white border border-primary-500 px-4 py-2 text-xs text-primary-500 hover:bg-primary-50"
                        >
                            {suggestedReason}
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                className="w-full rounded-lg h-24 bg-neutral-400 focus:outline-none bg-primary-50 text-sm p-2"
                value={reason || ""}
                onChange={(event) => setReason(event.target.value)}
                placeholder="หมายเหตุ (optional)"
            />
            {(hasSelectedSlot || offset !== 0) && (
                <div className='w-full flex items-center justify-between gap-4'>
                    <button
                        type="button"
                        onClick={cancelHandler}
                        className="flex-1 font-bold bg-white text-primary-500 border border-primary-500 px-6 py-3 rounded-2xl shadow-md text-sm"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={announceHandler}
                        disabled={offset === 0}
                        className="flex-[3] font-bold text-white bg-primary-500 px-6 py-3 rounded-2xl shadow-md text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ประกาศ
                    </button>
                </div>
            )}
        </div>
    );
};

export default Edit;
