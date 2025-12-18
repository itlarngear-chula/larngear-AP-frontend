'use client';
import APSelection from '@/components/APSelection';
import Edit from '@/components/Edit';
import Logout from '@/components/Logout';
import PowerButton from '@/components/PowerButton';
import NotificationButton from '@/components/NotificationButton';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            <PowerButton />
            <NotificationButton />
            {user?.superuser && <Edit user={user} />}
            <APSelection />
            <Logout />
        </div>
    );
}
