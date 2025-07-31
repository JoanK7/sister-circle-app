import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = ({ setPage }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState('');
    const [availability, setAvailability] = useState('Weekdays');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    const data = userDoc.data();
                    setProfile(data);
                    setBio(data?.bio || '');
                    setInterests((data?.interests || []).join(', '));
                    setAvailability(data?.availability || 'Weekdays');
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = async () => {
        if (!user) return;
        
        setSaving(true);
        try {
            const interestsArr = interests.split(',').map(s => s.trim()).filter(Boolean);
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                bio,
                interests: interestsArr,
                availability,
                updatedAt: new Date()
            });
            
            setProfile({ ...profile, bio, interests: interestsArr, availability });
            setEditMode(false);
            showNotification('Profile updated successfully!');
        } catch (error) {
            showNotification('Failed to update profile: ' + error.message, 'error');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Profile not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {notification && (
                <div className={`notification ${notification.type === 'error' ? 'error' : 'success'}`}>
                    {notification.message}
                </div>
            )}
            
            <h2>My Profile</h2>
            
            {!editMode ? (
                <Card className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3>{profile.fullName}</h3>
                            <p>{profile.email}</p>
                            <p>Role: {profile.role || 'mentee'}</p>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4>Bio</h4>
                        <p>{profile.bio || 'No bio added yet.'}</p>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4>Interests</h4>
                        <div>
                            {profile.interests?.length > 0 ? (
                                profile.interests.map(interest => (
                                    <span key={interest} className="tag">{interest}</span>
                                ))
                            ) : (
                                <p>No interests added yet.</p>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4>Availability</h4>
                        <p>{profile.availability || 'Not specified'}</p>
                    </div>
                    
                    <Button onClick={() => setEditMode(true)} variant="gradient">
                        Edit Profile
                    </Button>
                </Card>
            ) : (
                <Card className="profile-card">
                    <h3>Edit Profile</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Bio</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="input-field"
                            rows="4"
                        />
                    </div>
                    
                    <Input
                        label="Interests (comma separated)"
                        value={interests}
                        onChange={e => setInterests(e.target.value)}
                        placeholder="e.g., Business, Tech, Motherhood, Mental Health"
                    />
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Availability</label>
                        <select
                            value={availability}
                            onChange={e => setAvailability(e.target.value)}
                            className="input-field"
                        >
                            <option value="Weekdays">Weekdays</option>
                            <option value="Weekends">Weekends</option>
                            <option value="Evenings">Evenings</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button onClick={handleSave} variant="gradient" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button onClick={() => setEditMode(false)} variant="ghost">
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;