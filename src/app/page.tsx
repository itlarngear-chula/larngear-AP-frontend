'use client';
import APSelection from '@/components/APSelection';
import Edit from '@/components/Edit';
import PowerButton from '@/components/PowerButton';
import NotificationButton from '@/components/NotificationButton';
import ProfileButton from '@/components/ProfileButton';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            <div className='w-full h-20 flex items-center justify-between gap-2'>
                <PowerButton />
                <ProfileButton />
            </div>
            <NotificationButton />
            {user?.superuser && <Edit user={user} />}
            <APSelection />
        </div>
    );
}
