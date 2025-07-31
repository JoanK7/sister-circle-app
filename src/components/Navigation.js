import React, { useState } from 'react';
import { Heart, Users, Calendar, MessageCircle, X, Menu, User as UserIcon, Home } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const Navigation = ({ setPage }) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setPage('home');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const NavLink = ({ icon: Icon, label, page }) => (
        <button onClick={() => { setPage(page); setIsMenuOpen(false); }} className="nav-link">
            <Icon className="nav-link-icon" />
            <span>{label}</span>
        </button>
    );

    const MobileNavLink = ({ icon: Icon, label, page }) => (
        <button onClick={() => { setPage(page); setIsMenuOpen(false); }} className="mobile-nav-link">
            <Icon className="mobile-nav-link-icon" />
            <span>{label}</span>
        </button>
    );

    return (
        <header className="header">
            <div className="container header-container">
                <div className="logo" onClick={() => setPage('home')}>
                    <div className="logo-icon-wrapper">
                        <Heart className="logo-icon" />
                    </div>
                    <h1 className="logo-text">SisterCircle</h1>
                </div>
                <nav className="desktop-nav">
                    <NavLink icon={Home} label="Home" page="home" />
                    <NavLink icon={Users} label="Mentors" page="mentors" />
                    <NavLink icon={Calendar} label="Sessions" page="sessions" />
                    <NavLink icon={MessageCircle} label="Forum" page="forum" />
                    {user && <NavLink icon={UserIcon} label="Profile" page="profile" />}
                    {user ? (
                        <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                    ) : (
                        <div className="auth-buttons">
                            <Button variant="ghost" size="sm" onClick={() => setPage('login')}>Login</Button>
                            <Button variant="primary" size="sm" onClick={() => setPage('register')}>Sign Up</Button>
                        </div>
                    )}
                </nav>
                <div className="mobile-menu-button">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-toggle">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="mobile-menu">
                    <MobileNavLink icon={Home} label="Home" page="home" />
                    <MobileNavLink icon={Users} label="Mentors" page="mentors" />
                    <MobileNavLink icon={Calendar} label="Sessions" page="sessions" />
                    <MobileNavLink icon={MessageCircle} label="Forum" page="forum" />
                    {user && <MobileNavLink icon={UserIcon} label="Profile" page="profile" />}
                    <div className="mobile-menu-divider"></div>
                    {user ? (
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">Logout</Button>
                    ) : (
                        <div className="mobile-auth-buttons">
                            <Button variant="ghost" onClick={() => { setPage('login'); setIsMenuOpen(false); }} className="w-full justify-start">Login</Button>
                            <Button variant="primary" onClick={() => { setPage('register'); setIsMenuOpen(false); }} className="w-full">Sign Up</Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navigation;