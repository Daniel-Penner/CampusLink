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

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/servers/public', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setPublicServers(data))
            .catch(error => console.error('Error fetching public servers:', error));
    }, []);

    const handleJoinServer = (serverId: string) => {
        const token = localStorage.getItem('token');
        fetch('/api/servers/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ serverId })
        })
            .then(response => response.json())
            .then(joinedServer => {
                // Update the public server list and call onJoinSuccess with the new server
                setPublicServers(prev => prev.filter(server => server._id !== serverId));
                onJoinSuccess(joinedServer);
            })
            .catch(error => console.error('Error joining server:', error));
    };

    const handleJoinByCode = () => {
        if (!joinCode.trim()) return;
        handleJoinServer(joinCode);
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2>Join a Server</h2>
                <div className={styles.serverList}>
                    {publicServers.map(server => {
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
                        onChange={e => setJoinCode(e.target.value)}
                        className={styles.joinCodeInput}
                    />
                    <button onClick={handleJoinByCode} className={styles.joinButton}>
                        Join by Code
                    </button>
                </div>
                <button onClick={onClose} className={styles.closeButton}>Close</button>
            </div>
        </div>
    );
};

export default JoinServerModal;
