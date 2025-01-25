import React, { useContext, useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import logo from '../../assets/logoLarge.svg';
import NavMenu from "../NavMenu/NavMenu";
import ProfileMenu from "../ProfileMenu/ProfileMenu";  // New ProfileMenu component
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext is not provided. Make sure you are wrapping your component tree with AuthProvider.');
    }

    const navigate = useNavigate();
    const { isAuthenticated } = authContext;
    const [menuOpen, setMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchProfilePicture = async () => {
                const token = localStorage.getItem('token');
                const userId = authContext.id || localStorage.getItem('id');
                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setProfilePicture(data.profilePicture);
                    }
                } catch (error) {
                    console.error('Error fetching profile picture:', error);
                }
            };

            fetchProfilePicture();
        }
    }, [isAuthenticated, authContext.id]);

    const toggleMenu = () => {
        if (menuOpen) {
            setIsClosing(true);
            setHamburgerOpen(false);
            setTimeout(() => {
                setMenuOpen(false);
                setIsClosing(false);
            }, 250);
        } else {
            setMenuOpen(true);
            setHamburgerOpen(true);
        }
    };

    const toggleProfileMenu = () => {
        setProfileMenuOpen(!profileMenuOpen);
    };

    return (
        <>
            {menuOpen && <div className={styles.overlay}></div>}
            <nav className={styles.navbar}>
                <div>
                    <button
                        onClick={toggleMenu}
                        className={`${styles.hamburger} ${hamburgerOpen ? styles.open : ''}`}
                    >
                        <div></div>
                        <div></div>
                        <div></div>
                    </button>
                    {isAuthenticated ? (
                        <a href="/dashboard" className={styles.logoContainer}>
                            <img src={logo} alt="Logo" className={styles.logo} />
                        </a>
                    ) : (
                        <a href="/" className={styles.logoContainer}>
                            <img src={logo} alt="Logo" className={styles.logo}/>
                        </a>
                    )}
                </div>
                <div className={styles.rightSide}>
                    {isAuthenticated ? (
                        <div className={styles.profileContainer}>
                            <img
                                src={profilePicture || '/path-to-default-placeholder.png'} // Fallback to default
                                alt="Profile"
                                className={styles.profilePic}
                                onClick={toggleProfileMenu}
                            />
                            {profileMenuOpen && <ProfileMenu />}
                        </div>
                    ) : (
                        <>
                            <button className={styles.loginButton} onClick={() => navigate('/login')}>Log In</button>
                            <button className={styles.getStartedButton} onClick={() => navigate('/register')}>Get Started</button>
                        </>
                    )}
                </div>
                {(menuOpen || isClosing) && <NavMenu isClosing={isClosing} />}
            </nav>
        </>
    );
};

export default Navbar;
