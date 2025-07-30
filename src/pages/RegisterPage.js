import React, { useState } from 'react';
import { Heart, UserPlus } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const RegisterPage = ({ setPage }) => {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(email, password, fullName);
            setPage('home');
        } catch (err) {
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
                    <h2 className="auth-title">Join SisterCircle</h2>
                    <p className="auth-subtitle">Create your account to connect with mentors and peers.</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <p className="error-message form-error">{error}</p>}
                    <Input label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Jane Doe" required />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required />
                    <Button type="submit" variant="primary" className="w-full">
                        <UserPlus className="inline-block mr-2" /> Create Account
                    </Button>
                </form>
                <p className="auth-footer-text">
                    Already have an account?{' '}
                    <button onClick={() => setPage('login')} className="link">Log in</button>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage; 