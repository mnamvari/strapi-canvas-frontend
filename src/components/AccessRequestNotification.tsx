import React from "react";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";

interface AccessRequestProps {
    isOpen: boolean;
    requestData: {
        requestId: string;
        email: string;
        canvasId: string;
    } | null;
    onApprove: () => void;
    onDeny: () => void;
}

const AccessRequestNotification: React.FC<AccessRequestProps> = ({
                                                                     isOpen,
                                                                     requestData,
                                                                     onApprove,
                                                                     onDeny
                                                                 }) => {
    if (!isOpen || !requestData) return null;

    return (
        <div className="fixed right-4 top-16 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500 max-w-sm">
                <h3 className="font-bold text-lg mb-2">Access Request</h3>
                <p className="mb-4">
                    <span className="font-medium">{requestData.email}</span> is requesting access to your canvas.
                </p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onDeny}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                    >
                        <FaUserTimes className="mr-1" /> Deny
                    </button>
                    <button
                        onClick={onApprove}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center"
                    >
                        <FaUserCheck className="mr-1" /> Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessRequestNotification;
