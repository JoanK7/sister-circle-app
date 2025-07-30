import React, { useState } from 'react';
import { Heart, LogIn } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const LoginPage = ({ setPage }) => {
    // Destructure signInWithGoogle from useAuth
    const { login, signInWithGoogle } = useAuth(); // ADDED: signInWithGoogle
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
            setError(err.message);
        }
    };

    // NEW: Handler for Google Sign-In
    const handleGoogleSignIn = async () => {
        setError(''); // Clear previous errors
        try {
            await signInWithGoogle();
            setPage('home'); // Redirect on successful Google login
        } catch (err) {
            // Display error for Google Sign-In
            setError(err.message); 
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <div className="auth-header">
                    <div className="logo-icon-wrapper">
                        <Heart className="logo-icon" />
                    </div>
                    <h2 className="auth-title">Welcome Back!</h2>
                    <p className="auth-subtitle">Log in to continue your journey with SisterCircle.</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <p className="error-message form-error">{error}</p>}
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    <Button type="submit" variant="primary" className="w-full">
                        <LogIn className="inline-block mr-2" /> Log In
                    </Button>
                </form>

                {/* NEW: Divider and Google Sign-In Button */}
                <div className="social-login-divider">
                    <span className="social-login-text">OR</span>
                </div>
                <Button 
                    type="button" // Important: set type to "button" to prevent form submission
                    variant="secondary" 
                    className="w-full social-login-button" 
                    onClick={handleGoogleSignIn} // Call the new handler
                >
                    {/* You'll need to add an SVG or image for the Google icon here. 
                        For example: <img src="/images/google_icon.svg" alt="Google icon" className="inline-block mr-2 w-5 h-5" /> 
                        Or use an icon library if available. */}
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