import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ForumPage = ({ setPage }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const fetchPosts = async () => {
            const snapshot = await getDocs(collection(db, 'forumPosts'));
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPosts();
    }, [db]);

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
        // TODO: Implement reporting logic (e.g., add user.uid to post's reports array in Firestore)
        alert('Reported post: ' + postId);
    };

    return (
        <div className="container">
            <h2>Community Forum</h2>
            <div className="forum-new-post">
                <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder="Start a discussion..."
                    className="input-field"
                    style={{ width: '100%', minHeight: 60 }}
                />
                <Button onClick={handleStartDiscussion}>Start Discussion</Button>
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