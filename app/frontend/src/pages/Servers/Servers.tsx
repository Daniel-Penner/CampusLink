import React, {useEffect, useState} from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ServersSidebar from '../../components/ServersSidebar/ServersSidebar';
import ServerWindow from '../../components/ServerWindow/ServerWindow';
import ChannelsNavbar from '../../components/ChannelsNavbar/ChannelsNavbar';
import CreateServerModal from '../../components/CreateServerModal/CreateServerModal';
import styles from './Servers.module.css';

const ServersPage: React.FC = () => {
    const [servers, setServers] = useState<any[]>([]);
    const [selectedServer, setSelectedServer] = useState<any | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isCreatingServer, setIsCreatingServer] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
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
                // Optionally select the first server and its first channel
                if (data.length > 0) {
                    setSelectedServer(data[0]);
                    setSelectedChannel(data[0].channels[0] || null);
                }
            })
            .catch(error => console.error('Error fetching servers:', error));
    }, []);

    const handleServerSelect = (server: any) => {
        setSelectedServer(server);
        setSelectedChannel(server.channels[0] || null);
    };

    const handleChannelSelect = (channel: any) => {
        setSelectedChannel(channel);
    };

    const handleCreateServer = (serverData: { name: string; isPublic: boolean; channels: { name: string }[] }) => {
        const token = localStorage.getItem('token');

        fetch('/api/servers/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serverData)
        })
            .then(response => response.json())
            .then(newServer => {
                setServers([...servers, newServer]);
                setSelectedServer(newServer);
                setSelectedChannel(newServer.channels[0] || null);
                setIsCreatingServer(false); // Close the modal after creating the server
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
                    onCreateServer={() => setIsCreatingServer(true)} // Open modal on click
                />
                <div className={`${styles.mainColumn} ${isSidebarExpanded ? styles.shiftRight : ''}`}>
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
            {isCreatingServer && (
                <CreateServerModal
                    onClose={() => setIsCreatingServer(false)} // Close modal on cancel
                    onCreateServer={handleCreateServer} // Handle server creation
                />
            )}
        </div>
    );
};

export default ServersPage;
