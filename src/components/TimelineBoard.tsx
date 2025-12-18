import React, { useState, useEffect } from 'react';
import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
} from 'react-calendar-timeline';
import './TimelineBoard.css';
import moment from 'moment';
import 'moment/locale/th';
import { ISlot } from '@/interfaces/ap';
import { TimelineBoardProps } from '@/interfaces/swimlane';
import { DepartmentColors } from '@/interfaces/department';
import { useAuth } from '@/contexts/AuthContext';
import Slot from './Slot';
import { PiX, PiFunnelFill } from 'react-icons/pi';

export default function TimelineBoard({ slots, setSelectedEditSlot }: TimelineBoardProps) {
    const { user } = useAuth();
    const [selectedSlotData, setSelectedSlotData] = useState<ISlot | null>(null);

    const [isFilter, setIsFilter] = useState<boolean>(false);

    useEffect(() => {
        setIsFilter((localStorage.getItem('isFilter') as 'true' | 'false') === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('isFilter', isFilter.toString());
    }, [isFilter]);

    const [visibleTimeStart, setVisibleTimeStart] = useState(moment().add(-1, 'hour').valueOf());
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(moment().add(11, 'hour').valueOf());

    const filteredSlots = React.useMemo(() => {
        if (!slots) return [];
        
        if (isFilter && user?.selectedDepartments) {
            return slots.filter((slot) => user.selectedDepartments.includes(slot.department));
        }
        
        return slots;
    }, [slots, isFilter, user]);

    const groups = React.useMemo(() => {
        if (!filteredSlots) return [];
        const uniqueDepts = Array.from(new Set(filteredSlots.map((s) => s.department)));
        return uniqueDepts.map((dept) => ({ id: dept, title: dept }));
    }, [filteredSlots]);

    const userColors: Record<string, keyof typeof DepartmentColors> = (user?.selectedColors as Record<string, keyof typeof DepartmentColors>) ?? {};

    const items = React.useMemo(() => {
        if (!filteredSlots) return [];
        return filteredSlots.map((slot) => {
            const startTime = moment(slot.start);
            let endTime = moment(slot.end);

            const startTimeOnly = moment(moment(slot.start).format('HH:mm:ss'), 'HH:mm:ss');
            const endTimeOnly = moment(moment(slot.end).format('HH:mm:ss'), 'HH:mm:ss');

            if (endTimeOnly.isBefore(startTimeOnly)) {
                endTime = moment(slot.end).add(1, 'day');
            }

            const colorName = userColors[slot.department];
            const deptColor = DepartmentColors[colorName as keyof typeof DepartmentColors] || '#9ca3af';

            const isPast = endTime.isBefore(moment());

            return {
                id: slot.slot,
                group: slot.department,
                title: slot.event,
                start_time: startTime,
                end_time: endTime,
                canMove: false,
                canResize: false,
                canChangeGroup: false,
                itemProps: {
                    style: {
                        background: deptColor,
                        borderRadius: '6px',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        filter: isPast ? 'saturate(0.2) brightness(1.2)' : 'none',
                    },
                },
                originalData: slot
            };
        });
    }, [filteredSlots, user]);

    const handleItemSelect = (itemId: number, e: any, time: number) => {
        const found = slots?.find((s) => s.slot === itemId);
        if (found) setSelectedSlotData(found);
    };

    const handleTimeChange = (visibleTimeStart: number, visibleTimeEnd: number, updateScrollCanvas: (start: number, end: number) => void) => {
        setVisibleTimeStart(visibleTimeStart);
        setVisibleTimeEnd(visibleTimeEnd);
        updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    };

    const defaultTimeStart = moment().add(-1, 'hour');
    const defaultTimeEnd = moment().add(11, 'hour');

    if (!slots || groups.length === 0 && !isFilter) return <div className="p-4 text-center">Loading...</div>;

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-2 overflow-hidden">
                <Timeline
                    stackItems={true}   // Display items in stacked manner
                    groups={groups}
                    items={items}
                    selected={selectedSlotData ? [selectedSlotData.slot] : []}
                    onCanvasClick={() => setSelectedSlotData(null)}
                    defaultTimeStart={defaultTimeStart}
                    defaultTimeEnd={defaultTimeEnd}
                    sidebarWidth={120}
                    lineHeight={60}
                    itemHeightRatio={0.70}
                    canMove={false}
                    canResize={false}
                    onItemSelect={handleItemSelect}
                    visibleTimeStart={visibleTimeStart}
                    visibleTimeEnd={visibleTimeEnd}
                    onTimeChange={handleTimeChange}
                    minZoom={60 * 60 * 1000}            // ZoomIn min = 1 hr
                    maxZoom={1 * 24 * 60 * 60 * 1000}   // ZoomOut max = 1 Day
                    timeSteps={{
                        second: 1,
                        minute: 15,
                        hour: 1,
                        day: 1,
                        month: 1,
                        year: 1
                    }}
                >
                    <TimelineHeaders className="sticky top-0 z-20 bg-white">
                        <SidebarHeader>
                            {({ getRootProps }) => {
                                return <div {...getRootProps()} className="flex items-center justify-center gap-2 bg-neutral-100 font-semibold !text-neutral-800 text-md border-r border-b border-neutral-200 cursor-pointer"
                                     onClick={() => setIsFilter(!isFilter)}
                                >
                                    <span>Dept.</span>
                                    <PiFunnelFill className={`${isFilter ? 'text-primary-500' : 'text-neutral-400'}`} />
                                </div>;
                            }}
                        </SidebarHeader>

                        <DateHeader unit="day" height={30} className="h-8 border-b border-neutral-300 bg-neutral-100">
                            {({ getRootProps, data: { label } }) => {
                                const rootProps: any = getRootProps();
                                const { style, className, ...rest } = rootProps;
                                return (
                                    <div
                                        style={{ ...style }}
                                        className={`${className} bg-neutral-100 text-neutral-600 font-bold`}
                                        {...rest}
                                    >
                                        <span className="sticky left-0 px-2 inline-block z-10 w-max bg-neutral-100/80 backdrop-blur-[2px] rounded-r-md shadow-sm border-r border-neutral-200/50">
                                            {label}
                                        </span>
                                    </div>
                                );
                            }}
                        </DateHeader>

                        <DateHeader
                            unit="hour"
                            height={24}
                            intervalRenderer={({ getIntervalProps, intervalContext }: any) => {
                                const duration = visibleTimeEnd - visibleTimeStart;
                                const oneDay = 24 * 60 * 60 * 1000;

                                const hour = moment(intervalContext.interval.startTime).hour();

                                let showLabel = true;

                                if (duration > oneDay * 3) {
                                    if (hour % 6 !== 0) showLabel = false;
                                } else if (duration > oneDay) {
                                    if (hour % 3 !== 0) showLabel = false;
                                }

                                if (!showLabel) return <div {...getIntervalProps()} />;

                                return (
                                    <div
                                        {...getIntervalProps()}
                                        className="rct-date-header-item bg-white text-neutral-400 text-xs border-b border-neutral-200 border-l border-neutral-100 h-full flex items-center justify-center"
                                    >
                                        <span>
                                            {intervalContext.intervalText}
                                        </span>
                                    </div>
                                );
                            }}
                        />
                    </TimelineHeaders>
                </Timeline>

                <p className="text-xs text-center text-gray-400 mt-2">
                    เลื่อนซ้าย-ขวา หรือถ่างนิ้วเพื่อซูมเวลา | กดที่ Dept. เพื่อกรองแผนก
                </p>
            </div>

            {selectedSlotData && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedSlotData(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 z-[1001]">
                        <button
                            onClick={() => setSelectedSlotData(null)}
                            className="absolute top-3 right-3 p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 z-10 text-neutral-600"
                        >
                            <PiX className="text-xl" />
                        </button>

                        <div className="p-1">
                            <Slot
                                slot={selectedSlotData}
                                page="all"
                                setSelectedEditSlot={(id) => {
                                    setSelectedEditSlot(id);
                                    setSelectedSlotData(null);
                                }}
                                showDetails={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}