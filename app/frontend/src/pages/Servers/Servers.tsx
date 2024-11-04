import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServersSidebar from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from "../../components/ChannelsNavbar/ChannelsNavbar";
import styles from './Servers.module.css';

const ServersPage: React.FC = () => {
    const servers = [
        {
            _id: '64e94be6819100db1866031a', // Example of a valid ObjectId string
            name: 'Casual',
            color: 'red',
            channels: [
                {
                    _id: '64e94be6819100db1866031b', // Valid ObjectId for channel
                    name: 'general',
                    messages: [
                        {
                            sender: 'Alice',
                            content: 'Hello!',
                            timestamp: new Date()
                        },
                        {
                            sender: 'Alice',
                            content: 'Hello!',
                            timestamp: new Date()
                        }
                    ]
                },
                {
                    _id: '64e94be6819100db1866031c', // Another valid ObjectId
                    name: 'random',
                    messages: [
                        {
                            sender: 'Bob',
                            content: 'Random chat',
                            timestamp: new Date()
                        }
                    ]
                }
            ]
        },
        {
            _id: '64e94be6819100db1866031d',
            name: 'Announcements',
            color: 'blue',
            channels: [
                {
                    _id: '64e94be6819100db1866031e',
                    name: 'updates',
                    messages: [
                        {
                            sender: 'System',
                            content: 'New update released!',
                            timestamp: new Date()
                        }
                    ]
                },
                {
                    _id: '64e94be6819100db1866031f',
                    name: 'news',
                    messages: [
                        {
                            sender: 'Admin',
                            content: 'Company news',
                            timestamp: new Date()
                        }
                    ]
                }
            ]
        }
    ];

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
                        selectedServer={selectedServer}
                    />
                </div>
            </div>
        </div>
    );
};

export default ServersPage;