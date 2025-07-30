import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MentorsPage = ({ setPage }) => {
    const { user } = useAuth();
    const [mentors, setMentors] = useState([]);
    const [search, setSearch] = useState('');
    const [suggested, setSuggested] = useState([]);
    const [requesting, setRequesting] = useState(false);
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            const q = query(collection(db, 'users'), where('role', 'in', ['mentor', 'both']));
            const snapshot = await getDocs(q);
            const mentorList = snapshot.docs.map(doc => doc.data());
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
        setRequesting(true);
        setConfirmation('');
        try {
            // Create a new session document in Firestore
            await addDoc(collection(db, 'sessions'), {
                mentorId: mentor.uid,
                mentorName: mentor.fullName,
                menteeId: user.uid,
                menteeName: user.fullName,
                participants: [mentor.uid, user.uid],
                topic: 'Micro-mentorship Session',
                time: null, // To be scheduled/rescheduled
                createdAt: new Date(),
                status: 'pending',
            });
            setConfirmation(`Session request sent to ${mentor.fullName}!`);
        } catch (err) {
            setConfirmation('Failed to request session: ' + err.message);
        }
        setRequesting(false);
    };

    const filteredMentors = mentors.filter(m =>
        m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        m.interests?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="container">
            <h2>Find Your Mentor</h2>
            <input
                type="text"
                placeholder="Search by expertise or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                style={{ marginBottom: 16, width: '100%' }}
            />
            {confirmation && <div className="confirmation-message">{confirmation}</div>}
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
                        <Button onClick={() => handleRequestSession(mentor)} disabled={requesting}>
                            Request Session
                        </Button>
                    </Card>
                ))}
            </div>
            <h3>All Mentors</h3>
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
                        <Button onClick={() => handleRequestSession(mentor)} disabled={requesting}>
                            Request Session
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MentorsPage; 