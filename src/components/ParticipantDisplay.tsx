import React from "react";

interface ParticipantDisplayProps {
    participantCount: number;
    maxParticipants: number;
}

const ParticipantDisplay: React.FC<ParticipantDisplayProps> = ({
                                                                   participantCount,
                                                                   maxParticipants
                                                               }) => {
    return (
        <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center space-x-2">
            <div className="text-sm font-medium">
                Participants: {participantCount}/{maxParticipants}
            </div>
            <div className="flex space-x-1">
                {Array.from({ length: maxParticipants }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                            i < participantCount ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ParticipantDisplay;
