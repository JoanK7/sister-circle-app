import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { Home, Users, MessageCircle, User, Settings, LogOut, Menu, X } from 'lucide-react';

const Navigation = ({ setPage }) => {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setPage('home');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo" onClick={() => setPage('home')}>
                    <div className="logo-icon-wrapper">
                        <Home className="logo-icon" />
                    </div>
                    <span className="logo-text">SisterCircle</span>
                </div>

                {user ? (
                    <>
                        <nav className="desktop-nav">
                            <button className="nav-link" onClick={() => setPage('mentors')}>
                                <Users className="nav-link-icon" />
                                Mentors
                            </button>
                            <button className="nav-link" onClick={() => setPage('sessions')}>
                                <MessageCircle className="nav-link-icon" />
                                Sessions
                            </button>
                            <button className="nav-link" onClick={() => setPage('forum')}>
                                <MessageCircle className="nav-link-icon" />
                                Forum
                            </button>
                            <button className="nav-link" onClick={() => setPage('profile')}>
                                <User className="nav-link-icon" />
                                Profile
                            </button>
                            <button className="nav-link" onClick={() => setPage('admin')}>
                                <Settings className="nav-link-icon" />
                                Admin
                            </button>
                            <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="nav-link-icon" />
                                Logout
                            </Button>
                        </nav>

                        <div className="mobile-menu-button">
                            <button 
                                className="menu-toggle" 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>

                        {mobileMenuOpen && (
                            <div className="mobile-menu">
                                <button className="mobile-nav-link" onClick={() => { setPage('mentors'); setMobileMenuOpen(false); }}>
                                    <Users className="mobile-nav-link-icon" />
                                    Mentors
                                </button>
                                <button className="mobile-nav-link" onClick={() => { setPage('sessions'); setMobileMenuOpen(false); }}>
                                    <MessageCircle className="mobile-nav-link-icon" />
                                    Sessions
                                </button>
                                <button className="mobile-nav-link" onClick={() => { setPage('forum'); setMobileMenuOpen(false); }}>
                                    <MessageCircle className="mobile-nav-link-icon" />
                                    Forum
                                </button>
                                <button className="mobile-nav-link" onClick={() => { setPage('profile'); setMobileMenuOpen(false); }}>
                                    <User className="mobile-nav-link-icon" />
                                    Profile
                                </button>
                                <button className="mobile-nav-link" onClick={() => { setPage('admin'); setMobileMenuOpen(false); }}>
                                    <Settings className="mobile-nav-link-icon" />
                                    Admin
                                </button>
                                <div className="mobile-menu-divider"></div>
                                <div className="mobile-auth-buttons">
                                    <Button variant="ghost" onClick={handleLogout} className="w-full">
                                        <LogOut className="mobile-nav-link-icon" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Button variant="ghost" onClick={() => setPage('login')}>Login</Button>
                        <Button variant="gradient" onClick={() => setPage('register')}>Get Started</Button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navigation;