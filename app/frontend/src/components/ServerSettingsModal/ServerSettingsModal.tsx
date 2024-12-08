import React, { useState } from 'react';
import styles from './ServerSettingsModal.module.css';

interface Channel {
    _id?: string;
    name: string;
}

interface Server {
    _id: string;
    name: string;
    channels: Channel[];
    photo?: string; // New photo field
}

interface ServerSettingsModalProps {
    server: Server;
    onClose: () => void;
    onServerUpdated: (updatedServer: Server) => void;
    onServerDeleted: () => void;
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
                                                                     server,
                                                                     onClose,
                                                                     onServerUpdated,
                                                                     onServerDeleted,
                                                                 }) => {
    const [serverName, setServerName] = useState(server.name);
    const [channels, setChannels] = useState<Channel[]>(server.channels);
    const [newChannelName, setNewChannelName] = useState('');
    const [serverPhoto, setServerPhoto] = useState<string | null>(server.photo || null);
    const [, setServerPhotoFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);

    const handleAddChannel = () => {
        if (!newChannelName.trim()) return;
        setChannels([...channels, { name: newChannelName }]);
        setNewChannelName('');
    };

    const handleRemoveChannel = (channelId?: string) => {
        setChannels(channels.filter((channel) => channel._id !== channelId));
    };

    const handlePhotoUpload = async (file: File) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await fetch(`/api/servers/${server._id}/upload-photo`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload server photo.');
            }

            const data = await response.json();
            setServerPhoto(data.photo); // Update the photo preview with the new photo URL
        } catch (error) {
            console.error('Error uploading server photo:', error);
        }
    };

    const handleSaveChanges = async () => {
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('name', serverName);
        channels.forEach((channel, index) => {
            formData.append(`channels[${index}][_id]`, channel._id || '');
            formData.append(`channels[${index}][name]`, channel.name);
        });

        try {
            const response = await fetch(`/api/servers/${server._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to update server settings.');
            }

            const updatedServer = await response.json();
            onServerUpdated(updatedServer);
            onClose();
        } catch (error) {
            console.error('Error updating server:', error);
        }
    };

    const handleDeleteServer = async () => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`/api/servers/${server._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            onServerDeleted();
            onClose();
        } catch (error) {
            console.error('Error deleting server:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setServerPhotoFile(file);
            setServerPhoto(URL.createObjectURL(file)); // Preview the selected image
            handlePhotoUpload(file); // Upload the photo immediately
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(server._id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset "Copied!" after 2 seconds
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
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
                    {serverPhoto && (
                        <img
                            src={serverPhoto}
                            alt="Server Photo Preview"
                            className={styles.serverPhotoPreview}
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.section}>
                    <label>Channels:</label>
                    {channels.map((channel, index) => (
                        <div key={index} className={styles.channelItem}>
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
                    <div className={styles.codeContainer}>
                        <input
                            type="text"
                            value={server._id}
                            readOnly
                            className={styles.inputField}
                        />
                        <button onClick={handleCopyCode} className={styles.copyButton}>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
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
