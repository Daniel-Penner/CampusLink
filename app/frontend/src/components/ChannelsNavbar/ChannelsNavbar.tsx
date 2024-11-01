import React from 'react';
import styles from './ChannelsNavbar.module.css';

interface Channel {
    _id: string;
    name: string;
}

interface ChannelsNavbarProps {
    channels: Channel[];
    setSelectedChannel: (channel: Channel) => void;
}

const ChannelsNavbar: React.FC<ChannelsNavbarProps> = ({ channels, setSelectedChannel }) => {
    return (
        <div className={styles.navbar}>
            {channels.map((channel) => (
                <div key={channel._id} className={styles.channel}
                     onClick={() => setSelectedChannel(channel)}>
                    {channel.name}
                </div>
            ))}
        </div>
    );
};

export default ChannelsNavbar;
