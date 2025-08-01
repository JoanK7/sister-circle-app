import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit3, Save, X } from 'lucide-react';

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
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile not found</h3>
                    <p className="text-gray-500">Please try refreshing the page</p>
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
            
            <h2 className="text-3xl font-bold mb-6">My Profile</h2>
            
            {!editMode ? (
                <Card className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{profile.fullName}</h3>
                            <p className="text-gray-600 mb-1">{profile.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-medium">
                                    {profile.role || 'mentee'}
                                </span>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setEditMode(true)} 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-500 hover:text-pink-600"
                        >
                            <Edit3 className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Bio</h4>
                            <p className="text-gray-700 leading-relaxed">
                                {profile.bio || 'No bio added yet. Click edit to add your bio.'}
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Interests & Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests?.length > 0 ? (
                                    profile.interests.map(interest => (
                                        <span key={interest} className="tag">{interest}</span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No interests added yet.</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Availability</h4>
                            <p className="text-gray-700">{profile.availability || 'Not specified'}</p>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="profile-card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="profile-avatar">
                                {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Edit Your Profile</h3>
                                <p className="text-gray-600">Tell us about yourself and your interests</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setEditMode(false)} 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="input-label">Bio</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                                className="input-field"
                                rows="4"
                            />
                        </div>
                        
                        <div>
                            <label className="input-label">Interests & Expertise</label>
                            <input
                                type="text"
                                value={interests}
                                onChange={e => setInterests(e.target.value)}
                                placeholder="e.g., Business, Tech, Motherhood, Mental Health"
                                className="input-field"
                            />
                            <p className="text-sm text-gray-500 mt-1">Separate interests with commas</p>
                        </div>
                        
                        <div>
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
                        
                        <div className="flex gap-3 pt-4">
                            <Button 
                                onClick={handleSave} 
                                variant="gradient" 
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button 
                                onClick={() => setEditMode(false)} 
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;