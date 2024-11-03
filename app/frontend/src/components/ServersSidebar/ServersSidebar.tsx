import React from 'react';
import styles from './ServersSidebar.module.css';
import { FaPlus } from 'react-icons/fa';

interface ServersSidebarProps {
    servers: any[];
    selectedServer: any | null;
    setSelectedServer: (server: any) => void;
    onHover: () => void;
    onLeave: () => void;
}

const ServersSidebar: React.FC<ServersSidebarProps> = ({
                                                           servers,
                                                           selectedServer,
                                                           setSelectedServer,
                                                           onHover,
                                                           onLeave
                                                       }) => (
    <div
        className={styles.sidebar}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
        <div className={styles.box} onClick={() => console.log('Add Server')}>
            <div className={styles.serverIcon} style={{ backgroundColor: 'var(--primary-color)' }}>
                <FaPlus />
            </div>
            <span className={styles.serverName}>Add Server</span>
        </div>
        {servers.map(server => (
            <div
                className={`${styles.box} ${server._id === selectedServer?._id ? styles.active : ''}`}
                key={server._id}
                onClick={() => setSelectedServer(server)}
            >
                <div className={styles.serverIcon} style={{ backgroundColor: server.color }} />
                <span className={styles.serverName}>{server.name}</span>
            </div>
        ))}
    </div>
);

export default ServersSidebar;
