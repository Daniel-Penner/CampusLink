import React, { useState } from 'react';
import styles from './Navbar.module.css';
import logo from '../../assets/logoLarge.svg';
import NavMenu from "../NavMenu/NavMenu.tsx";

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);

    const toggleMenu = () => {
        if (menuOpen) {
            // Start the close animation
            setIsClosing(true);
            setHamburgerOpen(false);  // Trigger hamburger transformation immediately
            setTimeout(() => {
                setMenuOpen(false);  // Close the menu after the animation ends
                setIsClosing(false); // Reset closing state
            }, 250);  // Match the animation duration
        } else {
            setMenuOpen(true);  // Open the menu
            setHamburgerOpen(true);  // Trigger hamburger transformation immediately
        }
    };

    return (
        <>
            {/* Overlay to blur everything except the menu and close button */}
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
                    <a href="/" className={styles.logoContainer}>
                        <img src={logo} alt="Logo" className={styles.logo} />
                    </a>
                </div>
                <div className={styles.rightSide}>
                    <button className={styles.loginButton}>Log In</button>
                    <button className={styles.getStartedButton}>Get Started</button>
                </div>
                {(menuOpen || isClosing) && <NavMenu isClosing={isClosing} />}
            </nav>
        </>
    );
};

export default Navbar;
