import React from 'react';
import styles from './ChannelsNavbar.module.css';
import { FaCog } from 'react-icons/fa';

interface Channel {
    _id: string;
    name: string;
}

interface ChannelsNavbarProps {
    channels: Channel[];
    selectedChannel: Channel | null;
    setSelectedChannel: (channel: Channel) => void;
    selectedServer: any; // Server object passed to the settings modal
    onSettings: () => void; // Handler to open settings modal
    onLeave: () => void; // Handler to leave the server
    isOwner: boolean; // Indicates whether the current user owns the server
}

const ChannelsNavbar: React.FC<ChannelsNavbarProps> = ({
                                                           channels,
                                                           selectedChannel,
                                                           setSelectedChannel,
                                                           onSettings,
                                                           onLeave,
                                                           isOwner,
                                                       }) => {
    return (
        <div className={styles.navbar}>
            <div className={styles.channelContainer}>
                {channels.map((channel) => (
                    <div
                        key={channel._id}
                        className={`${styles.channel} ${
                            selectedChannel?._id === channel._id ? styles.activeChannel : ''
                        }`}
                        onClick={() => setSelectedChannel(channel)}
                    >
                        {channel.name}
                    </div>
                ))}
            </div>
            {isOwner ? (
                <div
                    className={styles.settingsButton}
                    onClick={onSettings}
                    title="Server Settings"
                >
                    <FaCog />
                    <span>Settings</span>
                </div>
            ) : (
                <button
                    className={styles.leaveButton}
                    onClick={onLeave}
                    title="Leave Server"
                >
                    Leave Server
                </button>
            )}
        </div>
    );
};

export default ChannelsNavbar;
