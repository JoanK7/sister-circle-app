import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
// Removed: getFunctions, httpsCallable as they are no longer needed for Whereby integration
import { useAuth } from '../contexts/AuthContext';

const SessionsPage = ({ setPage }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    // Removed: activeSession as we're opening a new tab
    const [rescheduleId, setRescheduleId] = useState(null);
    const [newTime, setNewTime] = useState('');
    // Removed: creatingRoom as it was tied to Whereby room creation

    useEffect(() => {
        const fetchSessions = async () => {
            const q = query(collection(db, 'sessions'), where('participants', 'array-contains', user?.uid));
            const snapshot = await getDocs(q);
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        if (user) fetchSessions();
    }, [user]);

    // Removed the entire createVideoRoom function as it's no longer needed for Google Meet
    // const createVideoRoom = async (sessionId) => { ... };

    const handleJoin = (session) => {
        if (session.meetLink) {
            // Open the Google Meet link in a new tab! This is the key!
            window.open(session.meetLink, '_blank', 'noopener,noreferrer');
        } else {
            // Show more helpful error message
            if (session.error) {
                alert(`This session has an error: ${session.error}. Please contact support or try rescheduling.`);
            } else {
                alert("This session does not have a Google Meet link yet. The Meet link creation may have failed. Please try rescheduling or contact support.");
            }
        }
    };

    const handleReschedule = (session) => {
        setRescheduleId(session.id);
        setNewTime(session.time ? new Date(session.time).toISOString().slice(0, 16) : '');
    };

    const handleRescheduleSubmit = async (sessionId) => {
        if (!newTime) return;
        try {
            await updateDoc(doc(db, 'sessions', sessionId), {
                time: new Date(newTime).toISOString(),
                status: 'scheduled',
                lastUpdated: serverTimestamp(),
            });

            setSessions(sessions => sessions.map(s =>
                s.id === sessionId
                    ? { ...s, time: new Date(newTime).toISOString(), status: 'scheduled' }
                    : s
            ));

            setRescheduleId(null);
            setNewTime('');
            alert('Session rescheduled successfully!');
        } catch (err) {
            alert('Failed to reschedule: ' + err.message);
        }
    };

    return (
        <div className="container">
            <h2>My Sessions</h2>
            {/* The activeSession conditional rendering is removed, as we now always show the list */}
            <div className="grid-3">
                {sessions.map(session => (
                    <Card key={session.id} hover>
                        <h4>{session.topic}</h4>
                        <div>with {session.mentorName}</div>
                        <div>{session.time ? new Date(session.time).toLocaleString() : 'Not scheduled yet'}</div>
                        {/* Show error status if there was an issue with Meet link creation */}
                        {session.error && (
                            <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                ⚠️ {session.error}
                            </div>
                        )}
                        {/* Show Meet link status */}
                        {session.meetLink ? (
                            <div style={{ color: 'green', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                ✅ Meet link available
                            </div>
                        ) : (
                            <div style={{ color: 'orange', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                ⏳ Meet link pending
                            </div>
                        )}

                        {rescheduleId === session.id ? (
                            <div style={{ margin: '1em 0' }}>
                                <input
                                    type="datetime-local"
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                    className="input-field"
                                    style={{ marginRight: 8 }}
                                />
                                <Button onClick={() => handleRescheduleSubmit(session.id)} variant="gradient">
                                    Update
                                </Button>
                                <Button variant="ghost" onClick={() => setRescheduleId(null)}>
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div style={{ marginTop: '1em' }}>
                                <Button
                                    onClick={() => handleJoin(session)}
                                    variant="gradient"
                                    disabled={!session.meetLink}
                                    // Removed: disabled={creatingRoom}
                                >
                                    {session.meetLink ? 'Join Session' : 'Meet Link Pending'}
                                </Button>
                                <Button variant="ghost" onClick={() => handleReschedule(session)}>Reschedule</Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SessionsPage;
