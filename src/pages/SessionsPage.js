import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mic, Send, Square, Trash2, X as XIcon, Calendar, Clock, User, Paperclip, MessageCircle } from 'lucide-react';

const SessionsPage = ({ setPage }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [recording, setRecording] = useState(false);
    
    // NEW: State for audio preview
    const [audioPreview, setAudioPreview] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    // Fetch user's sessions in real-time
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'sessions'), where('participants', 'array-contains', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSessions(sessionsData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)));
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch messages for the active session in real-time
    useEffect(() => {
        if (!activeSession) return;
        const messagesRef = collection(db, 'sessions', activeSession.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [activeSession]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendText = async () => {
        if (!text.trim() || !activeSession) return;
        const messagesRef = collection(db, 'sessions', activeSession.id, 'messages');
        await addDoc(messagesRef, {
            type: 'text',
            text,
            senderId: user.uid,
            senderName: user.displayName,
            timestamp: serverTimestamp()
        });
        setText('');
    };

    // --- Voice Messaging (REWORKED LOGIC) ---
    const handleStartRecording = async () => {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            alert('Voice recording is not supported in this browser.');
            return;
        }
        setRecording(true);
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            
            // NEW: On stop, create a preview, don't send automatically
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const audioUrl = URL.createObjectURL(blob);
                setAudioPreview(audioUrl);
                // Clean up the stream
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
        } catch (err) {
            setRecording(false);
            console.error('Could not start recording:', err);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);
    };

    const handleCancelAudio = () => {
        setAudioPreview(null);
        setAudioBlob(null);
    };

    // NEW: Function to handle sending the recorded audio
    const handleSendVoiceMessage = async () => {
        if (!audioBlob || !activeSession) return;
        
        const fileName = `sessions/${activeSession.id}/voice_${Date.now()}_${user.uid}.webm`;
        const audioRef = ref(storage, fileName);
        
        try {
            // 1. Upload to Storage
            await uploadBytes(audioRef, audioBlob);
            // 2. Get Download URL
            const audioUrl = await getDownloadURL(audioRef);
            // 3. Save message to Firestore
            const messagesRef = collection(db, 'sessions', activeSession.id, 'messages');
            await addDoc(messagesRef, {
                type: 'audio',
                audioUrl,
                senderId: user.uid,
                senderName: user.displayName,
                timestamp: serverTimestamp()
            });
            // 4. Clean up state
            handleCancelAudio();
        } catch (error) {
            console.error("Failed to send voice message:", error);
            alert("Could not send voice message. Please try again.");
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return <p>Please log in to see your sessions.</p>;

    // --- RENDER LOGIC ---
    if (activeSession) {
        // Active Chat View
        return (
            <div className="chat-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={() => setActiveSession(null)} 
                                variant="ghost" 
                                size="sm"
                                className="p-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Session with {user.uid === activeSession.mentorId ? activeSession.menteeName : activeSession.mentorName}
                                    </h2>
                                    <p className="text-sm text-gray-500">Active now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Start the conversation</h3>
                            <p className="text-gray-500">Send a message to begin your mentorship session</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isOwnMessage = msg.senderId === user.uid;
                            const showSenderName = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                            
                            return (
                                <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
                                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                        {!isOwnMessage && showSenderName && (
                                            <p className="text-xs text-gray-500 mb-1 ml-2">{msg.senderName}</p>
                                        )}
                                        <div className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {!isOwnMessage && (
                                                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            <div className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-md ${
                                                isOwnMessage 
                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {msg.type === 'text' && (
                                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                                )}
                                                {msg.type === 'audio' && (
                                                    <div className="flex items-center gap-2">
                                                        <audio 
                                                            controls 
                                                            src={msg.audioUrl} 
                                                            className="w-48 h-8"
                                                            controlsList="nodownload"
                                                        />
                                                    </div>
                                                )}
                                                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <div className="message-inputs">
                    {audioPreview ? (
                        <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex-1">
                                <audio controls src={audioPreview} className="w-full" />
                            </div>
                            <Button 
                                onClick={handleSendVoiceMessage} 
                                variant="gradient" 
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send
                            </Button>
                            <Button 
                                onClick={handleCancelAudio} 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="input-field pr-12"
                                    onKeyPress={e => e.key === 'Enter' && handleSendText()}
                                />
                                <Button 
                                    onClick={handleSendText} 
                                    variant="ghost" 
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500"
                                    disabled={!text.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button 
                                onClick={recording ? handleStopRecording : handleStartRecording} 
                                variant={recording ? "primary" : "secondary"} 
                                size="md"
                                className={`flex items-center gap-2 ${recording ? 'animate-pulse' : ''}`}
                            >
                                {recording ? (
                                    <>
                                        <Square className="w-4 h-4" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-4 h-4" />
                                        Record
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Sessions List View - Updated to match the image design
    return (
        <div className="container">
            <h2 className="text-3xl font-bold mb-6">My Sessions</h2>
            <div className="sessions-grid">
                {sessions.map(session => (
                    <Card key={session.id} className="session-card" hover>
                        <div className="session-status upcoming">
                            upcoming
                        </div>
                        
                        <h4 className="text-xl font-bold mb-2">{session.topic}</h4>
                        
                        <div className="session-meta">
                            <User className="w-4 h-4" />
                            <span>with {session.mentorName}</span>
                        </div>
                        
                        <div className="session-meta">
                            <Calendar className="w-4 h-4" />
                            <span>Today</span>
                        </div>
                        
                        <div className="session-meta">
                            <Clock className="w-4 h-4" />
                            <span>3:00 PM</span>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                            <Button 
                                onClick={() => setActiveSession(session)} 
                                variant="gradient"
                                className="flex-1"
                            >
                                Join Session
                            </Button>
                            <Button variant="ghost">
                                Reschedule
                            </Button>
                        </div>
                    </Card>
                ))}
                
                {sessions.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No sessions yet</h3>
                        <p className="text-gray-500 mb-4">Start by requesting a session with a mentor</p>
                        <Button onClick={() => setPage('mentors')} variant="gradient">
                            Find a Mentor
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionsPage;
