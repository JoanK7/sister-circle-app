import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Flag, Clock, User } from 'lucide-react';

const ForumPage = ({ setPage }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const snapshot = await getDocs(collection(db, 'forumPosts'));
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPosts();
    }, [db]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleStartDiscussion = async () => {
        if (!newPost.trim()) return;
        await addDoc(collection(db, 'forumPosts'), {
            text: newPost,
            author: user?.fullName || 'Anonymous',
            authorId: user?.uid,
            createdAt: Date.now(),
            reports: []
        });
        setNewPost('');
        // Refresh posts
        const snapshot = await getDocs(collection(db, 'forumPosts'));
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleReport = async (postId) => {
        if (!user) return;
        try {
            const postRef = doc(db, 'forumPosts', postId);
            await updateDoc(postRef, {
                reports: arrayUnion(user.uid)
            });
            showNotification('Post reported. Thank you for helping keep the community safe!');
        } catch (err) {
            showNotification('Failed to report post: ' + err.message, 'error');
        }
    };

    // Mock data for demonstration - replace with real data
    const mockPosts = [
        {
            id: '1',
            text: 'How to balance work and family life?',
            author: 'Sarah M.',
            createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
            replies: 12,
            tags: ['Work-Life Balance', 'Motherhood']
        },
        {
            id: '2',
            text: 'Starting a business with limited capital',
            author: 'Aisha K.',
            createdAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
            replies: 8,
            tags: ['Business', 'Entrepreneurship']
        }
    ];

    return (
        <div className="container">
            {notification && (
                <div className={`notification ${notification.type === 'error' ? 'error' : 'success'}`}>
                    {notification.message}
                </div>
            )}
            
            <h2 className="text-3xl font-bold mb-6">Community Forum</h2>
            
            <div className="forum-new-post mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">Start a Discussion</h3>
                </div>
                <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder="Share your thoughts, ask questions, or start a meaningful discussion..."
                    className="input-field"
                    rows="4"
                    style={{ width: '100%', minHeight: 80 }}
                />
                <div className="mt-4">
                    <Button onClick={handleStartDiscussion} variant="gradient" className="w-full">
                        Start Discussion
                    </Button>
                </div>
            </div>
            
            <div className="forum-posts">
                {posts.length > 0 ? posts.map(post => (
                    <Card key={post.id} className="mb-4" hover>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{post.author}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{post.replies || 0} replies</span>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handleReport(post.id)} 
                                variant="ghost" 
                                size="sm"
                                className="text-gray-500 hover:text-red-500"
                            >
                                <Flag className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">{post.text}</h4>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {post.tags?.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                                Read more →
                            </Button>
                        </div>
                    </Card>
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No discussions yet</h3>
                        <p className="text-gray-500 mb-4">Be the first to start a meaningful conversation</p>
                        <Button onClick={() => document.querySelector('textarea').focus()} variant="gradient">
                            Start First Discussion
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForumPage; 