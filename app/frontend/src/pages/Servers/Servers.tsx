import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServersSidebar from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from '../../components/ChannelsNavbar/ChannelsNavbar';
import ServerChoiceModal from '../../components/ServerChoiceModal/ServerChoiceModal';
import JoinServerModal from '../../components/ServerJoinModal/ServerJoinModal';
import CreateServerModal from '../../components/CreateServerModal/CreateServerModal';
import styles from './Servers.module.css';

const ServersPage: React.FC = () => {
    const [servers, setServers] = useState<any[]>([]);
    const [selectedServer, setSelectedServer] = useState<any | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isServerChoiceOpen, setIsServerChoiceOpen] = useState(false);
    const [isJoiningServer, setIsJoiningServer] = useState(false);
    const [isCreatingServer, setIsCreatingServer] = useState(false);

    const token = localStorage.getItem('token');

    // Fetch servers function
    const fetchServers = () => {
        fetch('/api/servers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setServers(data);
                if (data.length > 0) {
                    setSelectedServer(data[0]);
                    setSelectedChannel(data[0].channels[0] || null);
                    setMessages(data[0].channels[0]?.messages || []);
                }
            })
            .catch(error => console.error('Error fetching servers:', error));
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const handleServerSelect = (server: any) => {
        setSelectedServer(server);
        setSelectedChannel(server.channels[0] || null);
        setMessages(server.channels[0]?.messages || []);
    };

    const handleChannelSelect = (channel: any) => {
        setSelectedChannel(channel);
        setMessages(channel.messages || []);
    };

    const handleCreateServer = (serverData: { name: string; isPublic: boolean; channels: { name: string }[] }) => {
        fetch('/api/servers/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serverData)
        })
            .then(response => response.json())
            .then(() => {
                fetchServers(); // Refresh the server list after creating a new server
                setIsCreatingServer(false);
            })
            .catch(error => console.error('Error creating server:', error));
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
                    onCreateServer={() => setIsServerChoiceOpen(true)} // Open server choice modal
                />
                <div className={`${styles.mainColumn} ${isSidebarExpanded ? styles.shiftRight : ''}`}>
                    <ChannelsNavbar
                        channels={selectedServer ? selectedServer.channels : []}
                        selectedChannel={selectedChannel}
                        setSelectedChannel={handleChannelSelect}
                    />
                    <ServerWindow
                        messages={messages}
                        setMessages={setMessages}
                        selectedChannel={selectedChannel}
                        selectedServer={selectedServer}
                    />
                </div>
            </div>

            {/* Render modals based on modal state */}
            {isServerChoiceOpen && (
                <ServerChoiceModal
                    onClose={() => setIsServerChoiceOpen(false)}
                    onJoin={() => {
                        setIsServerChoiceOpen(false);
                        setIsJoiningServer(true);
                    }}
                    onCreate={() => {
                        setIsServerChoiceOpen(false);
                        setIsCreatingServer(true);
                    }}
                />
            )}

            {isJoiningServer && (
                <JoinServerModal
                    userId="userIdFromContext"
                    onClose={() => setIsJoiningServer(false)}
                    onJoinSuccess={() => fetchServers()} // Re-fetch servers on successful join
                />
            )}

            {isCreatingServer && (
                <CreateServerModal
                    onClose={() => setIsCreatingServer(false)}
                    onCreateServer={handleCreateServer}
                />
            )}
        </div>
    );
};

export default ServersPage;
