import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSession, getSlideImageUrl } from '../utils/api';

const StudentSession = () => {
    const { sessionCode } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { isDark, toggleTheme } = useTheme();

    const [session, setSession] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeActivity, setActiveActivity] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [sessionEnded, setSessionEnded] = useState(false);
    const [loading, setLoading] = useState(true);

    const studentId = sessionStorage.getItem('studentId');
    const studentName = sessionStorage.getItem('studentName');
    const presentation = session?.presentation;
    const slides = presentation?.slides || [];

    useEffect(() => {
        const loadSession = async () => {
            try {
                const data = await getSession(sessionCode);
                setSession(data);
                setCurrentSlide(data.currentSlide || 0);
                setLoading(false);
            } catch (error) {
                navigate('/student/join');
            }
        };
        loadSession();
    }, [sessionCode, navigate]);

    useEffect(() => {
        if (socket && session && studentId) {
            socket.emit('join-session', { sessionCode, studentId, studentName, role: 'student' });
        }
    }, [socket, session, sessionCode, studentId, studentName]);

    useEffect(() => {
        if (!socket) return;
        const onSlideUpdated = ({ slideIndex }) => {
            setCurrentSlide(slideIndex);
            setActiveActivity(null);
            setSelectedAnswer(null);
            setTextAnswer('');
            setHasSubmitted(false);
            setResults(null);
        };
        const onActivityStarted = ({ activity }) => {
            setActiveActivity(activity);
            setSelectedAnswer(null);
            setTextAnswer('');
            setHasSubmitted(false);
            setResults(null);
        };
        const onActivityEnded = () => {
            setActiveActivity(null);
            setSelectedAnswer(null);
            setTextAnswer('');
            setHasSubmitted(false);
            setResults(null);
        };
        const onResultsRevealed = ({ results: r }) => setResults(r);
        const onSessionEnded = () => setSessionEnded(true);

        socket.on('slide-updated', onSlideUpdated);
        socket.on('activity-started', onActivityStarted);
        socket.on('activity-ended', onActivityEnded);
        socket.on('results-revealed', onResultsRevealed);
        socket.on('session-ended', onSessionEnded);
        return () => {
            socket.off('slide-updated', onSlideUpdated);
            socket.off('activity-started', onActivityStarted);
            socket.off('activity-ended', onActivityEnded);
            socket.off('results-revealed', onResultsRevealed);
            socket.off('session-ended', onSessionEnded);
        };
    }, [socket]);

    const handleSubmitMCQ = (idx) => {
        if (hasSubmitted) return;
        setSelectedAnswer(idx);
        socket?.emit('submit-answer', {
            sessionCode, studentId, studentName,
            activityId: activeActivity._id,
            answer: String(idx),
            isCorrect: activeActivity.options[idx]?.isCorrect || false,
        });
        setHasSubmitted(true);
    };

    const handleSubmitOpenEnded = () => {
        if (hasSubmitted || !textAnswer.trim()) return;
        socket?.emit('submit-answer', {
            sessionCode, studentId, studentName,
            activityId: activeActivity._id,
            answer: textAnswer,
            isCorrect: null,
        });
        setHasSubmitted(true);
    };

    if (sessionEnded) {
        return (
            <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
                <div className="hero-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>
                <div className="page-center" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="glass-card" style={{ textAlign: 'center', maxWidth: '420px', padding: '48px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎉</div>
                        <h1 style={{ fontFamily: "'Outfit'", fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>
                            Session Over!
                        </h1>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>
                            Great job, {studentName}!
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-center">
                <div className="loading-container">
                    <div className="spinner" />
                    <p>Joining session...</p>
                </div>
            </div>
        );
    }

    // Activity overlay
    if (activeActivity) {
        return (
            <div className="activity-overlay">
                <div className="activity-card">
                    {results ? (
                        <div>
                            <h2 style={{ marginBottom: '16px' }}>📊 Results</h2>
                            {results.type === 'mcq' ? (
                                <div>
                                    {Object.entries(results.options).map(([idx, opt]) => {
                                        const pct = results.totalResponses > 0 ? Math.round((opt.count / results.totalResponses) * 100) : 0;
                                        return (
                                            <div key={idx} style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                    <span style={{ fontWeight: 600 }}>{opt.isCorrect && '✓ '}{opt.text}</span>
                                                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{opt.count} ({pct}%)</span>
                                                </div>
                                                <div className="result-bar">
                                                    <div className="result-bar-fill" style={{
                                                        width: `${pct}%`,
                                                        background: opt.isCorrect ? 'var(--accent-green)' : 'var(--primary)',
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasSubmitted && (
                                        <div style={{
                                            marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-sm)',
                                            background: activeActivity.options[parseInt(selectedAnswer)]?.isCorrect
                                                ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                            textAlign: 'center', fontWeight: 700, fontSize: '0.9rem',
                                            color: activeActivity.options[parseInt(selectedAnswer)]?.isCorrect
                                                ? 'var(--accent-green)' : 'var(--accent-red)',
                                        }}>
                                            {activeActivity.options[parseInt(selectedAnswer)]?.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                                        {results.answers?.length || 0} responses
                                    </p>
                                    {results.answers?.slice(0, 6).map((a, idx) => (
                                        <div key={idx} className="response-item">
                                            <span className="student-name">{a.name}</span>
                                            <p className="answer-text">{a.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : hasSubmitted ? (
                        <div className="waiting-state">
                            <div className="emoji">✓</div>
                            <h2>Submitted!</h2>
                            <p style={{ color: 'var(--text-tertiary)' }}>Waiting for results...</p>
                        </div>
                    ) : (
                        <div>
                            <h2>{activeActivity.type === 'mcq' ? 'Quiz' : 'Question'}</h2>
                            <p className="question">{activeActivity.question}</p>
                            {activeActivity.type === 'mcq' ? (
                                <div className="mcq-options">
                                    {activeActivity.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            className={`mcq-option ${selectedAnswer === idx ? 'selected' : ''}`}
                                            onClick={() => handleSubmitMCQ(idx)}
                                        >
                                            <span style={{
                                                width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                                                background: selectedAnswer === idx ? 'rgba(255,255,255,0.2)' : 'var(--bg-inset)',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                marginRight: '12px', fontWeight: 700, fontSize: '0.8rem',
                                            }}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="open-answer">
                                    <textarea
                                        placeholder="Type your answer..."
                                        value={textAnswer}
                                        onChange={(e) => setTextAnswer(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleSubmitOpenEnded}
                                        disabled={!textAnswer.trim()}
                                        style={{ width: '100%', marginTop: '12px' }}
                                    >
                                        Submit →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Normal slide view
    return (
        <div>
            <div className="header">
                <div className="logo">
                    <span className="logo-icon">📚</span>
                    {session?.teacherName}'s Class
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        🎓 {studentName}
                    </span>
                    <span className="badge badge-connected">Connected</span>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
                        <div className="toggle-thumb">{isDark ? '🌙' : '☀️'}</div>
                    </button>
                </div>
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 'calc(100vh - 56px)', padding: '24px', background: 'var(--bg-body)',
            }}>
                <div style={{ width: '100%', maxWidth: '960px' }}>
                    <div className="slide-viewer">
                        {slides[currentSlide] ? (
                            <img src={getSlideImageUrl(slides[currentSlide].imagePath)} alt={`Slide ${currentSlide + 1}`} />
                        ) : (
                            <div className="waiting-state" style={{ height: '100%' }}>
                                <div className="emoji">📺</div>
                                <h2>Waiting for teacher...</h2>
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '14px' }}>
                        <span className="slide-counter">Slide {currentSlide + 1} / {slides.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSession;
