import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useState } from 'react';

export default function NotificationButton(): JSX.Element {
    const { user, fetchUser } = useAuth();

    const [selectedOption, setSelectedOption] = useState<number>(user?.notificationTime!);

    const handleOptionChange = async (newOption: number) => {
        await axios
            .patch(
                process.env.NEXT_PUBLIC_API_URL + '/user/' + user?.studentId,
                {
                    notificationTime: newOption,
                }
            )
            .then(() => setSelectedOption(newOption))
            .catch(() => fetchUser());
    };

    return (
        <div className="flex items-center justify-between w-full rounded-xl shadow-md bg-white px-4 py-6">
            <div>
                <h3 className="font-semibold text-lg text-neutral-800">
                    การแจ้งเตือนล่วงหน้า
                </h3>
                <p className="text-xs text-neutral-500">
                    เลือกเวลาที่ต้องการให้บอทแจ้งเตือนก่อน AP เริ่มต้น (นาที)
                </p>
            </div>
            <div className="flex rounded-full bg-neutral-300 p-1 h-[34px]">
                {[0, 5, 10].map((option) => (
                    <button
                        key={option}
                        onClick={() => handleOptionChange(option)}
                        className={`px-3 py-1 rounded-full text-xs font-medium duration-200 ${
                            selectedOption === option
                                ? 'bg-primary-500 text-white'
                                : 'text-neutral-600 hover:text-neutral-800'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
