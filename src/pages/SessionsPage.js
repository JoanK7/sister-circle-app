import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db, storage } from '../firebase';
import { collection, getDocs, query, where, addDoc, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

const SessionsPage = ({ setPage }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [recording, setRecording] = useState(false);
    const [mediaSupported, setMediaSupported] = useState(false);
    const [rescheduleId, setRescheduleId] = useState(null);
    const [newTime, setNewTime] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        setMediaSupported(!!(window.MediaRecorder));
    }, []);

    useEffect(() => {
        const fetchSessions = async () => {
            const q = query(collection(db, 'sessions'), where('participants', 'array-contains', user?.uid));
            const snapshot = await getDocs(q);
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        if (user) fetchSessions();
    }, [user]);

    // Real-time listener for messages
    useEffect(() => {
        if (!activeSession) {
            setMessages([]);
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            return;
        }
        const messagesRef = collection(db, 'sessions', activeSession.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubscribeRef.current = unsubscribe;
        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
    }, [activeSession]);

    const handleJoin = (session) => {
        setActiveSession(session);
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
            });
            setSessions(sessions => sessions.map(s => s.id === sessionId ? { ...s, time: new Date(newTime).toISOString(), status: 'scheduled' } : s));
            setRescheduleId(null);
            setNewTime('');
        } catch (err) {
            alert('Failed to reschedule: ' + err.message);
        }
    };

    const handleSendText = async () => {
        if (!text.trim() || !activeSession) return;
        const messagesRef = collection(db, 'sessions', activeSession.id, 'messages');
        await addDoc(messagesRef, {
            type: 'text',
            text,
            sender: user.uid,
            timestamp: new Date()
        });
        setText('');
    };

    // --- Voice Messaging ---
    const handleStartRecording = async () => {
        if (!mediaSupported) {
            alert('Voice recording is not supported in this browser.');
            return;
        }
        setRecording(true);
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new window.MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // Upload to Firebase Storage
                const fileName = `sessions/${activeSession.id}/voice_${Date.now()}_${user.uid}.webm`;
                const audioRef = ref(storage, fileName);
                await uploadBytes(audioRef, audioBlob);
                const audioUrl = await getDownloadURL(audioRef);
                // Save message in Firestore
                const messagesRef = collection(db, 'sessions', activeSession.id, 'messages');
                await addDoc(messagesRef, {
                    type: 'audio',
                    audioUrl,
                    sender: user.uid,
                    timestamp: new Date()
                });
            };
            mediaRecorder.start();
        } catch (err) {
            setRecording(false);
            alert('Could not start recording: ' + err.message);
        }
    };

    const handleStopRecording = () => {
        setRecording(false);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="container">
            <h2>My Sessions</h2>
            {!activeSession ? (
                <div className="grid-3">
                    {sessions.map(session => (
                        <Card key={session.id} hover>
                            <h4>{session.topic}</h4>
                            <div>with {session.mentorName}</div>
                            <div>{session.time ? new Date(session.time).toLocaleString() : 'Not scheduled yet'}</div>
                            {rescheduleId === session.id ? (
                                <div style={{ margin: '1em 0' }}>
                                    <input
                                        type="datetime-local"
                                        value={newTime}
                                        onChange={e => setNewTime(e.target.value)}
                                        className="input-field"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Button onClick={() => handleRescheduleSubmit(session.id)}>
                                        Update
                                    </Button>
                                    <Button variant="ghost" onClick={() => setRescheduleId(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button onClick={() => handleJoin(session)}>Join Session</Button>
                                    <Button variant="ghost" onClick={() => handleReschedule(session)}>Reschedule</Button>
                                </>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <div>
                    <Button onClick={() => setActiveSession(null)} variant="ghost">Back to Sessions</Button>
                    <h3>Session: {activeSession.topic}</h3>
                    <div className="messages">
                        {messages.map((msg, idx) => (
                            <div key={msg.id || idx} className={`message ${msg.sender === user.uid ? 'own' : ''}`}>
                                {msg.type === 'text' ? msg.text : msg.type === 'audio' ? <audio controls src={msg.audioUrl} /> : null}
                            </div>
                        ))}
                    </div>
                    <div className="message-inputs">
                        <input
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Type a message..."
                            className="input-field"
                        />
                        <Button onClick={handleSendText}>Send</Button>
                        <Button onClick={recording ? handleStopRecording : handleStartRecording}>
                            {recording ? 'Stop Recording' : 'Record Voice'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionsPage; 