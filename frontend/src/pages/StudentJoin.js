import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinSession } from '../utils/api';

const StudentJoin = () => {
    const navigate = useNavigate();
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
                    background: 'rgba(10,14,26,0.7)',
                }} />
            </div>

            {/* Top bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 32px',
            }}>
                <button
                    className="btn-back"
                    onClick={() => navigate('/')}
                >
                    &#8592; Back
                </button>
            </div>

            <div className="page-center" style={{ position: 'relative', zIndex: 2 }}>
                <div className="glass-card" style={{
                    width: '100%', maxWidth: '420px', padding: '40px 36px', textAlign: 'center',
                }}>
                    {/* Icon */}
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', fontSize: '1.5rem',
                    }}>
                        &#10024;
                    </div>

                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1.6rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        marginBottom: '6px',
                    }}>
                        Join Session
                    </h1>
                    <p style={{
                        color: 'var(--text-tertiary)',
                        fontSize: '0.9rem',
                        marginBottom: '28px',
                    }}>
                        Enter your details to get started
                    </p>

                    <form onSubmit={handleJoin}>
                        <div className="input-group" style={{ textAlign: 'left' }}>
                            <label>YOUR NAME</label>
                            <input
                                className="input"
                                placeholder="How should we call you?"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="input-group" style={{ textAlign: 'left' }}>
                            <label>SESSION CODE</label>
                            <input
                                className="input"
                                placeholder="* * * * * *"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                style={{
                                    fontSize: '1.3rem', textAlign: 'center',
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
                                textAlign: 'left',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'white',
                                color: 'var(--primary)',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                    Joining...
                                </span>
                            ) : 'JOIN SESSION'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentJoin;
