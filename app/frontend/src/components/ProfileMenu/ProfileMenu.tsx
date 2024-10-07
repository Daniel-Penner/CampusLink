import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileMenu.module.css';
import { AuthContext } from '../../contexts/AuthContext';

const ProfileMenu: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Ensure that authContext is not undefined
    if (!authContext) {
        throw new Error('AuthContext is not provided. Make sure you are wrapping your component tree with AuthProvider.');
    }

    const {logout } = authContext;
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Log out the user
        navigate('/'); // Navigate to the homepage
    };

    return (
        <div className={styles.profileMenu}>
            <button onClick={() => navigate('/profile')} className={styles.menuItem}>
                Profile
            </button>
            <button onClick={() => navigate('/settings')} className={styles.menuItem}>
                Settings
            </button>
            <button onClick={handleLogout} className={styles.menuItem}>
                Log Out
            </button>
        </div>
    );
};

export default ProfileMenu;
