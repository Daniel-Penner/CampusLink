import React from 'react';
import styles from './ServersSidebar.module.css';
import {FaPlus} from "react-icons/fa";

interface Server {
    _id: string;
    name: string;
    color: string;
}

interface ServersSidebarProps {
    servers: Server[];
    setSelectedServer: (server: Server) => void;
}

const ServersSidebar: React.FC<ServersSidebarProps> = ({ servers, setSelectedServer }) => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.box}>
            <button className={styles.addButton}><FaPlus/></button>
            </div>
            {servers.map(server => (
                <div className={styles.box}>
                <div
                    key={server._id}
                    className={styles.serverIcon}
                    style={{ backgroundColor: server.color }}
                    onClick={() => setSelectedServer(server)}
                >
                    <div className={styles.circle}></div>
                </div>
                    </div>
            ))}
        </div>
    );
};

export default ServersSidebar;
