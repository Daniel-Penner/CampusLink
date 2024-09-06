import React from 'react';
import styles from './NavMenu.module.css';

interface NavMenuProps {
    isClosing: boolean;
}

const NavMenu: React.FC<NavMenuProps> = ({ isClosing }) => {
    return (
        <div className={`${styles.navMenu} ${isClosing ? styles.slideOut : styles.slideIn}`}>
            <a href="#">Home</a>
            <a href="#">Works</a>
            <a href="#">Contact</a>
            <a href="#">Tutorials / Blog</a>
            <a href="#">Experiments</a>
            <a href="#">AR Filters</a>
        </div>
    );
};

export default NavMenu;
