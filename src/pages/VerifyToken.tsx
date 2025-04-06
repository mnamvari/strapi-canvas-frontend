import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyMagicLink } from "../authProvider";

const VerifyToken: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Verifying your access link...");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("Invalid link. Token is missing.");
            return;
        }

        const verify = async () => {
            try {
                const result = await verifyMagicLink(token);

                if (result.success) {
                    navigate(result.redirectTo || "/");
                } else {
                    setStatus(result.error?.message || "Verification failed");
                }
            } catch (error) {
                setStatus("An error occurred during verification");
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying Access</h1>
    <p>{status}</p>
    </div>
    </div>
);
};

export default VerifyToken;
