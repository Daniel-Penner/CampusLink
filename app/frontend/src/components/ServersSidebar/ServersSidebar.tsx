import React from 'react';
import styles from './ServersSidebar.module.css';
import { FaPlus } from 'react-icons/fa';
import defaultLogo from '../../assets/logoSmall.svg';

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
                                                           onCreateServer
                                                       }) => (
    <div
        className={styles.sidebar}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
    >
        {/* Add Server button triggers the modal open */}
        <div className={styles.box} onClick={onCreateServer}>
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
                <div className={styles.serverIcon}>
                    {server.photo ? (
                        <img
                            src={server.photo || defaultLogo}
                            alt={server.name}
                            className={styles.serverImage}
                        />
                    ) : (
                        <div className={styles.defaultServerIcon}>{server.name[0]}</div>
                    )}
                </div>
                <span className={styles.serverName}>{server.name}</span>
            </div>
        ))}
    </div>
);

export default ServersSidebar;
