'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ISlot } from '@/interfaces/ap';
import TimelineBoard from '@/components/TimelineBoard';
import VerticalTimelineBoard from '@/components/VerticalTimelineBoard';
import Edit from '@/components/Edit';
import Link from 'next/link';
import { PiListBullets } from 'react-icons/pi'; 

export default function TimelinePage() {
    const { user } = useAuth();
    const [slots, setSlots] = useState<ISlot[] | null>(null);
    const [selectedEditSlot, setSelectedEditSlot] = useState<number | null>(null);

    const config = {
        headers: {
            'ngrok-skip-browser-warning': '1',
        },
    };
    const fetchSlots = async () => {
        try {
            const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/ap', config);
            setSlots(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* Header / Nav */}
            <div className="px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-neutral-800">Timeline View</h1>
                <Link href="/slots" className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm text-sm font-bold text-neutral-600">
                    <PiListBullets size={20}/> กลับไปมุมมองปกติ
                </Link>
            </div>

            {/* Timeline Component */}
            <div className="px-2">
                {/* <TimelineBoard 
                    slots={slots} 
                    setSelectedEditSlot={setSelectedEditSlot} 
                /> */}
                <VerticalTimelineBoard 
                    slots={slots} 
                    setSelectedEditSlot={setSelectedEditSlot} 
                />
            </div>

             {selectedEditSlot && (
                <div className="z-50 fixed bottom-0 left-0 right-0 rounded-t-3xl bg-neutral-50 shadow-3xl flex justify-center items-center px-2 py-6">
                    <Edit
                        slot={selectedEditSlot}
                        onFinished={() => {
                            fetchSlots();
                            setSelectedEditSlot(null);
                        }}
                        user={user}
                    />
                </div>
            )}
             {selectedEditSlot && (
                <div
                    onClick={() => setSelectedEditSlot(null)}
                    className="z-40 fixed top-0 bottom-0 left-0 right-0 bg-black/10 backdrop-blur-sm"
                ></div>
            )}
        </div>
    );
}