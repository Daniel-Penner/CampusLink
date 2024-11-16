import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServersSidebar from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from '../../components/ChannelsNavbar/ChannelsNavbar';
import ServerSettingsModal from '../../components/ServerSettingsModal/ServerSettingsModal';
import CreateServerModal from '../../components/CreateServerModal/CreateServerModal';
import styles from './Servers.module.css';

const ServersPage: React.FC = () => {
    const [servers, setServers] = useState<any[]>([]);
    const [selectedServer, setSelectedServer] = useState<any | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isCreatingServer, setIsCreatingServer] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/servers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setServers(data);
                if (data.length > 0) {
                    setSelectedServer(data[0]);
                    setSelectedChannel(data[0].channels[0] || null);
                    setMessages([]);
                }
            })
            .catch((error) => console.error('Error fetching servers:', error));
    }, []);

    const handleServerSelect = (server: any) => {
        setSelectedServer(server);
        setSelectedChannel(server.channels[0] || null);
        setMessages([]);
    };

    const handleChannelSelect = (channel: any) => {
        setSelectedChannel(channel);
        setMessages([]);
    };

    const handleServerCreated = (newServer: any) => {
        setServers([...servers, newServer]);
        setSelectedServer(newServer);
        setSelectedChannel(newServer.channels[0] || null);
        setMessages([]);
        setIsCreatingServer(false);
    };

    const handleServerUpdated = (updatedServer: any) => {
        setServers(
            servers.map((server) => (server._id === updatedServer._id ? updatedServer : server))
        );
        setSelectedServer(updatedServer);
    };

    const handleServerDeleted = () => {
        setServers(servers.filter((server) => server._id !== selectedServer._id));
        setSelectedServer(null);
        setSelectedChannel(null);
        setMessages([]);
        setIsSettingsOpen(false);
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
                    onCreateServer={() => setIsCreatingServer(true)}
                />
                <div
                    className={`${styles.mainColumn} ${isSidebarExpanded ? styles.shiftRight : ''}`}
                >
                    {servers.length > 0 && selectedServer ? (
                        <>
                            <ChannelsNavbar
                                channels={selectedServer.channels || []}
                                selectedChannel={selectedChannel}
                                setSelectedChannel={handleChannelSelect}
                                selectedServer={selectedServer}
                                onSettings={() => setIsSettingsOpen(true)}
                            />
                            <ServerWindow
                                messages={messages}
                                setMessages={setMessages}
                                selectedChannel={selectedChannel}
                                selectedServer={selectedServer}
                            />
                        </>
                    ) : (
                        <div className={styles.placeholder}>Please select a server.</div>
                    )}
                </div>
            </div>
            {isCreatingServer && (
                <CreateServerModal
                    onClose={() => setIsCreatingServer(false)}
                    onServerCreated={handleServerCreated}
                />
            )}
            {isSettingsOpen && selectedServer && (
                <ServerSettingsModal
                    server={selectedServer}
                    onClose={() => setIsSettingsOpen(false)}
                    onServerUpdated={handleServerUpdated}
                    onServerDeleted={handleServerDeleted}
                />
            )}
        </div>
    );
};

export default ServersPage;
