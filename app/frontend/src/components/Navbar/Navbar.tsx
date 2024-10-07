import React, { useContext, useState } from 'react';
import styles from './Navbar.module.css';
import logo from '../../assets/logoLarge.svg';
import NavMenu from "../NavMenu/NavMenu";
import ProfileMenu from "../ProfileMenu/ProfileMenu";  // New ProfileMenu component
import profilePic from '../../assets/profile.png';
import { AuthContext } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
    const authContext = useContext(AuthContext);

    // Ensure that authContext is not undefined
    if (!authContext) {
        throw new Error('AuthContext is not provided. Make sure you are wrapping your component tree with AuthProvider.');
    }

    const { isAuthenticated } = authContext;
    const [menuOpen, setMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false); // Track profile menu state

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
                                src={profilePic}
                                alt="Profile"
                                className={styles.profilePic}
                                onClick={toggleProfileMenu}
                            />
                            {profileMenuOpen && <ProfileMenu />}
                        </div>
                    ) : (
                        <>
                            <button className={styles.loginButton}>Log In</button>
                            <button className={styles.getStartedButton}>Get Started</button>
                        </>
                    )}
                </div>
                {(menuOpen || isClosing) && <NavMenu isClosing={isClosing} />}
            </nav>
        </>
    );
};

export default Navbar;
