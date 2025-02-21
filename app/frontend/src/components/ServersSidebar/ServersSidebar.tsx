import React, { useEffect, useState } from 'react';
import styles from './ServersSidebar.module.css';
import { FaPlus } from 'react-icons/fa';

interface Server {
    _id: string;
    name: string;
    photo?: string;
}

interface ServersSidebarProps {
    servers: Server[];
    selectedServer: Server | null;
    setSelectedServer: (server: Server) => void;
    onHover: () => void;
    onLeave: () => void;
    onCreateServer: () => void;
}

const ServersSidebar: React.FC<ServersSidebarProps> = ({
                                                           servers,
                                                           selectedServer,
                                                           setSelectedServer,
                                                           onHover,
                                                           onLeave,
                                                           onCreateServer,
                                                       }) => {
    const [serverList, setServerList] = useState<Server[]>(servers);

    // Keep local state in sync with `servers`
    useEffect(() => {
        setServerList(servers);
    }, [servers]);

    return (
        <div className={styles.sidebar} onMouseEnter={onHover} onMouseLeave={onLeave}>
            {/* Add Server button */}
            <div className={styles.box} onClick={onCreateServer}>
                <div className={styles.serverIcon} style={{ backgroundColor: 'var(--primary-color)' }}>
                    <FaPlus />
                </div>
                <span className={styles.serverName}>Add Server</span>
            </div>

            {/* Render server list */}
            {serverList.map((server) => {
                const isSelected = selectedServer?._id === server._id;
                return (
                    <div
                        key={server._id}
                        className={`${styles.box} ${isSelected ? styles.active : ''}`}
                        onClick={() => !isSelected && setSelectedServer(server)}
                    >
                        <div className={styles.serverIcon}>
                            {server?.photo ? (
                                <img
                                    src={server.photo}
                                    alt={server.name || 'Server'}
                                    className={styles.serverImage}
                                />
                            ) : (
                                <div className={styles.defaultServerIcon}>{server.name?.[0] || 'S'}</div>
                            )}
                        </div>
                        <span className={styles.serverName}>{server.name || 'Unnamed Server'}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ServersSidebar;
