import React, { useState } from 'react';
import { Heart, UserPlus } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';


const RegisterPage = ({ setPage }) => {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('mentee'); // Default role is mentee
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Pass the selected role to the register function
            await register(email, password, fullName, role);
            setPage('profile'); // Redirect to profile page to complete setup
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Join SisterCircle</h2>
                    <p className="text-gray-600">Create your account to start connecting.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                   
                    <Input label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Jane Doe" required />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required />


                    {/* NEW: Role Selection Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">I want to be a:</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                        >
                            <option value="mentee">Mentee (I want to find a mentor)</option>
                            <option value="mentor">Mentor (I want to offer guidance)</option>
                            <option value="both">Both a Mentor and a Mentee</option>
                        </select>
                    </div>
                   
                    <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                        {loading ? 'Creating Account...' : <><UserPlus className="inline-block mr-2 w-5 h-5" /> Create Account</>}
                    </Button>
                </form>
                <p className="text-center mt-6 text-gray-600">
                    Already have an account?{' '}
                    <button onClick={() => setPage('login')} className="font-medium text-pink-600 hover:underline">Log in</button>
                </p>
            </Card>
        </div>
    );
};


export default RegisterPage;