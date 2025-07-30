import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = ({ setPage }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState('');
    const [availability, setAvailability] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                setProfile(userDoc.data());
                setBio(userDoc.data().bio || '');
                setInterests((userDoc.data().interests || []).join(', '));
                setAvailability(userDoc.data().availability || '');
            }
        };
        fetchProfile();
    }, [db, user]);

    const handleSave = async () => {
        const interestsArr = interests.split(',').map(s => s.trim()).filter(Boolean);
        await updateDoc(doc(db, 'users', user.uid), {
            bio,
            interests: interestsArr,
            availability
        });
        setEditMode(false);
        setProfile({ ...profile, bio, interests: interestsArr, availability });
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="container">
            <h2>My Profile</h2>
            <Card>
                {!editMode ? (
                    <div>
                        <div><b>Name:</b> {profile.fullName}</div>
                        <div><b>Email:</b> {profile.email}</div>
                        <div><b>Bio:</b> {profile.bio}</div>
                        <div><b>Interests:</b> {profile.interests?.join(', ')}</div>
                        <div><b>Availability:</b> {profile.availability}</div>
                        <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                    </div>
                ) : (
                    <div>
                        <Input label="Bio" value={bio} onChange={e => setBio(e.target.value)} />
                        <Input label="Interests (comma separated)" value={interests} onChange={e => setInterests(e.target.value)} />
                        <Input label="Availability" value={availability} onChange={e => setAvailability(e.target.value)} />
                        <Button onClick={handleSave}>Save</Button>
                        <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage; 