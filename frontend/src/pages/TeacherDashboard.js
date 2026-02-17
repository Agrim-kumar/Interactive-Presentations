import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
    uploadPresentation,
    getAllPresentations,
    getPresentation,
    addActivity,
    removeActivity,
    deletePresentation,
    createSession,
    getSlideImageUrl,
} from '../utils/api';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { isDark, toggleTheme } = useTheme();

    const [presentations, setPresentations] = useState([]);
    const [selectedPresentation, setSelectedPresentation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [teacherName, setTeacherName] = useState('');
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [showActivityForm, setShowActivityForm] = useState(false);
    const [activityForm, setActivityForm] = useState({
        slideNumber: 1, type: 'mcq', question: '',
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ],
    });

    useEffect(() => { loadPresentations(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadPresentations = async () => {
        try {
            const data = await getAllPresentations();
            setPresentations(data);
        } catch (error) {
            console.error('Error loading:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        setLoading(true);
        setUploadProgress(ext === 'ppt' || ext === 'pptx' ? 'Converting PPT...' : 'Processing...');
        try {
            const formData = new FormData();
            formData.append('presentation', file);
            formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
            const data = await uploadPresentation(formData);
            showToast(`"${data.presentation.title}" uploaded — ${data.presentation.totalSlides} slides`);
            loadPresentations();
            setSelectedPresentation(data.presentation);
        } catch (error) {
            showToast(error.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setLoading(false);
            setUploadProgress('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSelectPresentation = async (id) => {
        try {
            const data = await getPresentation(id);
            setSelectedPresentation(data);
        } catch (error) {
            showToast('Failed to load', 'error');
        }
    };

    const handleDeletePresentation = async (e, id, title) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await deletePresentation(id);
            showToast(`"${title}" deleted`);
            if (selectedPresentation?._id === id) setSelectedPresentation(null);
            loadPresentations();
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    const handleAddActivity = async () => {
        if (!activityForm.question.trim()) { showToast('Enter a question', 'error'); return; }
        try {
            await addActivity(selectedPresentation._id, activityForm);
            showToast('Activity added');
            setShowActivityForm(false);
            const updated = await getPresentation(selectedPresentation._id);
            setSelectedPresentation(updated);
            setActivityForm({
                slideNumber: 1, type: 'mcq', question: '',
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleRemoveActivity = async (activityId) => {
        try {
            await removeActivity(selectedPresentation._id, activityId);
            showToast('Activity removed');
            const updated = await getPresentation(selectedPresentation._id);
            setSelectedPresentation(updated);
        } catch (error) {
            showToast('Failed to remove', 'error');
        }
    };

    const handleStartSession = async () => {
        if (!selectedPresentation) { showToast('Select a presentation', 'error'); return; }
        try {
            const data = await createSession(selectedPresentation._id, teacherName || 'Teacher');
            navigate(`/teacher/present/${data.session.code}`);
        } catch (error) {
            showToast('Failed to create session', 'error');
        }
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...activityForm.options];
        if (field === 'isCorrect') {
            newOptions.forEach((opt, i) => (opt.isCorrect = i === index));
        } else {
            newOptions[index][field] = value;
        }
        setActivityForm({ ...activityForm, options: newOptions });
    };

    const filtered = presentations.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-body)' }}>
            {/* Header */}
            <div className="header">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span className="logo-icon">📚</span>
                    Dashboard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        className="input"
                        placeholder="Your name"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        style={{ width: '140px', padding: '8px 12px', fontSize: '0.85rem' }}
                    />
                    <span className="badge" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', padding: '5px 12px' }}>
                        Teacher
                    </span>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
                        <div className="toggle-thumb">{isDark ? '🌙' : '☀️'}</div>
                    </button>
                </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', height: '100%' }}>

                    {/* Left Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                        {/* Upload */}
                        <div
                            className="upload-area"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ marginBottom: '14px', padding: '20px', flexShrink: 0 }}
                        >
                            <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx" onChange={handleFileUpload} style={{ display: 'none' }} />
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{uploadProgress}</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.4rem' }}>📤</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Upload Presentation</p>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '2px' }}>PDF or PPT • Max 50MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexShrink: 0 }}>
                            <input
                                className="input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontSize: '0.85rem', padding: '9px 14px' }}
                            />
                            <span style={{
                                background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)',
                                padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center',
                            }}>
                                {filtered.length}
                            </span>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '2px' }}>
                            {filtered.map((p) => (
                                <div
                                    key={p._id}
                                    onClick={() => handleSelectPresentation(p._id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 14px', marginBottom: '6px',
                                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                        background: selectedPresentation?._id === p._id ? 'rgba(99,102,241,0.06)' : 'var(--bg-surface)',
                                        border: selectedPresentation?._id === p._id ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                                        transition: 'var(--transition)',
                                    }}
                                    onMouseEnter={(e) => { if (selectedPresentation?._id !== p._id) e.currentTarget.style.borderColor = 'var(--primary-light)'; }}
                                    onMouseLeave={(e) => { if (selectedPresentation?._id !== p._id) e.currentTarget.style.borderColor = 'var(--border)'; }}
                                >
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                                        background: selectedPresentation?._id === p._id ? 'var(--primary)' : 'var(--bg-inset)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                                        color: selectedPresentation?._id === p._id ? 'white' : 'inherit',
                                    }}>
                                        📄
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{
                                            fontSize: '0.875rem', fontWeight: 700,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            color: selectedPresentation?._id === p._id ? 'var(--primary)' : 'var(--text-primary)',
                                        }}>
                                            {p.title}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                                            <span>{p.totalSlides} slides</span>
                                            <span>{p.activities?.length || 0} activities</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => handleDeletePresentation(e, p._id, p.title)}
                                        title="Delete"
                                        style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}

                            {filtered.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
                                    <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{searchQuery ? '🔍' : '📁'}</p>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{searchQuery ? `No results for "${searchQuery}"` : 'No presentations yet'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div style={{ overflow: 'auto', height: '100%', minHeight: 0 }}>
                        {selectedPresentation ? (
                            <div style={{ maxWidth: '800px' }}>
                                <h2 style={{ fontFamily: "'Outfit'", fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
                                    {selectedPresentation.title}
                                </h2>

                                {selectedPresentation.slides?.length > 0 && (
                                    <div className="slide-viewer" style={{ marginBottom: '16px' }}>
                                        <img src={getSlideImageUrl(selectedPresentation.slides[0].imagePath)} alt="Preview" />
                                    </div>
                                )}

                                <button className="btn btn-primary btn-lg" onClick={handleStartSession} style={{ width: '100%', marginBottom: '20px' }}>
                                    Start Live Session →
                                </button>

                                {/* Activities */}
                                <div className="card" style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                        <h3 style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: '0.95rem' }}>
                                            Activities ({selectedPresentation.activities?.length || 0})
                                        </h3>
                                        <button className="btn btn-outline btn-sm" onClick={() => setShowActivityForm(!showActivityForm)}>
                                            {showActivityForm ? 'Cancel' : '+ Add'}
                                        </button>
                                    </div>

                                    {showActivityForm && (
                                        <div style={{
                                            background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)',
                                            padding: '20px', marginBottom: '14px', border: '1px solid var(--border)',
                                        }}>
                                            <div className="input-group">
                                                <label>After Slide #</label>
                                                <input className="input" type="number" min={1} max={selectedPresentation.totalSlides}
                                                    value={activityForm.slideNumber}
                                                    onChange={(e) => setActivityForm({ ...activityForm, slideNumber: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Type</label>
                                                <select className="input" value={activityForm.type}
                                                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}>
                                                    <option value="mcq">Multiple Choice</option>
                                                    <option value="open-ended">Open-ended</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Question</label>
                                                <input className="input" placeholder="Enter question..."
                                                    value={activityForm.question}
                                                    onChange={(e) => setActivityForm({ ...activityForm, question: e.target.value })}
                                                />
                                            </div>
                                            {activityForm.type === 'mcq' && (
                                                <div className="input-group">
                                                    <label>Options (select correct answer)</label>
                                                    {activityForm.options.map((opt, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                                                            <input type="radio" name="correct" checked={opt.isCorrect}
                                                                onChange={() => handleOptionChange(idx, 'isCorrect', true)}
                                                                style={{ accentColor: 'var(--primary)' }}
                                                            />
                                                            <input className="input" placeholder={`Option ${idx + 1}`}
                                                                value={opt.text}
                                                                onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <button className="btn btn-primary" onClick={handleAddActivity} style={{ width: '100%' }}>
                                                Add Activity
                                            </button>
                                        </div>
                                    )}

                                    {selectedPresentation.activities?.map((a) => (
                                        <div key={a._id} className="response-item">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <span className="badge" style={{
                                                        background: a.type === 'mcq' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                                                        color: a.type === 'mcq' ? 'var(--accent-green)' : 'var(--accent-orange)',
                                                    }}>
                                                        {a.type === 'mcq' ? 'MCQ' : 'Open-ended'}
                                                    </span>
                                                    <p style={{ fontWeight: 600, marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Slide {a.slideNumber}</p>
                                                    <p style={{ fontSize: '0.875rem', marginTop: '2px' }}>{a.question}</p>
                                                </div>
                                                <button className="btn-icon" onClick={() => handleRemoveActivity(a._id)}
                                                    style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>✕</button>
                                            </div>
                                        </div>
                                    ))}

                                    {(!selectedPresentation.activities || selectedPresentation.activities.length === 0) && !showActivityForm && (
                                        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '14px', fontSize: '0.85rem' }}>
                                            No activities yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                height: '100%', color: 'var(--text-tertiary)', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.3 }}>📊</div>
                                <p style={{ fontFamily: "'Outfit'", fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                    Select a presentation
                                </p>
                                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>or upload a new one</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
};

export default TeacherDashboard;
