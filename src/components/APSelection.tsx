import { useAuth } from '@/contexts/AuthContext';
import { departments } from '@/interfaces/orgChart';
import { LarngearCampDepartment, TDepartment, DepartmentColors, TDepartmentColors
} from '@/interfaces/department';
import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';

export default function APSelection(): JSX.Element {
    const { user, fetchUser } = useAuth();

    const selectedData = user?.selectedDepartments ?? [];
    const userColors = user?.selectedColors ?? {};
    const [selectedAP, setSelectedAP] = useState<string[]>(selectedData);
    const [selectedColors, setSelectedColors] = useState<Record<string, string>>(userColors);
    const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const defaultColor = 'default'; // Replace with your default color
        const updatedColors = { ...selectedColors };

        Object.keys(departments).forEach((department) => {
            departments[department as keyof typeof departments].forEach((ap) => {
                if (!updatedColors[ap.shortName]) {
                    updatedColors[ap.shortName] = defaultColor;
                }
            });
        });
        setSelectedColors(updatedColors);
    }, []);

    const saveHandler = async () => {
        await axios
            .patch(
                process.env.NEXT_PUBLIC_API_URL + '/user/' + user?.studentId,
                {
                    notificationTime: 0,
                    selectedDepartments: selectedAP,
                    selectedColors: selectedColors,
                }
            )
            .then(() => fetchUser())
            .catch(() => fetchUser());
    };

    interface HandleColorSelectParams {
        department: string;
        color: string;
    }

    const handleColorSelect = ({ department, color }: HandleColorSelectParams): void => {
        setSelectedColors((prevColors) => ({
            ...prevColors,
            [department]: color,
        }));
    };

    const handleClickOutside = (event: MouseEvent): void => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full rounded-xl shadow-md bg-white px-5 py-4 space-y-1">
            <h3 className="font-semibold text-lg text-neutral-800 pt-2">
                    เลือกฝ่ายที่ต้องการแจ้งเตือน AP
                </h3>
             {selectedAP.length === 0 && (
                <div className="text-error-500 text-sm font-normal pl-1">
                    อย่าลืมเลือกฝ่ายเพื่อรับการแจ้งเตือนด้วยนะ!
                </div>
            )}
            <div className="flex pt-1">
                <button
                    onClick={() => {
                        setSelectedAP(
                            Object.keys(departments)
                                .map(
                                    (department) =>
                                        departments[
                                            department as keyof typeof departments
                                        ]
                                )
                                .flat()
                                .map((ap) => ap.shortName)
                        );
                    }}
                    className="bg-primary-500/90 text-white font-medium text-sm rounded-tl-2xl rounded-bl-2xl px-3 py-2"
                >
                    เลือกทุกฝ่าย
                </button>
                <button
                    onClick={() => {
                        setSelectedAP([]);
                    }}
                    className="border-2 border-primary-500/90 bg-primary-500/10 text-primary-500 font-medium text-sm rounded-tr-2xl rounded-br-2xl px-3 py-2"
                >
                    ล้างการเลือก
                </button>
            </div>
            {Object.keys(departments).map((department) => (
                <div key={department} className="pt-1">
                    {/* <p className="font-medium text-neutral-500">{department}</p> */}
                    {departments[department as keyof typeof departments].map(
                        (ap) => (
                            <div key={ap.shortName}>
                                <div className="flex items-center space-x-3 py-2 mt-1 w-full">
                                    <button
                                        className="flex items-center space-x-3"
                                        onClick={() => {
                                            if (selectedAP.includes(ap.shortName)) {
                                                setSelectedAP(
                                                    selectedAP.filter(
                                                        (selected) =>
                                                            selected !== ap.shortName
                                                    )
                                                );
                                            } else {
                                                setSelectedAP([
                                                    ...selectedAP,
                                                    ap.shortName,
                                                ]);
                                            }
                                        }}
                                    >
                                        {selectedAP.includes(ap.shortName) ? (
                                            <FiCheckSquare className="text-2xl text-primary-500" />
                                        ) : (
                                            <FiSquare className="text-2xl text-neutral-300" />
                                        )}
                                        <p
                                            className={`font-medium ${
                                                selectedAP.includes(ap.shortName)
                                                    ? 'text-neutral-900'
                                                    : 'text-neutral-500'
                                            }`}
                                        >
                                            {ap.name}
                                        </p>
                                    </button>
                                    <div key={ap.shortName} className="relative inline-block text-left">
                                        <button
                                            className={`text-xs font-medium rounded-lg px-2 py-1 flex items-center space-x-1`}
                                            style={{
                                                color: DepartmentColors[selectedColors[ap.shortName] as keyof typeof DepartmentColors],
                                                backgroundColor: `${DepartmentColors[selectedColors[ap.shortName] as keyof typeof DepartmentColors]}20`,
                                                border: `1.5px solid ${DepartmentColors[selectedColors[ap.shortName] as keyof typeof DepartmentColors]}`
                                            }}
                                            onClick={() => setIsDropdownOpen((isDropdownOpen === ap.shortName ? null : ap.shortName))}
                                        >
                                            <span>{ap.shortName}</span>
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                ></path>
                                            </svg>
                                        </button>
                                        {isDropdownOpen === ap.shortName && (
                                        <div ref={dropdownRef} className="absolute full top-0 w-30 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <div className="py-1 px-1 grid grid-cols-4 gap-2">
                                                {Object.keys(DepartmentColors).map((color) => (
                                                    <button
                                                        key={color}
                                                        className="w-6 h-6 rounded-full"
                                                        style={{ backgroundColor: DepartmentColors[color as keyof typeof DepartmentColors] }}
                                                        onClick={() => handleColorSelect({ department: ap.shortName, color })}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            ))}
            {(JSON.stringify(selectedAP) !== JSON.stringify(selectedData) || 
             JSON.stringify(selectedColors) !== JSON.stringify(userColors)) && (
                <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-base text-neutral-500">อย่าลืมกดบันทึก</p>
                    <button
                        onClick={saveHandler}
                        className="bg-primary-500 rounded-lg px-6 py-2 text-white font-medium"
                    >
                        บันทึก
                    </button>
                </div>
            )}
            <div className="flex px-2 justify-center mt-4">
                <a
                    href="/slots"
                    className="bg-primary-500 w-full text-white text-center rounded-2xl mt-4 px-6 py-3 font-semibold"
                >
                    ไปดูหน้า AP Slots
                </a>
            </div>
        </div>
    );
}
