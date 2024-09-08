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
            <button onClick={() => handleNavigation('/')} className={styles.navButton}>
                Home
            </button>
            <button onClick={() => handleNavigation('/works')} className={styles.navButton}>
                Works
            </button>
            <button onClick={() => handleNavigation('/contact')} className={styles.navButton}>
                Contact
            </button>
            <button onClick={() => handleNavigation('/tutorials')} className={styles.navButton}>
                Tutorials / Blog
            </button>
            <button onClick={() => handleNavigation('/experiments')} className={styles.navButton}>
                Experiments
            </button>
            <button onClick={() => handleNavigation('/ar-filters')} className={styles.navButton}>
                AR Filters
            </button>
        </div>
    );
};

export default NavMenu;
