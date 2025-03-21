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

                const savedServerId = localStorage.getItem('selectedServerId');
                const savedChannelId = localStorage.getItem('selectedChannelId');

                let foundServer = data.find((server: { _id: string | null; }) => server._id === savedServerId) || data[0] || null;
                let foundChannel = foundServer?.channels.find((channel: { _id: string | null; }) => channel._id === savedChannelId) || foundServer?.channels[0] || null;

                setSelectedServer(foundServer);
                setSelectedChannel(foundChannel);
                setMessages([]); // Ensure messages are cleared when switching servers
            })
            .catch((error) => console.error('Error fetching servers:', error));
    };

    const handleServerSelect = (server: any) => {
        setSelectedServer(server);
        setSelectedChannel(server.channels[0] || null);
        setMessages([]);

        localStorage.setItem('selectedServerId', server._id);
        localStorage.setItem('selectedChannelId', server.channels[0]?._id || '');
    };

    const handleChannelSelect = (channel: any) => {
        setSelectedChannel(channel);
        setMessages([]);
        localStorage.setItem('selectedChannelId', channel._id);
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

    const handleJoinSuccess = async (joinedServer: any) => {
        try {
            // Verify that the joined server object contains an ID
            const serverId = joinedServer._id || joinedServer.id; // Use the appropriate field
            if (!serverId) {
                throw new Error('Joined server does not have a valid ID');
            }

            // Fetch full server details
            const response = await fetch(`/api/servers/${serverId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch server details after joining');
            }

            const fullServerDetails = await response.json();

            // Update state with the full server data
            setServers((prevServers) => [...prevServers, fullServerDetails]);
            setSelectedServer(fullServerDetails);

            if (fullServerDetails.channels && fullServerDetails.channels.length > 0) {
                setSelectedChannel(fullServerDetails.channels[0]);
                setMessages([]); // Reset messages for the new channel
            } else {
                setSelectedChannel(null);
                setMessages([]); // No channels yet, so clear messages
            }

            setIsJoiningServer(false); // Close the modal
        } catch (error) {
            console.error('Error handling join success:', error);
        }
    };

    const handleServerUpdated = (updatedServer: any) => {
        setServers((prevServers: any[]) =>
            prevServers.map((server) =>
                server._id === updatedServer._id
                    ? { ...server, ...updatedServer, channels: updatedServer.channels || server.channels }
                    : server
            )
        );

        // Update selected server immediately if it's being modified
        setSelectedServer((prev: any) => {
            if (prev && prev._id === updatedServer._id) {
                return { ...prev, ...updatedServer };
            }
            return prev;
        });

        // Update the UI in `ChannelsNavbar`
        if (
            selectedServer &&
            selectedServer._id === updatedServer._id
        ) {
            setSelectedServer((prev: any) => ({
                ...prev,
                ...updatedServer,
                channels: updatedServer.channels || prev?.channels,
            }));
        }

        // If the currently selected channel was removed, reset selection
        if (
            selectedChannel &&
            updatedServer.channels &&
            !updatedServer.channels.some((ch: any) => ch._id === selectedChannel._id)
        ) {
            setSelectedChannel(updatedServer.channels[0] || null);
            localStorage.setItem('selectedChannelId', updatedServer.channels[0]?._id || '');
        }
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
