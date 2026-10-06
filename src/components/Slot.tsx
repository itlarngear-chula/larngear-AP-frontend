import { useAuth } from '@/contexts/AuthContext';
import { ISlot } from '@/interfaces/ap';
import moment from 'moment';
import { useState } from 'react';
import { PiPencilSimpleFill } from 'react-icons/pi';
import { FaSquarePhone } from 'react-icons/fa6';
import Link from 'next/link';
import { DepartmentColors } from '@/interfaces/department';

interface SlotProps {
    slot: ISlot;
    page: 'active' | 'upcoming' | 'all';
    setSelectedEditSlot: React.Dispatch<React.SetStateAction<number | null>>;
    showDetails: boolean;
}

const Slot: React.FC<SlotProps> = ({
    slot,
    page,
    setSelectedEditSlot,
    showDetails,
}) => {
    const { user } = useAuth();

    const userColors: { [key: string]: string } = user?.selectedColors ?? {};
    // const userColors: { [key: string]: string } = {
    //     'COOP': 'yellow',
    //     'PLACE': 'red',
    //     'PLAN': 'teal',
    // };

    const start = moment(slot.start).format('HH:mm');
    const end = moment(slot.end).format('HH:mm');

    const contactRegex =
        /(.+?) \((\d{10}|\d{3}-\d{7}|\d{6}-\d{4}|\d{3}-\d{3}-\d{4})\)/;

    const contactMatches = slot.contact.match(contactRegex);

    const currentTime = moment();
    const startTime = moment(moment(slot.start).format('HH:mm:ss'), 'HH:mm:ss');
    const endTime = moment(moment(slot.end).format('HH:mm:ss'), 'HH:mm:ss');
    if (endTime.isBefore(startTime)) endTime.add(1, 'day');
    const isBetween = currentTime.isBetween(startTime, endTime);
    const isSameAsStart =
        currentTime.format('HH:mm') === startTime.format('HH:mm');

    const isActive = isBetween || isSameAsStart;
    const isAnnounced = moment(
        moment(slot.start).format('HH:mm:ss'),
        'HH:mm:ss'
    ).isBefore(currentTime);

    return (
        <div
            id={slot.slot.toString()}
            className={`w-full rounded-xl shadow-md bg-white px-6 py-4 space-y-2 ${isActive
                    ? ''
                    : isAnnounced
                        ? 'opacity-[35%]'
                        : ''
                } ${isActive && page === 'all'
                    ? 'border-[3.5px] border-neutral-500'
                    : ''
                } ${slot.totalOffset
                    ? slot.totalOffset < 0
                        ? 'border-l-2 border-error-600'
                        : slot.totalOffset > 0
                            ? 'border-l-2 border-success-600'
                            : ''
                    : ''
                }`}
        >
            <h3
                className={`font-semibold space-x-4 w-full justify-between flex items-center ${isActive
                    ? 'text-neutral-700'
                    : isAnnounced
                        ? 'text-neutral-500'
                        : 'text-neutral-700'
                    }`}
            >
                <div className='w-full flex justify-left items-center gap-4'>
                    <span>{`#${slot.slot} | ${start === end ? start : `${start} - ${end}`
                        }`}</span>
                    {slot.totalOffset != null && slot.totalOffset !== 0 && (
                        <p className={`text-sm font-medium text-neutral-500 px-2 py-0.5 rounded-full 
                    ${slot.totalOffset < 0 ? `text-error-700 bg-error-100` : `text-success-700 bg-success-100`}`}>
                            {slot.totalOffset < 0
                                ? `-${Math.abs(slot.totalOffset)} นาที`
                                : `+${Math.abs(slot.totalOffset)} นาที`}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {user?.superuser && (
                        <span
                            onClick={() => setSelectedEditSlot(slot.slot)}
                            className="text-lg rounded-lg text-neutral-400 cursor-pointer"
                        >
                            <PiPencilSimpleFill />
                        </span>
                    )}
                </div>
            </h3>
            <div className="flex flex-row space-x-4 justify-between items-center">
                <div className="space-y-2">
                    <h3 className={`font-bold text-lg`}
                        style={{
                            color: DepartmentColors[userColors[slot.department] as keyof typeof DepartmentColors]
                        }}
                    >
                        {slot.department} | {slot.event}
                    </h3>
                    <p className="text-sm text-neutral-500 font-bold">
                        {/* {slot.department} |{' '} */}
                        <a
                            href={`tel:${contactMatches ? contactMatches[2] : ''
                                }`}
                        >
                            ผต. : {slot.contact}
                        </a>
                    </p>
                </div>
                <span className="text-lg rounded-lg text-neutral-300">
                    <a href={`tel:${contactMatches ? contactMatches[2] : ''}`}>
                        <FaSquarePhone
                            size={48}
                            className={'rounded-lg'}
                            style={{
                                color: DepartmentColors[userColors[slot.department] as keyof typeof DepartmentColors]
                            }}
                        />
                    </a>
                </span>
            </div>
            {showDetails && (
                <div className="space-y-2 pt-1">
                    <p className="text-sm font-medium text-neutral-500">
                        สถานที่: {slot.location}
                    </p>
                    {slot.note && (
                        <p className="text-sm font-medium text-neutral-500">
                            หมายเหตุ: {slot.note}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Slot;
