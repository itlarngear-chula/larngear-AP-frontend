import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useState } from 'react';

export default function PowerButton(): JSX.Element {
    const { user, fetchUser } = useAuth();

    const [isAnnounce, setIsAnnounce] = useState<boolean>(user?.enableBot!);

    const toggleHandler = async () => {
        await axios
            .patch(
                process.env.NEXT_PUBLIC_API_URL + '/user/' + user?.studentId,
                {
                    enableBot: !isAnnounce,
                }
            )
            .then(() => setIsAnnounce(!isAnnounce))
            .catch(() => fetchUser());
    };

    return (
        <div className="flex items-center justify-between gap-2 w-full h-full rounded-xl shadow-md bg-white px-3 py-2">
            <div>
                <h3 className="font-bold text-sm text-neutral-800">
                    เปิดใช้งานบอท
                </h3>
                <p className="text-xs text-neutral-500">
                    เปิดเพื่อแจ้ง AP เลย!
                </p>
            </div>
            <button
                onClick={toggleHandler}
                className={`flex p-1 w-14 h-[30px] rounded-full duration-200 ${isAnnounce
                        ? 'pl-[30px] bg-primary-500'
                        : 'pl-1 bg-neutral-300'
                    }`}
            >
                <div className="h-full aspect-square rounded-full bg-white duration-300"></div>
            </button>
        </div>
    );
}
