import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowUp, Send, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function ShadowForum() {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [ghostId, setGhostId] = useState('');
    const [loading, setLoading] = useState(true);

    const [activeThread, setActiveThread] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [upvotedItems, setUpvotedItems] = useState(new Set());

    // Initialize random session ID
    useEffect(() => {
        let currentId = sessionStorage.getItem('sh_ghost_id');
        if (!currentId) {
            currentId = `Ghost_${Math.floor(Math.random() * 9000) + 1000}`;
            sessionStorage.setItem('sh_ghost_id', currentId);
        }
        setGhostId(currentId);
    }, []);

    // Fetch posts
    useEffect(() => {
        const q = query(collection(db, 'forum_posts'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() || new Date() });
            });
            setPosts(data);

            // Re-sync active thread if currently viewing one
            if (activeThread) {
                const updatedThread = data.find(p => p.id === activeThread.id);
                if (updatedThread) setActiveThread(updatedThread);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [activeThread?.id]);

    const handleUpvote = async (id, currentVotes, isComment = false) => {
        const hasUpvoted = upvotedItems.has(id);
        const voteChange = hasUpvoted ? -1 : 1;

        if (isComment && activeThread) {
            const updatedReplies = activeThread.replies.map(r => r.id === id ? { ...r, upvotes: r.upvotes + voteChange } : r);
            const ref = doc(db, "forum_posts", activeThread.id);
            await updateDoc(ref, { replies: updatedReplies });
        } else {
            const ref = doc(db, "forum_posts", id);
            await updateDoc(ref, { upvotes: currentVotes + voteChange });
        }

        setUpvotedItems(prev => {
            const newSet = new Set(prev);
            if (hasUpvoted) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        await addDoc(collection(db, "forum_posts"), {
            author: ghostId,
            content: newPost,
            upvotes: 1,
            timestamp: new Date(),
            replies: []
        });

        setNewPost('');
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !activeThread) return;

        const newReply = {
            id: Math.random().toString(),
            author: ghostId,
            content: newComment,
            upvotes: 0,
            timestamp: new Date()
        };

        const updatedReplies = [...(activeThread.replies || []), newReply];
        const ref = doc(db, "forum_posts", activeThread.id);
        await updateDoc(ref, { replies: updatedReplies });

        setNewComment('');
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Syncing with Shadow Network...</div>;

    // --- RENDER THREAD VIEW ---
    if (activeThread) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
                <button
                    onClick={() => setActiveThread(null)}
                    className="btn btn-ghost"
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Network
                </button>

                {/* Original Post */}
                <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', marginBottom: '2rem', borderColor: 'var(--primary-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <button onClick={() => handleUpvote(activeThread.id, activeThread.upvotes)} className="btn btn-ghost" style={{ padding: '0.25rem', color: upvotedItems.has(activeThread.id) ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                            <ArrowUp size={28} />
                        </button>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: activeThread.upvotes > 10 ? 'var(--primary-color)' : '#fff' }}>
                            {activeThread.upvotes}
                        </span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{activeThread.author}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(activeThread.timestamp, { addSuffix: true })}</span>
                        </div>
                        <div style={{ fontSize: '1.15rem', lineHeight: 1.6 }}>
                            {activeThread.content}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <h3 style={{ marginBottom: '1rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={20} className="text-red" />
                    Encrypted Replies ({activeThread.replies?.length || 0})
                </h3>

                {/* Reply Box */}
                <div style={{ marginBottom: '2rem', paddingLeft: '3rem' }}>
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: '1rem' }}>
                        <textarea
                            className="input"
                            placeholder="Add your intelligence..."
                            rows="2"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ flex: 1, resize: 'none', backgroundColor: 'var(--surface-color)' }}
                        ></textarea>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: 'auto' }}>
                            Reply
                        </button>
                    </form>
                </div>

                {/* Reply List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '3rem' }}>
                    {activeThread.replies && activeThread.replies.map(reply => (
                        <div key={reply.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--surface-color-light)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <button onClick={() => handleUpvote(reply.id, reply.upvotes, true)} className="btn btn-ghost" style={{ padding: '0.1rem', color: upvotedItems.has(reply.id) ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                                    <ArrowUp size={18} />
                                </button>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: reply.upvotes > 5 ? 'var(--primary-color)' : '#fff' }}>{reply.upvotes}</span>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{reply.author}</span>
                                    <span>•</span>
                                    <span>{reply.timestamp && (reply.timestamp instanceof Date ? reply.timestamp : reply.timestamp.toDate ? reply.timestamp.toDate() : new Date(reply.timestamp)).getTime() ? formatDistanceToNow(reply.timestamp instanceof Date ? reply.timestamp : reply.timestamp.toDate ? reply.timestamp.toDate() : new Date(reply.timestamp), { addSuffix: true }) : 'Just now'}</span>
                                </div>
                                <div style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                    {reply.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!activeThread.replies || activeThread.replies.length === 0) && (
                        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                            Silence in the channel. Be the first to broadcast.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER FEED ---
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
            {/* Compose */}
            <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <UserX size={16} /> Submitting as <strong style={{ color: '#fff' }}>[{ghostId}]</strong>
                </div>
                <form onSubmit={handlePost} style={{ display: 'flex', gap: '1rem' }}>
                    <textarea
                        className="input"
                        placeholder="Broadcast new intelligence to the network..."
                        rows="2"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        style={{ flex: 1, resize: 'none' }}
                    ></textarea>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: 'auto' }}>
                        <Send size={18} />
                    </button>
                </form>
            </div>

            {/* Feed List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.map(post => (
                    <div
                        key={post.id}
                        className="card"
                        style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}
                        onClick={() => setActiveThread(post)}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        {/* Upvote Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => handleUpvote(post.id, post.upvotes)}
                                className="btn btn-ghost"
                                style={{ padding: '0.25rem', color: upvotedItems.has(post.id) ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                            >
                                <ArrowUp size={24} />
                            </button>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: post.upvotes > 10 ? 'var(--primary-color)' : '#fff' }}>
                                {post.upvotes}
                            </span>
                        </div>

                        {/* Content Column */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{post.author}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(post.timestamp, { addSuffix: true })}</span>
                            </div>

                            <div style={{ marginBottom: '1rem', fontSize: '1.05rem', lineHeight: 1.5 }}>
                                {post.content}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                                    <MessageSquare size={16} />
                                    <span>{post.replies?.length || 0} Comments</span>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShadowForum;
