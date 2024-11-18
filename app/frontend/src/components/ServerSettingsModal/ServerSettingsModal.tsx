import React, { useState } from 'react';
import styles from './ServerSettingsModal.module.css';
import DefaultServerPhoto from '../../assets/logoSmall.svg'; // Import the SVG

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
    const [serverPhoto, setServerPhoto] = useState(server.photo || DefaultServerPhoto);

    const handleAddChannel = () => {
        if (!newChannelName.trim()) return;
        setChannels([...channels, { name: newChannelName }]);
        setNewChannelName('');
    };

    const handleRemoveChannel = (channelId: string) => {
        setChannels(channels.filter((channel: any) => channel._id !== channelId));
    };

    const handleSaveChanges = () => {
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('name', serverName);
        formData.append(
            'channels',
            JSON.stringify(
                channels.map((channel: any) => ({
                    _id: channel._id,
                    name: channel.name,
                }))
            )
        );

        fetch(`/api/servers/${server._id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error: ${res.statusText}`);
                }
                return res.json();
            })
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

    const handlePhotoUpload = (file: File) => {
        const formData = new FormData();
        formData.append('photo', file);

        fetch(`/api/servers/server/${server._id}/photo`, {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.photo) {
                    setServerPhoto(data.photo); // Update the state
                }
            })
            .catch((err) => console.error('Error uploading photo:', err));
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
                    <label>Server Photo:</label>
                    <div className={styles.photoUpload}>
                        <img
                            src={`${process.env.REACT_APP_API_URL}${serverPhoto}`}
                            alt="Server"
                            className={styles.serverPhoto}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handlePhotoUpload(e.target.files[0]);
                                }
                            }}
                            className={styles.fileInput}
                        />
                    </div>
                </div>
                <div className={styles.section}>
                    <label>Channels:</label>
                    {channels.map((channel: any) => (
                        <div key={channel._id} className={styles.channelItem}>
                        <span>{channel.name}</span>
                            <button
                                className={styles.removeChannelButton}
                                onClick={() => handleRemoveChannel(channel._id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <input
                        type="text"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        placeholder="New Channel Name"
                        className={styles.inputField}
                    />
                    <button onClick={handleAddChannel} className={styles.addChannelButton}>
                        Add Channel
                    </button>
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
