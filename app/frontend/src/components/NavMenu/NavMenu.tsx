import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NavMenu.module.css';

interface NavMenuProps {
    isClosing: boolean;
}

const NavMenu: React.FC<NavMenuProps> = ({ isClosing }) => {
    const navigate = useNavigate();

    // Navigation handler
    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className={`${styles.navMenu} ${isClosing ? styles.slideOut : styles.slideIn}`}>
            <button onClick={() => handleNavigation('/dashboard')} className={styles.navButton}>
                Home
            </button>
            <button onClick={() => handleNavigation('/connections')} className={styles.navButton}>
                Connections
            </button>
            <button onClick={() => handleNavigation('/messages')} className={styles.navButton}>
                Messages
            </button>
            <button onClick={() => handleNavigation('/servers')} className={styles.navButton}>
                Servers
            </button>
            <button onClick={() => handleNavigation('/locations')} className={styles.navButton}>
                Explore
            </button>
        </div>
    );
};

export default NavMenu;
