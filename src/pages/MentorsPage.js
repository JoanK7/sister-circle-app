import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
// Import Firebase SDKs for calling cloud functions and updating documents
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, getDocs, query, where, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MentorsPage = ({ setPage }) => {
    const { user } = useAuth();
    const [mentors, setMentors] = useState([]);
    const [search, setSearch] = useState('');
    const [suggested, setSuggested] = useState([]);
    const [requesting, setRequesting] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [selectedInterest, setSelectedInterest] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            const q = query(collection(db, 'users'), where('role', 'in', ['mentor', 'both']));
            const snapshot = await getDocs(q);
            const mentorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMentors(mentorList);
        };
        fetchMentors();
    }, []);

    useEffect(() => {
        // Simple matching: suggest mentors with at least one shared interest/tag
        if (user && user.interests) {
            setSuggested(
                mentors.filter(m =>
                    m.uid !== user.uid &&
                    m.interests && m.interests.some(tag => user.interests.includes(tag))
                )
            );
        } else {
            setSuggested([]);
        }
    }, [mentors, user]);

    const handleRequestSession = async (mentor) => {
        if (!user) {
            setConfirmation("Please log in to request a session.");
            return;
        }
        // Assume the mentor object contains an 'email' field
        if (!mentor.email || !user.email) {
            setConfirmation("Could not find email for mentor or mentee.");
            return;
        }
    
        setRequesting(true);
        setConfirmation('');
        try {
            console.log('Creating session for:', {
                mentor: mentor.fullName,
                mentorEmail: mentor.email,
                mentee: user.fullName,
                menteeEmail: user.email
            });

            const sessionDocRef = await addDoc(collection(db, 'sessions'), {
                mentorId: mentor.uid,
                mentorName: mentor.fullName,
                menteeId: user.uid,
                menteeName: user.fullName || user.displayName,
                participants: [mentor.uid, user.uid],
                topic: `Mentorship with ${mentor.fullName}`,
                createdAt: serverTimestamp(),
                status: 'pending',
                meetLink: null, // Initially null
            });

            console.log('Session created with ID:', sessionDocRef.id);

            const functions = getFunctions();
            const createGoogleMeet = httpsCallable(functions, 'createGoogleMeet');
    
            console.log('Calling createGoogleMeet function...');
            // Pass the required email addresses to the function
            const result = await createGoogleMeet({
                mentorEmail: mentor.email,
                menteeEmail: user.email,
                topic: `Mentorship with ${mentor.fullName}`
            });
    
            console.log('Google Meet creation result:', result.data);
            const { meetLink } = result.data;
    
            if (!meetLink) {
                throw new Error('No Meet link returned from cloud function');
            }

            await updateDoc(sessionDocRef, {
                meetLink: meetLink
            });
    
            console.log('Session updated with Meet link:', meetLink);
            setConfirmation(`Session request sent to ${mentor.fullName}! Meet link created successfully.`);
            // Optionally navigate to the sessions page
            setPage('sessions');
    
        } catch (err) {
            console.error("Error requesting session:", err);
            setConfirmation('Failed to request session: ' + err.message);
            
            // If Google Meet creation fails, still create the session but mark it
            if (err.message.includes('Google Meet') || err.message.includes('calendar') || err.message.includes('Meet link')) {
                try {
                    console.log('Creating fallback session without Meet link...');
                    await addDoc(collection(db, 'sessions'), {
                        mentorId: mentor.uid,
                        mentorName: mentor.fullName,
                        menteeId: user.uid,
                        menteeName: user.fullName || user.displayName,
                        participants: [mentor.uid, user.uid],
                        topic: `Mentorship with ${mentor.fullName}`,
                        createdAt: serverTimestamp(),
                        status: 'pending',
                        meetLink: null,
                        error: 'Google Meet creation failed'
                    });
                    setConfirmation(`Session request sent to ${mentor.fullName}! (Meet link creation failed - will be retried)`);
                } catch (fallbackErr) {
                    console.error("Fallback session creation failed:", fallbackErr);
                    setConfirmation('Failed to create session: ' + fallbackErr.message);
                }
            }
        }
        setRequesting(false);
    };

    // Get all unique interests from mentors
    const allInterests = [...new Set(mentors.flatMap(m => m.interests || []))];

    // Filter mentors based on search term and selected interest
    const filteredMentors = mentors.filter(m => {
        const matchesSearch = m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            m.interests?.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
            m.bio?.toLowerCase().includes(search.toLowerCase());
        
        const matchesInterest = !selectedInterest || m.interests?.includes(selectedInterest);
        
        return matchesSearch && matchesInterest;
    });

    return (
        <div className="container">
            <h2>Find Your Mentor</h2>
            
            {/* Search and Filter Section */}
            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search by expertise, name, or bio..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: '1rem', width: '100%' }}
                />
                
                {/* Interest Filter */}
                <div style={{ marginBottom: '1rem' }}>
                    <label className="input-label">Filter by Interest:</label>
                    <select
                        value={selectedInterest}
                        onChange={e => setSelectedInterest(e.target.value)}
                        className="input-field"
                        style={{ width: 'auto', marginLeft: '0.5rem' }}
                    >
                        <option value="">All Interests</option>
                        {allInterests.map(interest => (
                            <option key={interest} value={interest}>{interest}</option>
                        ))}
                    </select>
                </div>
            </div>

            {confirmation && <div className="notification success">{confirmation}</div>}
            
            <h3>Suggested Matches</h3>
            <div className="grid-3">
                {suggested.map(mentor => (
                    <Card key={mentor.uid} hover>
                        <h4>{mentor.fullName}</h4>
                        <div>{mentor.location}</div>
                        <div>{mentor.bio}</div>
                        <div>
                            {mentor.interests?.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                        <Button onClick={() => handleRequestSession(mentor)} disabled={requesting} variant="gradient">
                            {requesting ? 'Sending...' : 'Request Session'}
                        </Button>
                    </Card>
                ))}
            </div>
            
            <h3>All Mentors ({filteredMentors.length})</h3>
            <div className="grid-3">
                {filteredMentors.map(mentor => (
                    <Card key={mentor.uid} hover>
                        <h4>{mentor.fullName}</h4>
                        <div>{mentor.location}</div>
                        <div>{mentor.bio}</div>
                        <div>
                            {mentor.interests?.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                        <Button onClick={() => handleRequestSession(mentor)} disabled={requesting} variant="gradient">
                            {requesting ? 'Sending...' : 'Request Session'}
                        </Button>
                    </Card>
                ))}
            </div>
            
            {filteredMentors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>No mentors found matching your criteria.</p>
                    <Button onClick={() => { setSearch(''); setSelectedInterest(''); }} variant="ghost">
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MentorsPage;