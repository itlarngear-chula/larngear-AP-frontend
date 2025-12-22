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
            <ProfileButton />
            <PowerButton />
            <NotificationButton />
            {user?.superuser && <Edit user={user} />}
            <APSelection />
        </div>
    );
}
