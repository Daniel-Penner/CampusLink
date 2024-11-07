import React, { useState } from 'react';
import styles from './CreateServerModal.module.css';

interface CreateServerModalProps {
    onClose: () => void;
    onCreateServer: (serverData: { name: string; isPublic: boolean; channels: { name: string }[] }) => void;
}

const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose, onCreateServer }) => {
    const [serverName, setServerName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [channels, setChannels] = useState<{ name: string }[]>([{ name: '' }]);

    const handleAddChannel = () => setChannels([...channels, { name: '' }]);
    const handleRemoveChannel = (index: number) => {
        setChannels(channels.filter((_, i) => i !== index));
    };

    const handleChannelNameChange = (index: number, name: string) => {
        const newChannels = [...channels];
        newChannels[index].name = name;
        setChannels(newChannels);
    };

    const handleCreateServer = () => {
        const newServer = {
            name: serverName,
            isPublic,
            channels: channels.filter(channel => channel.name.trim() !== ''),
        };
        onCreateServer(newServer);
        onClose();
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Create Server</h2>
                <input
                    type="text"
                    placeholder="Server Name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className={styles.inputField}
                />
                <div className={styles.channelList}>
                    {channels.map((channel, index) => (
                        <div key={index} className={styles.channelItem}>
                            <input
                                type="text"
                                placeholder={`Channel ${index + 1} Name`}
                                value={channel.name}
                                onChange={(e) => handleChannelNameChange(index, e.target.value)}
                                className={styles.inputField}
                            />
                            <button onClick={() => handleRemoveChannel(index)}>Remove</button>
                        </div>
                    ))}
                    <button onClick={handleAddChannel}>Add Channel</button>
                </div>
                <label className={styles.toggleContainer}>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                    />
                    Public Server
                </label>
                <button onClick={handleCreateServer} disabled={!serverName.trim()} className={styles.createButton}>Create Server</button>
                <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
            </div>
        </div>
    );
};

export default CreateServerModal;
