import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NavMenu.module.css';
import { AuthContext } from '../../contexts/AuthContext';

interface NavMenuProps {
    isClosing: boolean;
}

const NavMenu: React.FC<NavMenuProps> = ({ isClosing }) => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext is not provided. Make sure you are wrapping your component tree with AuthProvider.');
    }

    const { isAuthenticated } = authContext;

    return (
        <div className={`${styles.navMenu} ${isClosing ? styles.slideOut : styles.slideIn}`}>
            {/* Always visible */}
            <button onClick={() => navigate('/')} className={styles.navButton}>
                Home
            </button>
            <button onClick={() => navigate('/about')} className={styles.navButton}>
                About
            </button>

            {/* Only show these if the user is authenticated */}
            {isAuthenticated && (
                <>
                    <button onClick={() => navigate('/dashboard')} className={styles.navButton}>
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/connections')} className={styles.navButton}>
                        Connections
                    </button>
                    <button onClick={() => navigate('/messages')} className={styles.navButton}>
                        Messages
                    </button>
                    <button onClick={() => navigate('/servers')} className={styles.navButton}>
                        Servers
                    </button>
                    <button onClick={() => navigate('/locations')} className={styles.navButton}>
                        Locations
                    </button>
                </>
            )}
        </div>
    );
};

export default NavMenu;
