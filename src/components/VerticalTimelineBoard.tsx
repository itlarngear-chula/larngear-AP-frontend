import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/th';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ISlot } from '@/interfaces/ap';
import { DepartmentColors } from '@/interfaces/department';
import { useAuth } from '@/contexts/AuthContext';
import Slot from './Slot';
import { PiX, PiFunnelFill } from 'react-icons/pi';

const localizer = momentLocalizer(moment);

interface VerticalTimelineBoardProps {
    slots: ISlot[] | null;
    setSelectedEditSlot: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function VerticalTimelineBoard({ slots, setSelectedEditSlot }: VerticalTimelineBoardProps) {
    const { user } = useAuth();
    const [selectedSlotData, setSelectedSlotData] = useState<ISlot | null>(null);

    const [isFilter, setIsFilter] = useState<boolean>(false);

    useEffect(() => {
        setIsFilter((localStorage.getItem('isFilter') as 'true' | 'false') === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('isFilter', isFilter.toString());
    }, [isFilter]);

    const filteredSlots = useMemo(() => {
        if (!slots) return [];
        if (isFilter && user?.selectedDepartments) {
            return slots.filter((slot) => user.selectedDepartments.includes(slot.department));
        }
        return slots;
    }, [slots, isFilter, user]);

    const resourceMap = useMemo(() => {
        if (!filteredSlots) return [];
        const uniqueDepts = Array.from(new Set(filteredSlots.map((s) => s.department)));

        uniqueDepts.sort();
        return uniqueDepts.map((dept) => ({ id: dept, title: dept }));
    }, [filteredSlots]);

    const events = useMemo(() => {
        if (!filteredSlots) return [];
        return filteredSlots.map((slot) => {

            const startRaw = slot.start.replace('Z', '');
            const endRaw = slot.end.replace('Z', '');
            
            const startDate = moment(startRaw).toDate();
            let endDate = moment(endRaw).toDate();

            if (moment(endDate).isBefore(startDate)) {
                endDate = moment(endRaw).add(1, 'day').toDate();
            }

            return {
                ...slot, 
                title: slot.event,
                start: startDate,
                end: endDate,
                resourceId: slot.department, 
            };
        });
    }, [filteredSlots]);

    const eventPropGetter = (event: any) => {
        const userColors: Record<string, string> = user?.selectedColors ?? {};
        const colorName = userColors[event.department] as keyof typeof DepartmentColors;
        const deptColor = DepartmentColors[colorName] || '#9ca3af';

        const isPast = moment(event.end).isBefore(moment());

        return {
            style: {
                backgroundColor: deptColor,
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                filter: isPast ? 'saturate(0.2) brightness(1.2)' : 'none',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'block',
                lineHeight: '1.2',
                padding: '4px'
            }
        };
    };

    if (!slots) return <div className="p-10 text-center">Loading...</div>;

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-4 h-[85vh] overflow-hidden flex flex-col">
                
                {/* Filter BTN. */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-xl font-bold text-neutral-700">ตารางประจำวัน</h2>
                    <button 
                        onClick={() => setIsFilter(!isFilter)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                            isFilter 
                            ? 'bg-primary-50 border-primary-200 text-primary-600' 
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="text-sm font-bold">Filter Dept.</span>
                        <PiFunnelFill className={isFilter ? 'text-primary-500' : 'text-neutral-400'} />
                    </button>
                </div>

                {/* Calendar */}
                <div className="flex-1 overflow-y-auto">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        defaultView={Views.DAY}
                        dayLayoutAlgorithm="no-overlap"
                        views={['day']}         
                        step={30}               // Freq Bandwidth = 30 min
                        timeslots={2}        
                        resources={resourceMap} 
                        resourceIdAccessor="id"
                        resourceTitleAccessor="title"
                        onSelectEvent={(event) => setSelectedSlotData(event as unknown as ISlot)}
                        eventPropGetter={eventPropGetter}

                        scrollToTime={new Date(1970, 1, 1, 8, 0, 0)} 
                        
                        className="font-ibm-plex"
                    />
                </div>
            </div>

            {/* Modal */}
            {selectedSlotData && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedSlotData(null)}
                    ></div>
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