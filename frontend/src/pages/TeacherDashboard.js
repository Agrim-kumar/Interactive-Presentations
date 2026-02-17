import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [presentations, setPresentations] = useState([]);
    const [selectedPresentation, setSelectedPresentation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
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
            const data = await createSession(selectedPresentation._id, 'Teacher');
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
                    <span className="logo-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </span>
                    Interactive Classroom
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        className="input"
                        placeholder="Search presentations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '200px', padding: '7px 14px', fontSize: '0.85rem', background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
                    />
                    <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ fontSize: '0.85rem' }}>
                        Home
                    </button>
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div className="dashboard-layout">
                {/* Left Sidebar - File List */}
                <div className="dashboard-sidebar">
                    <div className="dashboard-sidebar-header">
                        <h3>
                            <span style={{ fontSize: '0.9rem' }}>📁</span>
                             UPLOAD PDF OR PPT
                        </h3>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: 'var(--primary)', border: 'none', color: 'white',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1rem', fontWeight: 700,
                            }}
                        >
                            +
                        </button>
                        <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </div>

                    {loading && (
                        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{uploadProgress}</span>
                        </div>
                    )}

                    <div className="dashboard-sidebar-search">
                        <input
                            className="input"
                            placeholder="Filter files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                        />
                    </div>

                    <div className="dashboard-file-list">
                        {filtered.map((p) => (
                            <div
                                key={p._id}
                                className={`dashboard-file-item ${selectedPresentation?._id === p._id ? 'active' : ''}`}
                                onClick={() => handleSelectPresentation(p._id)}
                            >
                                <div className="file-info">
                                    <h4>{p.title}</h4>
                                    <div className="file-meta">
                                        <span>{p.totalSlides} slides</span>
                                        <span>{p.activities?.length || 0} nodes</span>
                                    </div>
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={(e) => handleDeletePresentation(e, p._id, p.title)}
                                    title="Delete"
                                    style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-red)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                                >
                                    🗑
                                </button>
                            </div>
                        ))}

                        {filtered.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '8px', opacity: 0.4 }}>{searchQuery ? '🔍' : '📁'}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                    {searchQuery ? `No results for "${searchQuery}"` : 'No presentations yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center - Preview Area */}
                <div className="dashboard-main">
                    {selectedPresentation ? (
                        <div style={{ width: '100%', maxWidth: '800px' }}>
                            <h2 style={{
                                fontFamily: "'Outfit'", fontSize: '1.2rem', fontWeight: 800,
                                marginBottom: '16px', color: 'var(--text-primary)',
                            }}>
                                {selectedPresentation.title}
                            </h2>

                            {selectedPresentation.slides?.length > 0 && (
                                <div className="slide-viewer" style={{ marginBottom: '16px' }}>
                                    <img src={getSlideImageUrl(selectedPresentation.slides[0].imagePath)} alt="Preview" />
                                </div>
                            )}

                            <button className="btn btn-primary btn-lg" onClick={handleStartSession} style={{ width: '100%', marginBottom: '20px' }}>
                                Start Live Session
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div className="preview-placeholder">Classroom</div>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '8px' }}>
                                Select a presentation to preview
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Interaction Tools */}
                <div className="dashboard-tools">
                    <div className="dashboard-tools-header">
                        <span style={{ fontSize: '0.9rem' }}>&#9881;</span>
                        INTERACTION TOOLS
                    </div>

                    {selectedPresentation ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h3 style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                    Activities ({selectedPresentation.activities?.length || 0})
                                </h3>
                                <button className="btn btn-outline btn-sm" onClick={() => setShowActivityForm(!showActivityForm)}>
                                    {showActivityForm ? 'Cancel' : '+ Add'}
                                </button>
                            </div>

                            {showActivityForm && (
                                <div style={{
                                    background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)',
                                    padding: '16px', marginBottom: '14px', border: '1px solid var(--border)',
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
                                            <p style={{ fontWeight: 600, marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Slide {a.slideNumber}</p>
                                            <p style={{ fontSize: '0.85rem', marginTop: '2px' }}>{a.question}</p>
                                        </div>
                                        <button className="btn-icon" onClick={() => handleRemoveActivity(a._id)}
                                            style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>&#10005;</button>
                                    </div>
                                </div>
                            ))}

                            {(!selectedPresentation.activities || selectedPresentation.activities.length === 0) && !showActivityForm && (
                                <div className="configured-nodes">
                                    <h4>CONFIGURED NODES</h4>
                                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', fontSize: '0.82rem' }}>
                                        No interaction nodes added yet. Use the Right Toolset.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
                            <p style={{ fontSize: '0.85rem' }}>
                                Select a presentation to Configure interaction tools.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
};

export default TeacherDashboard;
