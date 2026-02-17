import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const PARTICLES = ['✦', '◆', '●', '▲', '■', '◇', '○', '△'];

const HomePage = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        setParticles(
            PARTICLES.map((char, i) => ({
                id: i,
                char,
                left: 5 + Math.random() * 90,
                delay: Math.random() * 12,
                duration: 14 + Math.random() * 12,
                size: 10 + Math.random() * 10,
                opacity: 0.08 + Math.random() * 0.12,
            }))
        );
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Background */}
            <div className="hero-bg">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {particles.map((p) => (
                <span
                    key={p.id}
                    className="particle"
                    style={{
                        left: `${p.left}%`,
                        fontSize: `${p.size}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        opacity: p.opacity,
                        color: 'rgba(255,255,255,0.5)',
                    }}
                >
                    {p.char}
                </span>
            ))}

            {/* Top bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 32px',
            }}>
                <span style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem',
                    color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{
                        width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                    }}>📚</span>
                    InteractiveClass
                </span>
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
                    <div className="toggle-thumb">{isDark ? '🌙' : '☀️'}</div>
                </button>
            </div>

            {/* Content */}
            <div className="page-center" style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 16px', borderRadius: 'var(--radius-full)',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)',
                        marginBottom: '24px',
                    }}>
                        ⚡ Real-time Interactive Presentations
                    </div>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: '16px',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                    }}>
                        Present. Engage.<br />
                        <span style={{ background: 'linear-gradient(135deg, #818CF8, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Learn Together.
                        </span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                        color: 'rgba(255,255,255,0.55)',
                        fontWeight: 400,
                        maxWidth: '440px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        Upload slides, add live quizzes, and get real-time responses from your classroom.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    maxWidth: '640px',
                    width: '100%',
                }}>
                    {/* Teacher card */}
                    <div
                        className="glass-card"
                        onClick={() => navigate('/teacher/dashboard')}
                        style={{ cursor: 'pointer', padding: '32px 28px', textAlign: 'center' }}
                    >
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', margin: '0 auto 18px',
                        }}>👩‍🏫</div>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800,
                            color: 'var(--text-primary)', marginBottom: '8px',
                        }}>
                            Teacher
                        </h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
                            Upload presentations, create interactive activities & lead sessions
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%' }}>
                            Open Dashboard →
                        </button>
                    </div>

                    {/* Student card */}
                    <div
                        className="glass-card"
                        onClick={() => navigate('/student/join')}
                        style={{ cursor: 'pointer', padding: '32px 28px', textAlign: 'center' }}
                    >
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'rgba(236, 72, 153, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', margin: '0 auto 18px',
                        }}>🎓</div>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800,
                            color: 'var(--text-primary)', marginBottom: '8px',
                        }}>
                            Student
                        </h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
                            Join a live session with a code & participate in quizzes
                        </p>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>
                            Join Session →
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '48px', textAlign: 'center' }}>
                    <div style={{
                        display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
                        fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500,
                    }}>
                        <span>📊 Real-time Analytics</span>
                        <span>🔒 Session-based Access</span>
                        <span>📱 Mobile-Responsive</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
