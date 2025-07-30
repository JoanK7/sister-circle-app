import React from 'react';
import { Heart, Users, Calendar, MessageCircle, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const HomePage = ({ setPage }) => {
    const { user } = useAuth();
    const features = [
        { icon: Users, title: 'Find Your Mentor', description: 'Connect with experienced women who share your interests and goals.', color: 'feature-pink' },
        { icon: Calendar, title: 'Schedule Sessions', description: 'Book 15-30 minute micro-mentorship sessions that fit your schedule.', color: 'feature-purple' },
        { icon: MessageCircle, title: 'Community Forum', description: 'Join discussions, ask questions, and share your experiences in a safe space.', color: 'feature-indigo' },
    ];

    return (
        <div>
            <section className="hero-section">
                <div className="container text-center">
                    <div className="hero-content">
                        <div className="hero-icon-wrapper">
                            <Heart className="hero-icon" />
                        </div>
                        <h1 className="hero-title">A safe space for women to grow, together.</h1>
                        <p className="hero-subtitle">Welcome to SisterCircle, a peer learning and micro-mentorship network for African women.</p>
                        <div className="hero-cta">
                            <Button variant="gradient" size="lg" onClick={() => setPage(user ? 'mentors' : 'register')}>
                                Get Started <ArrowRight className="inline-block ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <div className="grid-3">
                        {features.map((feature, index) => (
                            <Card key={index} hover={true} className="feature-card">
                                <div className={`feature-icon-wrapper ${feature.color}`}>
                                    <feature.icon className="feature-icon" />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage; 