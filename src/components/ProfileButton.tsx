'use client'
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { BiUniversalAccess } from "react-icons/bi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdAccountCircle, MdLogout } from "react-icons/md";

export default function ProfileButton(): JSX.Element {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { logoutHandler } = useAuth();

  return (
    <div className="float-right mb-3" onClick={() => setIsOpen(!isOpen)}>
      <div className="relative w-fit flex items-center justify-between gap-3 rounded-xl shadow-md bg-white px-3 py-2 ">
        <div className=''>
          <MdAccountCircle className='w-8 h-8 fill-primary-500' />
        </div>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex flex-col '>
            <div className='flex items-center gap-2.5'>
              <p className='text-neutral-800 font-bold'>{user?.displayName}</p>
              <div onClick={() => setIsOpen(!isOpen)} className='p-1 cursor-pointer hover:bg-gray-200 hover:rounded-full'>
                {isOpen ? <IoIosArrowUp className='fill-neutral-800' /> : <IoIosArrowDown className='fill-neutral-800' />}
              </div>
            </div>
            {user?.superuser && <p className='text-neutral-800 text-xs'>(ผู้ดูแลระบบ)</p>}
          </div>
        </div>
      </div>
      {
        isOpen && (
          <div className="absolute top-15 w-fit flex flex-col items-center justify-center rounded-xl shadow-md bg-white cursor-pointer ">
            {
              user?.superuser &&
              <Link
                href={'/manage-access'}
                className='w-full flex items-center justify-left gap-3 hover:bg-gray-100 px-4 py-3'>
                <BiUniversalAccess className='w-6 h-6 fill-secondary-400' />
                <p className='text-sm text-neutral-800'>จัดการสิทธิ์</p>
              </Link>
            }
            <div
              onClick={logoutHandler}
              className='w-full flex items-center justify-left gap-2 hover:bg-gray-100 px-4 py-3'>
              <MdLogout className='w-6 h-6 fill-secondary-400' />
              <p className='text-sm text-neutral-800'>ออกจากระบบ</p>
            </div>
          </div>
        )
      }
    </div>
  );
}
