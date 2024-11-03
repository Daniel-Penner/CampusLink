import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServersSidebar from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from "../../components/ChannelsNavbar/ChannelsNavbar";
import styles from './Servers.module.css';

const ServersPage: React.FC = () => {
    const [servers] = useState([
        {
            _id: '1',
            name: 'Casual',
            color: 'red',
            channels: [
                { _id: '1', name: 'general', messages: [{ sender: 'Alice', content: 'Hello!', timestamp: new Date() }, { sender: 'Alice', content: 'Hello!', timestamp: new Date() }] },
                { _id: '2', name: 'random', messages: [{ sender: 'Bob', content: 'Random chat', timestamp: new Date() }] }
            ]
        },
        {
            _id: '2',
            name: 'Announcements',
            color: 'blue',
            channels: [
                { _id: '3', name: 'updates', messages: [{ sender: 'System', content: 'New update released!', timestamp: new Date() }] },
                { _id: '4', name: 'news', messages: [{ sender: 'Admin', content: 'Company news', timestamp: new Date() }] }
            ]
        }
    ]);

    const [selectedServer, setSelectedServer] = useState<any | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const handleServerSelect = (server: any) => {
        setSelectedServer(server);
        setSelectedChannel(server.channels[0] || null);
    };

    const handleChannelSelect = (channel: any) => {
        setSelectedChannel(channel);
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <ServersSidebar
                    servers={servers}
                    selectedServer={selectedServer}
                    setSelectedServer={handleServerSelect}
                    onHover={() => setIsSidebarExpanded(true)}
                    onLeave={() => setIsSidebarExpanded(false)}
                />
                <div
                    className={`${styles.mainColumn} ${
                        isSidebarExpanded ? styles.shiftRight : ''
                    }`}
                >
                    <ChannelsNavbar
                        channels={selectedServer ? selectedServer.channels : []}
                        selectedChannel={selectedChannel}
                        setSelectedChannel={handleChannelSelect}
                    />
                    <ServerWindow
                        messages={selectedChannel ? selectedChannel.messages : []}
                        setMessages={() => {}}
                        selectedChannel={selectedChannel}
                    />
                </div>
            </div>
        </div>
    );
};

export default ServersPage;