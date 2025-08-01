import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MentorsPage from './pages/MentorsPage';
import SessionsPage from './pages/SessionsPage';
import ForumPage from './pages/ForumPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const SisterCircleApp = () => {
    const [page, setPage] = useState('home');

    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage setPage={setPage} />;
            case 'login':
                return <LoginPage setPage={setPage} />;
            case 'register':
                return <RegisterPage setPage={setPage} />;
            case 'mentors':
                return <MentorsPage setPage={setPage} />;
            case 'sessions':
                return <SessionsPage setPage={setPage} />;
            case 'forum':
                return <ForumPage setPage={setPage} />;
            case 'profile':
                return <ProfilePage setPage={setPage} />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <AuthProvider>
            <div className="app">
                <Navigation setPage={setPage} />
                <main>
                    {renderPage()}
                </main>
            </div>
        </AuthProvider>
    );
};

export default SisterCircleApp;