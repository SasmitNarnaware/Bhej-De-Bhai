import React from 'react';
import { useState } from 'react';
import DevView from '../components/DevView';
import ShadowForum from '../components/ShadowForum';
import { Search } from 'lucide-react';

function AppPage() {
    const [activeTab, setActiveTab] = useState('view'); // 'view' or 'forum'
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>

            {/* Search Bar & Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>

                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search Subject, Module, or LU..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.25rem', borderRadius: 'var(--border-radius)' }}>
                    <button
                        className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('view')}
                        style={{ padding: '0.5rem 1.5rem' }}
                    >
                        DevView
                    </button>
                    <button
                        className={`btn ${activeTab === 'forum' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('forum')}
                        style={{ padding: '0.5rem 1.5rem' }}
                    >
                        Shadow Forum
                    </button>
                </div>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'view' ? (
                    <DevView searchQuery={searchQuery} />
                ) : (
                    <ShadowForum />
                )}
            </div>

        </div>
    );
}

export default AppPage;

