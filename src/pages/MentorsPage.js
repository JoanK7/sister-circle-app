import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Star, MapPin, Clock } from 'lucide-react';

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

    // Mock data for demonstration - replace with real data
    const mockMentors = [
        {
            id: '1',
            fullName: 'Amina Hassan',
            location: 'Nairobi, Kenya',
            bio: 'Business consultant with 8 years experience helping women start and grow their businesses.',
            interests: ['Business', 'Leadership', 'Entrepreneurship'],
            availability: 'Weekdays 2-6 PM',
            rating: 4.9,
            sessions: 45
        },
        {
            id: '2',
            fullName: 'Grace Uwimana',
            location: 'Kigali, Rwanda',
            bio: 'Tech professional with expertise in software development and career transitions.',
            interests: ['Tech Careers', 'Programming', 'Career Change'],
            availability: 'Evenings & weekends',
            rating: 4.8,
            sessions: 32
        },
        {
            id: '3',
            fullName: 'Fatima Okonkwo',
            location: 'Lagos, Nigeria',
            bio: 'Life coach specializing in work-life balance and mental health for women.',
            interests: ['Motherhood', 'Work-Life Balance', 'Mental Health'],
            availability: 'Flexible hours',
            rating: 5.0,
            sessions: 28
        }
    ];

    return (
        <div className="container">
            <h2 className="text-3xl font-bold mb-6">Find Your Mentor</h2>
            
            {/* Search and Filter Section */}
            <div className="mb-8">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by expertise, name, or bio..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-10"
                        style={{ width: '100%' }}
                    />
                </div>
                
                {/* Interest Filter */}
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <label className="input-label mb-0">Filter by Interest:</label>
                    <select
                        value={selectedInterest}
                        onChange={e => setSelectedInterest(e.target.value)}
                        className="input-field"
                        style={{ width: 'auto' }}
                    >
                        <option value="">All Interests</option>
                        {allInterests.map(interest => (
                            <option key={interest} value={interest}>{interest}</option>
                        ))}
                    </select>
                </div>
            </div>

            {confirmation && <div className="confirmation-message">{confirmation}</div>}
            
            <h3 className="text-xl font-semibold mb-4">Suggested Matches</h3>
            <div className="grid-3 mb-8">
                {suggested.map(mentor => (
                    <Card key={mentor.uid} className="mentor-card" hover>
                        <div className="mentor-avatar">
                            {mentor.fullName?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        
                        <h4 className="text-lg font-bold mb-1">{mentor.fullName}</h4>
                        
                        <div className="flex items-center gap-1 mb-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{mentor.location}</span>
                        </div>
                        
                        <div className="mentor-rating mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{mentor.rating || 4.5}</span>
                            <span className="text-gray-500 ml-1">{mentor.sessions || 0} sessions</span>
                        </div>
                        
                        <p className="text-gray-700 mb-3 text-sm">{mentor.bio}</p>
                        
                        <div className="mentor-expertise">
                            {mentor.interests?.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                        
                        <div className="mentor-availability">
                            <Clock className="w-4 h-4" />
                            <span>{mentor.availability}</span>
                        </div>
                        
                        <Button 
                            onClick={() => handleRequestSession(mentor)} 
                            disabled={requesting} 
                            variant="gradient"
                            className="w-full mt-4"
                        >
                            {requesting ? 'Sending...' : 'Request Session'}
                        </Button>
                    </Card>
                ))}
            </div>
            
            <h3 className="text-xl font-semibold mb-4">All Mentors ({filteredMentors.length})</h3>
            <div className="grid-3">
                {filteredMentors.length > 0 ? filteredMentors.map(mentor => (
                    <Card key={mentor.uid} className="mentor-card" hover>
                        <div className="mentor-avatar">
                            {mentor.fullName?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        
                        <h4 className="text-lg font-bold mb-1">{mentor.fullName}</h4>
                        
                        <div className="flex items-center gap-1 mb-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{mentor.location}</span>
                        </div>
                        
                        <div className="mentor-rating mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{mentor.rating || 4.5}</span>
                            <span className="text-gray-500 ml-1">{mentor.sessions || 0} sessions</span>
                        </div>
                        
                        <p className="text-gray-700 mb-3 text-sm">{mentor.bio}</p>
                        
                        <div className="mentor-expertise">
                            {mentor.interests?.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                        
                        <div className="mentor-availability">
                            <Clock className="w-4 h-4" />
                            <span>{mentor.availability}</span>
                        </div>
                        
                        <Button 
                            onClick={() => handleRequestSession(mentor)} 
                            disabled={requesting} 
                            variant="gradient"
                            className="w-full mt-4"
                        >
                            {requesting ? 'Sending...' : 'Request Session'}
                        </Button>
                    </Card>
                )) : (
                    <div className="text-center py-8 col-span-full">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No mentors found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
                        <Button onClick={() => { setSearch(''); setSelectedInterest(''); }} variant="ghost">
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorsPage;