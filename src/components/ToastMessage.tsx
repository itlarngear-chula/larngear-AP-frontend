import { useEffect } from 'react';
import { FiCheckCircle, FiX, FiXCircle } from 'react-icons/fi';

export interface ToastMessageData {
    type: 'success' | 'error';
    title: string;
    message: string;
}

interface ToastMessageProps extends ToastMessageData {
    onClose: () => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
    type,
    title,
    message,
    onClose,
}) => {
    useEffect(() => {
        const timeout = window.setTimeout(onClose, 5000);
        return () => window.clearTimeout(timeout);
    }, [onClose]);

    const isSuccess = type === 'success';
    const Icon = isSuccess ? FiCheckCircle : FiXCircle;

    return (
        <div
            role={isSuccess ? 'status' : 'alert'}
            className={`fixed left-4 right-4 top-4 z-[60] mx-auto flex max-w-screen-sm items-center gap-4 rounded-xl border-l-[10px] px-4 py-3 shadow-md ${
                isSuccess
                    ? 'border-success-500 bg-success-100 text-success-900'
                    : 'border-error-500 bg-error-100 text-error-900'
            }`}
        >
            <Icon
                aria-hidden="true"
                className={`h-8 w-8 shrink-0 ${
                    isSuccess ? 'text-success-600' : 'text-error-600'
                }`}
            />
            <div className="min-w-0 flex-1">
                <p className="text-lg font-bold leading-tight">{title}</p>
                <p className="mt-1 break-words text-base leading-tight">
                    {message}
                </p>
            </div>
            <button
                type="button"
                aria-label="ปิดข้อความแจ้งเตือน"
                onClick={onClose}
                className="shrink-0 rounded p-1 hover:bg-black/5"
            >
                <FiX aria-hidden="true" className="h-5 w-5" />
            </button>
        </div>
    );
};

export default ToastMessage;