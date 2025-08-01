import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { Users, MessageCircle, AlertTriangle, TrendingUp, Activity, Shield, Eye, EyeOff } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

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
            showNotification('User suspended successfully.');
        } catch (err) {
            showNotification('Failed to suspend user: ' + err.message, 'error');
        }
    };

    const handleReactivateUser = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), { status: 'active' });
            showNotification('User reactivated successfully.');
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

    const stats = [
        {
            title: 'Total Users',
            value: users.length,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100'
        },
        {
            title: 'Active Sessions',
            value: sessions.filter(s => s.status === 'active').length,
            icon: MessageCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100'
        },
        {
            title: 'Reported Posts',
            value: reports.length,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            bgColor: 'from-red-50 to-red-100'
        },
        {
            title: 'Total Sessions',
            value: sessions.length,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100'
        }
    ];

    if (loading) {
        return (
            <div className="container">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {notification && (
                <div className={`notification ${notification.type === 'error' ? 'error' : 'success'}`}>
                    {notification.message}
                </div>
            )}
            
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-600">Monitor and manage the SisterCircle community</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="admin-stat-card">
                        <div className={`w-12 h-12 bg-gradient-to-r ${stat.bgColor} rounded-full flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{stat.title}</h3>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            {stat.value}
                        </p>
                    </Card>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <Button 
                    variant={activeTab === 'overview' ? 'gradient' : 'ghost'}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </Button>
                <Button 
                    variant={activeTab === 'users' ? 'gradient' : 'ghost'}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </Button>
                <Button 
                    variant={activeTab === 'sessions' ? 'gradient' : 'ghost'}
                    onClick={() => setActiveTab('sessions')}
                >
                    Sessions
                </Button>
                <Button 
                    variant={activeTab === 'reports' ? 'gradient' : 'ghost'}
                    onClick={() => setActiveTab('reports')}
                >
                    Reports
                </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            {sessions.slice(0, 5).map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{session.topic}</p>
                                        <p className="text-sm text-gray-500">
                                            {session.mentorName} → {session.menteeName}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        session.status === 'active' ? 'bg-green-100 text-green-700' :
                                        session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {session.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'users' && (
                <Card className="admin-table">
                    <h2 className="text-xl font-semibold mb-4">User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-3 font-semibold">Name</th>
                                    <th className="text-left p-3 font-semibold">Email</th>
                                    <th className="text-left p-3 font-semibold">Role</th>
                                    <th className="text-left p-3 font-semibold">Status</th>
                                    <th className="text-left p-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3">{u.fullName || 'Unknown'}</td>
                                        <td className="p-3">{u.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                u.role === 'mentor' ? 'bg-blue-100 text-blue-700' :
                                                u.role === 'mentee' ? 'bg-green-100 text-green-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {u.role || 'mentee'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                u.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {u.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {u.status === 'suspended' ? (
                                                <Button 
                                                    variant="gradient" 
                                                    size="sm"
                                                    onClick={() => handleReactivateUser(u.id)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Reactivate
                                                </Button>
                                            ) : (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDeactivateUser(u.id)}
                                                >
                                                    <EyeOff className="w-4 h-4 mr-1" />
                                                    Suspend
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'sessions' && (
                <Card className="admin-table">
                    <h2 className="text-xl font-semibold mb-4">Session Logs</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-3 font-semibold">Topic</th>
                                    <th className="text-left p-3 font-semibold">Mentor</th>
                                    <th className="text-left p-3 font-semibold">Mentee</th>
                                    <th className="text-left p-3 font-semibold">Status</th>
                                    <th className="text-left p-3 font-semibold">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(s => (
                                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3">{s.topic}</td>
                                        <td className="p-3">{s.mentorName}</td>
                                        <td className="p-3">{s.menteeName}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                s.status === 'active' ? 'bg-green-100 text-green-700' :
                                                s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'reports' && (
                <Card className="admin-table">
                    <h2 className="text-xl font-semibold mb-4">Reported Forum Posts</h2>
                    {reports.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No reports</h3>
                            <p className="text-gray-500">All forum posts are clean and safe</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left p-3 font-semibold">Author</th>
                                        <th className="text-left p-3 font-semibold">Content</th>
                                        <th className="text-left p-3 font-semibold">Reports</th>
                                        <th className="text-left p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(post => (
                                        <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{post.author}</td>
                                            <td className="p-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">{post.text}</p>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                                    {post.reports?.length || 0} reports
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <Button 
                                                    variant="gradient" 
                                                    size="sm"
                                                    onClick={() => handleResolveReport(post.id)}
                                                >
                                                    Mark Resolved
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default AdminDashboard;