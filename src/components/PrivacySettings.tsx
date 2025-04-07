import React, {useEffect, useState} from "react";
import { FaLock, FaUserCheck, FaTrashAlt, FaDownload } from "react-icons/fa";

interface PrivacySettingsProps {
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean;
    canvasSettings: {
        requireApproval: boolean;
        autoClear: boolean;
        autoClearMinutes: number;
        disableDownload: boolean;
    };
    onUpdateSettings: (settings: any) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
     isOpen,
     onClose,
     isOwner,
     canvasSettings,
     onUpdateSettings
}) => {
    const [requireApproval, setRequireApproval] = useState(canvasSettings.requireApproval);
    const [autoClear, setAutoClear] = useState(canvasSettings.autoClear);
    const [autoClearMinutes, setAutoClearMinutes] = useState(canvasSettings.autoClearMinutes);
    const [disableDownload, setDisableDownload] = useState(canvasSettings.disableDownload);

    useEffect(() => {
        setRequireApproval(canvasSettings.requireApproval);
        setAutoClear(canvasSettings.autoClear);
        setAutoClearMinutes(canvasSettings.autoClearMinutes);
        setDisableDownload(canvasSettings.disableDownload);
    }, [canvasSettings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdateSettings({
            requireApproval,
            autoClear,
            autoClearMinutes,
            disableDownload
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                        <FaLock className="mr-2" /> Privacy Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        &times;
                    </button>
                </div>

                {!isOwner ? (
                    <div className="text-center p-4">
                        <p>Only the canvas owner can modify privacy settings.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Require Approval Setting */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="require-approval"
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={requireApproval}
                                    onChange={(e) => setRequireApproval(e.target.checked)}
                                />
                            </div>
                            <div className="ml-3">
                                <label
                                    htmlFor="require-approval"
                                    className="font-medium flex items-center"
                                >
                                    <FaUserCheck className="mr-2" /> Require Approval for Sign-in
                                </label>
                                <p className="text-gray-500 text-sm">
                                    Send a notification to you for each sign-in attempt,
                                    allowing you to approve or reject access.
                                </p>
                            </div>
                        </div>

                        {/* Auto Clear Canvas Setting */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="auto-clear"
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={autoClear}
                                    onChange={(e) => setAutoClear(e.target.checked)}
                                />
                            </div>
                            <div className="ml-3 w-full">
                                <label
                                    htmlFor="auto-clear"
                                    className="font-medium flex items-center"
                                >
                                    <FaTrashAlt className="mr-2" /> Auto Clear Canvas
                                </label>
                                <p className="text-gray-500 text-sm mb-2">
                                    Automatically clear the canvas after a specified period of inactivity.
                                </p>
                                {autoClear && (
                                    <div className="flex items-center mt-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={autoClearMinutes}
                                            onChange={(e) => setAutoClearMinutes(parseInt(e.target.value) || 15)}
                                            className="w-16 border rounded px-2 py-1 mr-2"
                                        />
                                        <span className="text-sm text-gray-700">minutes of inactivity</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Disable Download Setting */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="disable-download"
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={disableDownload}
                                    onChange={(e) => setDisableDownload(e.target.checked)}
                                />
                            </div>
                            <div className="ml-3">
                                <label
                                    htmlFor="disable-download"
                                    className="font-medium flex items-center"
                                >
                                    <FaDownload className="mr-2" /> Disable Download
                                </label>
                                <p className="text-gray-500 text-sm">
                                    Restrict access to the download button for all participants.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="mr-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    {isOwner && (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={handleSave}
                        >
                            Save Settings
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
