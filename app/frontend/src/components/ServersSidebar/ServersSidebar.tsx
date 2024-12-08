import React from 'react';
import styles from './ServersSidebar.module.css';
import { FaPlus } from 'react-icons/fa';

interface ServersSidebarProps {
    servers: any[];
    selectedServer: any | null;
    setSelectedServer: (server: any) => void;
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
                                                       }) => (
    <div
        className={styles.sidebar}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
        {/* Add Server button */}
        <div className={styles.box} onClick={onCreateServer}>
            <div className={styles.serverIcon} style={{ backgroundColor: 'var(--primary-color)' }}>
                <FaPlus />
            </div>
            <span className={styles.serverName}>Add Server</span>
        </div>
        {/* Render server list */}
        {servers.map((server) => (
            <div
                className={`${styles.box} ${server?._id === selectedServer?._id ? styles.active : ''}`}
                key={server._id || Math.random()}
                onClick={() => setSelectedServer(server)}
            >
                <div className={styles.serverIcon}>
                    {server?.photo ? (
                        <img
                            src={server.photo} // Display server photo
                            alt={server.name || 'Server'}
                            className={styles.serverImage}
                        />
                    ) : (
                        <div className={styles.defaultServerIcon}>{server.name?.[0] || 'S'}</div>
                    )}
                </div>
                <span className={styles.serverName}>{server.name || 'Unnamed Server'}</span>
            </div>
        ))}
    </div>
);

export default ServersSidebar;
