import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { Copy, Check, ExternalLink, Download, FileText, User } from 'lucide-react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const CodeBlock = ({ content, language }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Prism.highlightAll();
    }, [content]);

    const handleCopy = (e) => {
        e.stopPropagation(); // Prevent opening modal
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'relative', margin: '1rem 0' }} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={handleCopy}
                style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px',
                    padding: '0.4rem', color: '#fff', cursor: 'pointer', zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                }}
            >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre style={{ margin: 0, borderRadius: 'var(--border-radius)', backgroundColor: '#1d1f21', padding: '2rem 1rem 1rem' }}>
                <code className={`language-${language || 'javascript'}`}>
                    {content}
                </code>
            </pre>
        </div>
    );
};

function DevView({ searchQuery }) {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedItem, setExpandedItem] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "uploads"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                const docData = doc.data();

                // Support both old literal schema and new array schema
                if (docData.payloads && docData.payloads.length > 0) {
                    docData.payloads.forEach((p, idx) => {
                        data.push({
                            id: `${doc.id}_${idx}`,
                            subjectName: docData.subjectName,
                            moduleName: docData.moduleName,
                            luNumber: docData.luNumber,
                            contentType: p.contentType,
                            contentSource: p.contentSource,
                            timestamp: docData.timestamp,
                            addedBy: docData.addedBy
                        });
                    });
                } else if (docData.contentSource) {
                    data.push({
                        id: doc.id,
                        ...docData
                    });
                }
            });
            setUploads(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredUploads = uploads.filter(u => {
        const term = searchQuery.toLowerCase();
        return u.subjectName.includes(term) || u.moduleName.includes(term) || u.luNumber.toString().includes(term);
    });

    const renderContent = (item, isExpanded = false) => {
        if (item.contentType === 'code' || item.contentType === 'text') {
            return <CodeBlock content={item.contentSource} language={item.contentType === 'code' ? 'javascript' : 'none'} />;
        }

        if (item.contentSource.includes('youtube.com/embed') || item.contentSource.includes('drive.google.com/file/d/')) {
            return (
                <div style={{ marginTop: '1rem', width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
                    <iframe
                        src={item.contentSource}
                        width="100%" height="100%"
                        frameBorder="0" allowFullScreen
                        style={{ pointerEvents: isExpanded ? 'auto' : 'none' }} // Prevent iframe trapping clicks when small
                    />
                </div>
            );
        }

        const urlLower = item.contentSource.toLowerCase();
        if (urlLower.includes('.pdf') || urlLower.includes('.zip') || urlLower.includes('.ip') || urlLower.includes('.rar')) {
            let ext = 'File';
            if (urlLower.includes('.pdf')) ext = 'PDF Document';
            else if (urlLower.includes('.zip')) ext = 'ZIP Archive';
            else if (urlLower.includes('.ip')) ext = 'IP File';
            else if (urlLower.includes('.rar')) ext = 'RAR Archive';

            return (
                <div style={{ marginTop: '1rem' }}>
                    <a href={item.contentSource} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Download {ext}
                    </a>
                </div>
            );
        }

        return (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#1d1f21', borderRadius: 'var(--border-radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={item.contentSource} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <ExternalLink size={16} /> {item.contentSource}
                </a>
                <button
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.contentSource); }}
                    className="btn btn-ghost" style={{ padding: '0.5rem' }} title="Copy URL"
                >
                    <Copy size={16} />
                </button>
            </div>
        );
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Decrypting Database...</div>;

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {filteredUploads.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <h3>No records found matching "{searchQuery}"</h3>
                    </div>
                ) : (
                    filteredUploads.map(item => (
                        <div
                            key={item.id}
                            className="card"
                            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                            onClick={() => setExpandedItem(item)}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                            <div style={{ paddingRight: '4rem', marginBottom: '1rem' }}>
                                <h3 style={{ textTransform: 'capitalize', marginBottom: '0.25rem' }}>{item.subjectName}</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                    Module: {item.moduleName}
                                </div>
                            </div>
                            <div className="badge" style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                lineHeight: '1.2',
                                padding: 0
                            }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>LU</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{item.luNumber}</span>
                            </div>

                            <div style={{ flex: 1, maxHeight: '200px', overflow: 'hidden', position: 'relative' }}>
                                {renderContent(item, false)}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--surface-color))', pointerEvents: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0 0', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    <User size={16} /> <span style={{ textTransform: 'capitalize' }}>{item.addedBy || 'Anonymous'}</span>
                                </div>
                                <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>
                                    Expand for details &rarr;
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Expanded Modal */}
            {expandedItem && (
                <div className="modal-overlay" onClick={() => setExpandedItem(null)}>
                    <div
                        className="modal-content animate-fade-in"
                        style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={() => setExpandedItem(null)}>
                            <FileText size={24} style={{ display: 'none' }} /> {/* Dummy icon to fix import warning, using native X below */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingRight: '2rem' }}>
                            <div>
                                <h1 style={{ textTransform: 'capitalize', marginBottom: '0.25rem', fontSize: '2rem' }}>{expandedItem.subjectName}</h1>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', textTransform: 'capitalize' }}>
                                    Module: {expandedItem.moduleName}
                                </div>
                            </div>
                            <div className="badge" style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                lineHeight: '1.2',
                                padding: 0
                            }}>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>LU</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{expandedItem.luNumber}</span>
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {renderContent(expandedItem, true)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DevView;
