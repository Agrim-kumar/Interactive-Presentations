import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { joinSession } from '../utils/api';

const StudentJoin = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) {
            setError('Please enter both your name and session code');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await joinSession(code.toUpperCase(), name);
            sessionStorage.setItem('studentId', data.studentId);
            sessionStorage.setItem('studentName', name);
            navigate(`/student/session/${code.toUpperCase()}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join session. Check your code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Gradient background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                background: isDark
                    ? 'linear-gradient(135deg, #0B1120 0%, #1E1B4B 50%, #312E81 100%)'
                    : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 40%, #A855F7 80%, #C084FC 100%)',
                transition: 'background 0.5s ease',
            }}>
                <div style={{
                    position: 'absolute', width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)',
                    top: '-80px', right: '-80px', borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)',
                    bottom: '-60px', left: '-60px', borderRadius: '50%',
                }} />
            </div>

            {/* Top bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 32px',
            }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/')}
                    style={{ color: 'rgba(255,255,255,0.7)', gap: '6px', padding: '8px 12px' }}
                >
                    ← Back
                </button>
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
                    <div className="toggle-thumb">{isDark ? '🌙' : '☀️'}</div>
                </button>
            </div>

            <div className="page-center" style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', color: 'white', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎓</div>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                    }}>
                        Join a Session
                    </h1>
                    <p style={{ opacity: 0.7, fontSize: '0.95rem', fontWeight: 400, marginTop: '6px' }}>
                        Enter the code from your teacher
                    </p>
                </div>

                <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                    <form onSubmit={handleJoin}>
                        <div className="input-group">
                            <label>Your Name</label>
                            <input
                                className="input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Session Code</label>
                            <input
                                className="input"
                                placeholder="ABC123"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                style={{
                                    fontSize: '1.4rem', textAlign: 'center',
                                    letterSpacing: '8px', fontFamily: "'Outfit', monospace",
                                    fontWeight: 800, padding: '14px',
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: 'var(--radius-xs)',
                                padding: '10px 14px',
                                marginBottom: '16px',
                                color: 'var(--accent-red)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                    Joining...
                                </span>
                            ) : 'Join Session →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentJoin;
