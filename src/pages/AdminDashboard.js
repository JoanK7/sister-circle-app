import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where, onSnapshot } from 'firebase/firestore';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Real-time users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        // Real-time sessions
        const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        // Real-time forum reports
        const unsubReports = onSnapshot(collection(db, 'forumPosts'), (snapshot) => {
            setReports(snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(post => post.reports && post.reports.length > 0)
            );
        });
        setLoading(false);
        return () => {
            unsubUsers();
            unsubSessions();
            unsubReports();
        };
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDeactivateUser = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), { status: 'suspended' });
            showNotification('User suspended.');
        } catch (err) {
            showNotification('Failed to suspend user: ' + err.message, 'error');
        }
    };

    const handleReactivateUser = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), { status: 'active' });
            showNotification('User reactivated.');
        } catch (err) {
            showNotification('Failed to reactivate user: ' + err.message, 'error');
        }
    };

    const handleResolveReport = async (postId) => {
        try {
            await updateDoc(doc(db, 'forumPosts', postId), { reports: [] });
            showNotification('Report marked as resolved.');
        } catch (err) {
            showNotification('Failed to resolve report: ' + err.message, 'error');
        }
    };

    return (
        <div className="admin-dashboard">
            {notification && (
                <div className={`notification ${notification.type === 'error' ? 'error' : 'success'}`}>{notification.message}</div>
            )}
            <h1>Admin Dashboard</h1>
            {loading ? <p>Loading...</p> : (
                <>
                    <div className="admin-stats">
                        <Card className="admin-stat-card">
                            <h3>Total Users</h3>
                            <p style={{ fontSize: 24, fontWeight: 700 }}>{users.length}</p>
                        </Card>
                        <Card className="admin-stat-card">
                            <h3>Active Sessions</h3>
                            <p style={{ fontSize: 24, fontWeight: 700 }}>{sessions.length}</p>
                        </Card>
                        <Card className="admin-stat-card">
                            <h3>Reported Posts</h3>
                            <p style={{ fontSize: 24, fontWeight: 700 }}>{reports.length}</p>
                        </Card>
                    </div>

                    <h2>Users</h2>
                    <div className="admin-table" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.fullName}</td>
                                        <td>{u.email}</td>
                                        <td>{u.role}</td>
                                        <td>{u.status || 'active'}</td>
                                        <td>
                                            {u.status === 'suspended' ? (
                                                <Button variant="gradient" onClick={() => handleReactivateUser(u.id)}>Reactivate</Button>
                                            ) : (
                                                <Button variant="ghost" onClick={() => handleDeactivateUser(u.id)}>Suspend</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2>Session Logs</h2>
                    <div className="admin-table" style={{ overflowX: 'auto', marginBottom: 32 }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Topic</th>
                                    <th>Mentor</th>
                                    <th>Mentee</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.topic}</td>
                                        <td>{s.mentorName}</td>
                                        <td>{s.menteeName}</td>
                                        <td>{s.status}</td>
                                        <td>{s.time ? new Date(s.time).toLocaleString() : 'Not scheduled'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2>Reported Forum Posts</h2>
                    <div className="admin-table" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Author</th>
                                    <th>Text</th>
                                    <th>Reports</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(post => (
                                    <tr key={post.id}>
                                        <td>{post.author}</td>
                                        <td>{post.text}</td>
                                        <td>{post.reports?.length || 0}</td>
                                        <td>
                                            <Button variant="gradient" onClick={() => handleResolveReport(post.id)}>Mark as Resolved</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;