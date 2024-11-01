import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServerList from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from "../../components/ChannelsNavbar/ChannelsNavbar";
import styles from './Servers.module.css';

interface Server {
    _id: string;
    name: string;
    color: string;
}

interface Channel {
    _id: string;
    name: string;
}

interface Message {
    sender: string;
    content: string;
    timestamp: Date;
    recipient?: string;
    channel?: string;
}

const ServersPage: React.FC = () => {
    const [servers] = useState<Server[]>([
        { _id: '1', name: 'Casual', color: 'red' },
        { _id: '2', name: 'Announcements', color: 'blue' },
    ]);
    const [channels] = useState<Channel[]>([
        { _id: '1', name: 'general' },
        { _id: '2', name: 'announcements' },
    ]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'Alice', content: 'Hello everyone!', timestamp: new Date(), channel: '1' },
        { sender: 'Bob', content: 'Hi Alice!', timestamp: new Date(), channel: '1' },
    ]);

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <div className={styles.sidebar}>
                    <ServerList servers={servers} setSelectedServer={() => {}} />
                </div>
                <div className={styles.mainColumn}>
                <div className={styles.channelNavContainer}>
                    <ChannelsNavbar channels={channels} setSelectedChannel={setSelectedChannel} />
                </div>
                <div className={styles.serverWindow}>
                    <ServerWindow messages={messages} setMessages={setMessages} selectedChannel={selectedChannel} />
                </div>
                </div>
            </div>
        </div>
    );
};

export default ServersPage;
