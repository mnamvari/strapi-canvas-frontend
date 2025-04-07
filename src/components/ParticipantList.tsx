import React from "react";
import { FaCrown } from "react-icons/fa";

interface Participant {
    id: string;
    email: string;
    isOwner: boolean;
}

interface ParticipantListProps {
    participants: Participant[];
    currentUserEmail?: string | null;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
                                                             participants,
                                                             currentUserEmail
                                                         }) => {
    return (
        <div className="bg-white rounded-lg shadow px-4 py-3">
            <h3 className="text-sm font-semibold mb-2">Participants</h3>
            {participants.length === 0 ? (
                <p className="text-gray-500 text-sm">No participants</p>
            ) : (
                <ul className="space-y-1">
                    {participants.map((participant) => (
                        <li
                            key={participant.id}
                            className={`text-sm flex items-center ${participant.email === currentUserEmail ? 'font-bold' : ''}`}
                        >
                            {participant.isOwner && (
                                <FaCrown className="text-yellow-500 mr-1" size={12} title="Canvas Owner" />
                            )}
                            {participant.email}
                            {participant.email === currentUserEmail && " (You)"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ParticipantList;
