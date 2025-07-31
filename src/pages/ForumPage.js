import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

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

    return (
        <div className="container">
            {notification && (
                <div className={`notification ${notification.type === 'error' ? 'error' : 'success'}`}>
                    {notification.message}
                </div>
            )}
            <h2>Community Forum</h2>
            <div className="forum-new-post">
                <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder="Start a discussion..."
                    className="input-field"
                    style={{ width: '100%', minHeight: 60 }}
                />
                <Button onClick={handleStartDiscussion} variant="gradient">Start Discussion</Button>
            </div>
            <div className="forum-posts">
                {posts.map(post => (
                    <Card key={post.id} hover>
                        <div><b>{post.author}</b> <span style={{ color: '#888', fontSize: 12 }}>{new Date(post.createdAt).toLocaleString()}</span></div>
                        <div>{post.text}</div>
                        <Button variant="ghost" onClick={() => handleReport(post.id)}>Report</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ForumPage; 