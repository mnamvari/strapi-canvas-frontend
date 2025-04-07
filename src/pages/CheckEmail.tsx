import React from "react";

const CheckEmailPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
                <p className="mb-6">
                    We've sent you an email with a link to access the canvas. Please check your inbox and click the link.
                </p>
                <p className="text-sm text-gray-500">
                    If you don't see the email, check your spam folder or request a new link.
                </p>
            </div>
        </div>
    );
};

export default CheckEmailPage;
