'use client'

import { useAuth } from '@/contexts/AuthContext';
import { IUser } from '@/interfaces/user';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdArrowBackIos } from "react-icons/md";


export default function AccessPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && !currentUser.superuser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const [changes, setChanges] = useState<Record<string, boolean>>({});
  const [allUsers, setAllUsers] = useState<IUser[] | null>(null);
  const [originalAllUsers, setOriginalAllUsers] = useState<IUser[] | null>(null);
  const [isArrowUp, setIsArrowUp] = useState<boolean>(false);
  const [searchStudentId, setSearchStudentId] = useState<string>('');
  const [searchDisplayName, setSearchDisplayName] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + '/user')
        .then((res) => {
          setAllUsers(res.data.data);
          setOriginalAllUsers(res.data.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchAllUsers();
  }, []);

  const handleSave = async () => {
    const promises = Object.entries(changes).map(async ([studentId, newSuperuser]) => {
      try {
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/user/superuser/${studentId}`, {
          superuser: newSuperuser
        });
      } catch (error) {
        console.error(`Error updating ${studentId}:`, error);
        // Revert local state on error
        setAllUsers(prev => prev?.map(u => u.studentId === studentId ? { ...u, superuser: !u.superuser } : u) || null);
      }
    });
    await Promise.all(promises);
    setChanges({});
    setOriginalAllUsers(allUsers); // Update original state after successful save
    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    setAllUsers(originalAllUsers);
    setChanges({});
  };

  const handleToggleSuperuser = (studentId: string, currentSuperuser: boolean) => {
    // Update local state immediately
    setAllUsers(prev => prev?.map(u => u.studentId === studentId ? { ...u, superuser: !u.superuser } : u) || null);
    // Track changes
    setChanges(prev => ({ ...prev, [studentId]: !currentSuperuser }));
  };

  const filteredUsers = allUsers?.filter(user =>
    user.studentId.toLowerCase().includes(searchStudentId.toLowerCase()) &&
    (!searchDisplayName || user.displayName.toLowerCase().includes(searchDisplayName.toLowerCase()))
  ).sort((a, b) => a.studentId.localeCompare(b.studentId));

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='flex justify-between items-center pt-8'>
          <Link href={'/'}><MdArrowBackIos className='w-4 h-4' /></Link>
          <p className='font-bold'>จัดการสิทธิ์</p>
          <div></div>
        </div>
        <div className={`flex justify-between gap-3 py-4 ${isArrowUp ? 'items-start' : 'items-center'}`}>
          <div
            onClick={() => setIsArrowUp(!isArrowUp)}
            className='cursor-pointer p-1 rounded-full bg-primary-500'>
            {isArrowUp ? <IoIosArrowUp className='fill-white' /> : <IoIosArrowDown className='fill-white' />}
          </div>
          <div className='w-full flex flex-col gap-2'>
            <input type='text' placeholder='ค้นหาด้วยรหัสนิสิต'
              className='w-full rounded-full shadow-md text-center py-2 focus:outline-none'
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)} />
            {
              isArrowUp && <input type='text' placeholder='ค้นหาด้วยชื่อ'
                className='w-full rounded-full shadow-md text-center py-2 focus:outline-none'
                value={searchDisplayName}
                onChange={(e) => setSearchDisplayName(e.target.value)} />
            }
          </div>
          {/* <button className='px-4 py-2 rounded-full bg-primary-500 text-white'>ค้นหา</button> */}
        </div>
        <div>
          {
            filteredUsers?.map((user, index) => (
              user._id != currentUser?._id &&
              <div key={user._id || index} className="flex justify-left gap-10 items-center p-2">
                <button
                  onClick={() => handleToggleSuperuser(user.studentId, user.superuser)}
                  className={`flex p-1 w-10 h-6 rounded-full duration-200 ${user.superuser
                    ? 'pl-5 bg-primary-500'
                    : 'pl-1 bg-neutral-300'
                    }`}
                >
                  <div className="h-full aspect-square rounded-full bg-white duration-300"></div>
                </button>
                <p>{user.studentId}</p>
                <p>{user.displayName}</p>
              </div>
            ))
          }
        </div>
      </div>
      <div className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-screen-sm px-4 pb-10 pt-3 rounded-t-lg bg-white z-10'>
        <div className='flex gap-4 mt-4'>
          <button
            onClick={handleCancel}
            className='w-1/2 py-1.5 rounded-full border border-gray-400 text-gray-600 bg-white'
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className={`w-1/2 py-1.5 rounded-full ${Object.keys(changes).length > 0 ? 'bg-primary-500 text-white' : 'bg-gray-400 text-white'}`}
            disabled={Object.keys(changes).length <= 0}
          >
            บันทึก
          </button>
        </div>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <p className="text-center text-lg font-semibold">เปลี่ยนแปลงสิทธิ์สำเร็จ</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 w-full py-2 bg-primary-500 text-white rounded-full"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </>
  );
}