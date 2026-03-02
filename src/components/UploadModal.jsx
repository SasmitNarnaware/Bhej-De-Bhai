import React from 'react';
import { useState } from 'react';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

function UploadModal({ onClose }) {
    const [formData, setFormData] = useState({
        subjectName: '',
        moduleName: '',
        luNumber: '',
        addedBy: ''
    });

    const [payloads, setPayloads] = useState([
        { id: Date.now(), type: 'url', source: '', file: null }
    ]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddPayload = () => {
        if (payloads.length >= 4) return;
        setPayloads([...payloads, { id: Date.now(), type: 'url', source: '', file: null }]);
    };

    const handleRemovePayload = (id) => {
        if (payloads.length <= 1) return;
        setPayloads(payloads.filter(p => p.id !== id));
    };

    const updatePayload = (id, field, value) => {
        setPayloads(payloads.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validPayloads = payloads.filter(p => (p.type === 'file' && p.file) || (p.type !== 'file' && p.source.trim()));
        if (validPayloads.length === 0) {
            setError("You must provide at least 1 valid payload.");
            return;
        }

        setLoading(true);

        try {
            // 1. Duplicate Check Logic
            // const q = query(
            //   collection(db, "uploads"),
            //   where("subjectName", "==", formData.subjectName.toLowerCase()),
            //   where("moduleName", "==", formData.moduleName.toLowerCase()),
            //   where("luNumber", "==", formData.luNumber)
            // );
            // const querySnapshot = await getDocs(q);

            // if (!querySnapshot.empty) {
            //   setError("This LU is already documented!");
            //   setLoading(false);
            //   return;
            // }

            // Mock duplicate check for now since we don't have db connection
            // if (formData.luNumber === '1.1' && formData.subjectName.toLowerCase() === 'math') {
            //     setError("This LU is already documented!");
            //     setLoading(false);
            //     return;
            // }

            const finalPayloads = [];

            for (const p of validPayloads) {
                let finalSource = p.source;
                if (p.type === 'file' && p.file) {
                    const fileRef = ref(storage, `uploads/${Date.now()}_${p.file.name}`);
                    const snapshot = await uploadBytes(fileRef, p.file);
                    finalSource = await getDownloadURL(snapshot.ref);
                }
                finalPayloads.push({ contentType: p.type, contentSource: finalSource });
            }

            // 2. Upload Logic
            await addDoc(collection(db, "uploads"), {
                ...formData,
                payloads: finalPayloads, // Changed schema to support array
                subjectName: formData.subjectName.toLowerCase(),
                moduleName: formData.moduleName.toLowerCase(),
                timestamp: new Date()
            });

            console.log("Uploaded Payloads:", finalPayloads);
            alert(`Successfully Added ${finalPayloads.length} Payload(s)!`);
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade-in">
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <UploadCloud className="text-red" />
                    Transmit Payload
                </h2>

                {error && (
                    <div style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderLeft: '4px solid var(--error-color)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertCircle color="var(--error-color)" size={20} />
                        <span style={{ color: 'var(--error-color)', fontWeight: 600 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Uploader Name</label>
                        <input
                            type="text"
                            className="input"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.addedBy}
                            onChange={(e) => setFormData({ ...formData, addedBy: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subject Name</label>
                        <input
                            type="text"
                            className="input"
                            required
                            placeholder="e.g. Data Structures"
                            value={formData.subjectName}
                            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Module Name</label>
                            <input
                                type="text"
                                className="input"
                                required
                                placeholder="e.g. Trees"
                                value={formData.moduleName}
                                onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                            />
                        </div>
                        <div style={{ width: '120px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>LU Number</label>
                            <input
                                type="number"
                                step="0.1"
                                className="input"
                                required
                                placeholder="1.1"
                                value={formData.luNumber}
                                onChange={(e) => setFormData({ ...formData, luNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Payloads List */}
                    <div style={{ padding: '1rem', backgroundColor: 'var(--surface-color-light)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', margin: 0 }}>Payload Content ({payloads.length}/4)</label>
                            {payloads.length < 4 && (
                                <button type="button" onClick={handleAddPayload} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}>
                                    + Add Item
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {payloads.map((payload, index) => (
                                <div key={payload.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--primary-color)', position: 'relative' }}>

                                    {payloads.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePayload(payload.id)}
                                            style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', padding: '0.2rem' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ width: '150px' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>Type</label>
                                            <select
                                                className="input"
                                                value={payload.type}
                                                onChange={(e) => updatePayload(payload.id, 'type', e.target.value)}
                                            >
                                                <option value="url">Link</option>
                                                <option value="code">Code Snippet</option>
                                                <option value="text">Raw Text</option>
                                                <option value="file">Upload File</option>
                                            </select>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>
                                                {payload.type === 'file' ? 'Select File' : 'Source'}
                                            </label>

                                            {payload.type === 'url' && (
                                                <input
                                                    type="url"
                                                    className="input"
                                                    required
                                                    placeholder="https://..."
                                                    value={payload.source}
                                                    onChange={(e) => updatePayload(payload.id, 'source', e.target.value)}
                                                />
                                            )}

                                            {(payload.type === 'text' || payload.type === 'code') && (
                                                <textarea
                                                    className="input"
                                                    rows="2"
                                                    required
                                                    placeholder={payload.type === 'code' ? 'Code...' : 'Text...'}
                                                    value={payload.source}
                                                    onChange={(e) => updatePayload(payload.id, 'source', e.target.value)}
                                                    style={{ resize: 'vertical' }}
                                                />
                                            )}

                                            {payload.type === 'file' && (
                                                <input
                                                    type="file"
                                                    className="input"
                                                    required={!payload.file}
                                                    accept=".pdf,.zip,.ip,.rar,application/pdf,application/zip"
                                                    onChange={(e) => updatePayload(payload.id, 'file', e.target.files[0])}
                                                    style={{ padding: '0.4rem' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Deploy to Network'}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default UploadModal;
