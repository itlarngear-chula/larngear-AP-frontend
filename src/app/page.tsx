'use client';
import APSelection from '@/components/APSelection';
import Edit from '@/components/Edit';
import PowerButton from '@/components/PowerButton';
import NotificationButton from '@/components/NotificationButton';
import ProfileButton from '@/components/ProfileButton';
import ToastMessage, { ToastMessageData } from '@/components/ToastMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Home() {
    const { user } = useAuth();
    const [toast, setToast] = useState<ToastMessageData | null>(null);

    return (
        <>
            <div className="space-y-4">
                <div className='w-full h-20 flex items-center justify-between gap-2'>
                    <PowerButton />
                    <ProfileButton />
                </div>
                <NotificationButton />
                {user?.superuser && (
                    <Edit
                        user={user}
                        hasSelectedSlot={false}
                        onToast={setToast}
                    />
                )}
                <APSelection />
            </div>
            {toast && (
                <ToastMessage
                    {...toast}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
