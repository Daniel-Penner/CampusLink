import React, { useState } from 'react';
import styles from './ServerSettingsModal.module.css';

interface ServerSettingsModalProps {
    server: any;
    onClose: () => void;
    onServerUpdated: (updatedServer: any) => void;
    onServerDeleted: () => void;
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
                                                                     server,
                                                                     onClose,
                                                                     onServerUpdated,
                                                                     onServerDeleted,
                                                                 }) => {
    const [serverName, setServerName] = useState(server.name);
    const [channels, setChannels] = useState(server.channels);
    const [newChannelName, setNewChannelName] = useState('');

    const handleAddChannel = () => {
        if (!newChannelName.trim()) return;
        setChannels([...channels, { _id: Date.now().toString(), name: newChannelName }]);
        setNewChannelName('');
    };

    const handleRemoveChannel = (channelId: string) => {
        setChannels(channels.filter((channel: any) => channel._id !== channelId));
    };

    const handleSaveChanges = () => {
        const token = localStorage.getItem('token');
        fetch(`/api/servers/${server._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: serverName, channels }),
        })
            .then((res) => res.json())
            .then((updatedServer) => {
                onServerUpdated(updatedServer);
                onClose();
            })
            .catch((err) => console.error('Error updating server:', err));
    };

    const handleDeleteServer = () => {
        const token = localStorage.getItem('token');
        fetch(`/api/servers/${server._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                onServerDeleted();
                onClose();
            })
            .catch((err) => console.error('Error deleting server:', err));
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Server Settings</h2>
                <div className={styles.section}>
                    <label>Server Name:</label>
                    <input
                        type="text"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.section}>
                    <label>Channels:</label>
                    {channels.map((channel: any) => (
                        <div key={channel._id} className={styles.channelItem}>
                            <span>{channel.name}</span>
                            <button onClick={() => handleRemoveChannel(channel._id)}>Remove</button>
                        </div>
                    ))}
                    <input
                        type="text"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        placeholder="New Channel Name"
                        className={styles.inputField}
                    />
                    <button onClick={handleAddChannel}>Add Channel</button>
                </div>
                <div className={styles.section}>
                    <label>Server Code:</label>
                    <input type="text" value={server._id} readOnly className={styles.inputField} />
                </div>
                <div className={styles.actions}>
                    <button onClick={handleSaveChanges} className={styles.saveButton}>
                        Save Changes
                    </button>
                    <button onClick={handleDeleteServer} className={styles.deleteButton}>
                        Delete Server
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerSettingsModal;
