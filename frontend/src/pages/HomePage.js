import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Background with classroom image */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
            }}>
                <img
                    src="/classroom-bg.jpg"
                    alt=""
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center',
                    }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(10,14,26,0.5) 0%, rgba(10,14,26,0.65) 40%, rgba(10,14,26,0.85) 100%)',
                }} />
            </div>

            {/* Top Navigation Bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 32px',
            }}>
                <span style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.15rem',
                    color: 'white', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', color: 'white',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </span>
                    Interactive Classroom
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        className="btn btn-hero-outline"
                        onClick={() => navigate('/teacher/dashboard')}
                        style={{ padding: '8px 22px', fontSize: '0.85rem' }}
                    >
                        Start Teaching
                    </button>
                    <button
                        className="btn btn-hero-filled"
                        onClick={() => navigate('/student/join')}
                        style={{ padding: '8px 22px', fontSize: '0.85rem' }}
                    >
                        Start Learning
                    </button>
                </div>
            </div>

            {/* Hero Content */}
            <div className="page-center" style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 900,
                        color: 'white',
                        lineHeight: 1.1,
                        marginBottom: '20px',
                        letterSpacing: '-0.02em',
                    }}>
                        Built for Modern{' '}
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Interactive Learning
                        </span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                        color: 'rgba(255,255,255,0.55)',
                        maxWidth: '580px',
                        margin: '0 auto 48px',
                        lineHeight: 1.7,
                    }}>
                        Real-time interactive presentations, live activities, quizzes, and
                        instant student feedback – <span style={{ color: 'var(--primary-light)' }}>All in one platform.</span>
                    </p>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
                    }}>

                        <button
                            className="btn btn-hero-outline"
                            onClick={() => navigate('/teacher/dashboard')}
                        >
                            Host a Session
                        </button>

                        <button
                            className="btn btn-hero-filled"
                            onClick={() => navigate('/student/join')}
                        >
                            Join the Fun
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    position: 'absolute', bottom: '32px', left: 0, right: 0,
                    textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem',
                }}>
                    Built with <span style={{ color: 'var(--secondary)' }}>&#9829;</span> for interactive learning
                </div>
            </div>
        </div>
    );
};

export default HomePage;
