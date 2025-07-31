import React, { useState } from 'react';
import { Heart, LogIn } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const LoginPage = ({ setPage }) => {
    const { login, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            setPage('home');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signInWithGoogle();
            setPage('home');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="auth-page" style={{ background: 'white' }}>
            <Card className="auth-card" style={{ maxWidth: '420px', boxShadow: 'none' }}>
                <div className="auth-header">
                    <div className="logo-icon-wrapper" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }}>
                        <Heart className="logo-icon" style={{ width: '1.5rem', height: '1.5rem' }} />
                    </div>
                    <h2 className="auth-title">Welcome Back!</h2>
                    <p className="auth-subtitle">Log in to continue your journey with SisterCircle.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <p className="error-message form-error">{error}</p>}
                    <Input label="Email or Phone" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email or phone" required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                    <Button type="submit" variant="gradient" className="w-full">
                        Login
                    </Button>
                </form>

                <div className="social-login-divider">
                    <span className="social-login-text">OR</span>
                </div>
                
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                >
                    Sign in with Google
                </Button>

                <p className="auth-footer-text">
                    Don't have an account?{' '}
                    <button onClick={() => setPage('register')} className="link">Sign up</button>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;