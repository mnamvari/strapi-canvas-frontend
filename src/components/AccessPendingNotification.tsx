import React from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

interface AccessPendingProps {
    isOpen: boolean;
}

const AccessPendingNotification: React.FC<AccessPendingProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-3">Access Pending Approval</h2>
                <p className="mb-4">
                    Your request to join this canvas is pending approval from the canvas owner.
                    Please wait for the owner to approve your access.
                </p>
                <div className="flex items-center justify-center text-gray-600">
                    <FaSpinner className="animate-spin mr-2" /> Waiting for approval...
                </div>
            </div>
        </div>
    );
};

export default AccessPendingNotification;
