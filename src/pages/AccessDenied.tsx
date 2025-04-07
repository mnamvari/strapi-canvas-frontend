import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
                <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="mb-6">
                    Your request to access this canvas was denied by the owner.
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;
