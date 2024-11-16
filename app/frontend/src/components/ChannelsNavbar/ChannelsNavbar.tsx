import React, { useState } from 'react';
import styles from './ChannelsNavbar.module.css';
import { FaCog } from 'react-icons/fa';
import ServerSettingsModal from '../ServerSettingsModal/ServerSettingsModal';

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
}

const ChannelsNavbar: React.FC<ChannelsNavbarProps> = ({
                                                           channels,
                                                           selectedChannel,
                                                           setSelectedChannel,
                                                           selectedServer,
                                                           onSettings,
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
            <div
                className={styles.settingsButton}
                onClick={onSettings}
                title="Server Settings"
            >
                <FaCog />
                <span>Settings</span>
            </div>
        </div>
    );
};

export default ChannelsNavbar;
