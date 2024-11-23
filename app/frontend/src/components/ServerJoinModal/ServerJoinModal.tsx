import React, { useEffect, useState } from 'react';
import styles from './ServerJoinModal.module.css';

interface Server {
    _id: string;
    name: string;
    members: string[];
}

interface JoinServerModalProps {
    userId: string;
    onClose: () => void;
    onJoinSuccess: (server: Server) => void;
}

const JoinServerModal: React.FC<JoinServerModalProps> = ({ userId, onClose, onJoinSuccess }) => {
    const [publicServers, setPublicServers] = useState<Server[]>([]);
    const [joinCode, setJoinCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/servers/public', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setPublicServers(data))
            .catch((error) => console.error('Error fetching public servers:', error));
    }, []);

    const handleJoinServer = (serverId: string) => {
        const token = localStorage.getItem('token');
        fetch('/api/servers/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ serverId }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to join server');
                }
                return response.json();
            })
            .then((joinedServer) => {
                setErrorMessage(''); // Clear any errors
                onJoinSuccess(joinedServer); // Call the callback with the joined server
            })
            .catch((error) => {
                console.error('Error joining server:', error);
                setErrorMessage(error.message);
            });
    };


    const handleJoinByCode = () => {
        if (!joinCode.trim()) {
            setErrorMessage('Join code cannot be empty.');
            return;
        }
        setErrorMessage(''); // Clear any previous errors
        handleJoinServer(joinCode);
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Join a Server</h2>
                {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
                <div className={styles.serverList}>
                    {publicServers.map((server) => {
                        const isMember = server.members.includes(userId);
                        return (
                            <div key={server._id} className={styles.serverItem}>
                                <span>{server.name}</span>
                                <button
                                    disabled={isMember}
                                    className={isMember ? styles.joinedButton : styles.joinButton}
                                    onClick={() => handleJoinServer(server._id)}
                                >
                                    {isMember ? 'Joined' : 'Join'}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className={styles.joinCodeSection}>
                    <input
                        type="text"
                        placeholder="Enter Join Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className={styles.joinCodeInput}
                    />
                    <button onClick={handleJoinByCode} className={styles.joinButton}>
                        Join by Code
                    </button>
                </div>
                <button onClick={onClose} className={styles.closeButton}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default JoinServerModal;
