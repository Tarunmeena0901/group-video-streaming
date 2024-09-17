import { useEffect, useState } from 'react';
import { useWebSocket } from '../providers/webSocketProvider';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../providers/userProvider';

type FormType = {
    userName: string,
    roomId: string,
    role: string
}

const JoinModal = ({ isOpen, onClose, modalType, role }: {
    modalType: string,
    isOpen: boolean,
    role: string,
    onClose: () => void,
}) => {
    const [userName, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const socket = useWebSocket();
    const {setRoomId: setGlobalRoomId, setUserName: setGlobaUsername} = useUser();

    useEffect(() => {
        if (!socket) {
            throw new Error("Not connected to WebSocket server");
        }
    
        const handleSocketMessage = (event: MessageEvent) => {
            const parsedData = JSON.parse(event.data);
    
            if (parsedData.type == "JOIN_OR_CREATE_ROOM") {
                setGlobaUsername(parsedData.userName);
                setGlobalRoomId(parsedData.roomId);
                onClose();
                navigate(`/${role}`);
            }
        };
    
        socket.onmessage = handleSocketMessage;
    
        return () => {
            socket.onmessage = null; // Clean up when component unmounts
        };
    }, [socket, setGlobaUsername, setGlobalRoomId]);

    const handleFormSubmit = (updatedFormData: FormType) => {
        const data = { type: "JOIN_OR_CREATE_ROOM", ...updatedFormData };
        socket?.send(JSON.stringify(data));
    };

    const handleSubmit = () => {
        if (role == "guest" && (userName.trim() === '' || roomId.trim() === '')) {
            setError('Both fields are required');
        } else if(role == "host" && (userName.trim() === '')){
            setError('username field is required');
        } 
        else {
            setError('');
            const updatedFormData = { userName, roomId, role };
            handleFormSubmit(updatedFormData); // Pass the updated form data directly
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur">
            <div className="bg-neutral-800 p-6 shadow-lg w-[70vh] text-white">
                <h2 className="text-xl font-semibold mb-4">Enter Details</h2>

                <div className="flex flex-col mb-4">
                    <label className="mb-2 text-gray-300">Username</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 border border-gray-300 rounded text-black"

                    />
                </div>

                {modalType == "guest" && <div className="flex flex-col mb-4">
                    <label className="mb-2 text-gray-300">Room ID</label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="p-2 border border-gray-300 rounded text-black"
                    />
                </div>}

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="flex gap-6">
                    <button
                        className="bg-red-700 text-white w-1/2 px-4 py-2 rounded hover:bg-red-800"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        className="bg-neutral-900 w-1/2 text-white px-4 py-2 rounded hover:bg-black"
                        onClick={handleSubmit}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinModal;