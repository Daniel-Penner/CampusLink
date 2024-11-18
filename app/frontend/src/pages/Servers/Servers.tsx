import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServersSidebar from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from '../../components/ChannelsNavbar/ChannelsNavbar';
import ServerSettingsModal from '../../components/ServerSettingsModal/ServerSettingsModal';
import CreateServerModal from '../../components/CreateServerModal/CreateServerModal';
import ServerChoiceModal from '../../components/ServerChoiceModal/ServerChoiceModal';
import JoinServerModal from '../../components/ServerJoinModal/ServerJoinModal';
import styles from './Servers.module.css';

const ServersPage: React.FC = () => {
    const [servers, setServers] = useState<any[]>([]);
    const [selectedServer, setSelectedServer] = useState<any | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isCreatingServer, setIsCreatingServer] = useState(false);
    const [isJoiningServer, setIsJoiningServer] = useState(false);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const token = localStorage.getItem('token');
    const storedId = localStorage.getItem('id');

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = () => {
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
    };

    const handleServerSelect = (server: any) => {
        setSelectedServer(server);
        setSelectedChannel(server.channels[0] || null);
        setMessages([]);
    };

    const handleChannelSelect = (channel: any) => {
        setSelectedChannel(channel);
        setMessages([]);
    };

    const handleServerCreated = (serverData: { name: string; isPublic: boolean; channels: { name: string }[] }) => {
        fetch('/api/servers/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(serverData),
        })
            .then((response) => response.json())
            .then(() => {
                fetchServers(); // Refresh the server list after creating a new server
                setIsCreatingServer(false);
            })
            .catch((error) => console.error('Error creating server:', error));
    };

    const handleJoinSuccess = (joinedServer: any) => {
        setServers([...servers, joinedServer]);
        setSelectedServer(joinedServer);
        setSelectedChannel(joinedServer.channels[0] || null);
        setMessages([]);
        setIsJoiningServer(false);
        window.location.reload();
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

    const handleLeaveServer = () => {
        if (!selectedServer) return;

        fetch(`/api/servers/${selectedServer._id}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    setServers(servers.filter((server) => server._id !== selectedServer._id));
                    setSelectedServer(null);
                    setSelectedChannel(null);
                    setMessages([]);
                } else {
                    console.error('Failed to leave server.');
                }
            })
            .catch((error) => console.error('Error leaving server:', error));
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
                    onCreateServer={() => setIsChoiceModalOpen(true)}
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
                                onLeave={handleLeaveServer}
                                isOwner={selectedServer?.owner === storedId}
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

            {isChoiceModalOpen && (
                <ServerChoiceModal
                    onClose={() => setIsChoiceModalOpen(false)}
                    onJoin={() => {
                        setIsChoiceModalOpen(false);
                        setIsJoiningServer(true);
                    }}
                    onCreate={() => {
                        setIsChoiceModalOpen(false);
                        setIsCreatingServer(true);
                    }}
                />
            )}

            {isJoiningServer && (
                <JoinServerModal
                    userId="currentUserId" // Replace with actual user ID logic
                    onClose={() => setIsJoiningServer(false)}
                    onJoinSuccess={handleJoinSuccess}
                />
            )}

            {isCreatingServer && (
                <CreateServerModal
                    onClose={() => setIsCreatingServer(false)}
                    onCreateServer={handleServerCreated}
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
