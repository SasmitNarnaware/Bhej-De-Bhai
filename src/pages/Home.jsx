import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Search, BookOpen, Clock, Zap } from 'lucide-react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase';

function Home() {
    const [totalLUs, setTotalLUs] = useState(0);

    useEffect(() => {
        // TODO: Fetch legit counter from Firebase once set up
        // const fetchCount = async () => {
        //   const querySnapshot = await getDocs(collection(db, "uploads"));
        //   setTotalLUs(querySnapshot.size);
        // };
        // fetchCount();
        setTotalLUs(42); // Placeholder
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero" style={{ padding: '6rem 0', textAlign: 'center' }}>
                <div className="container">
                    <Terminal size={64} className="text-red" style={{ margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Bhej De <span className="text-red">Bhai</span></h1>
                    <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        The ultimate shadow repo for assignments, notes, and code snippets.
                        Built for devs, by devs. Open source, anonymous, and fast.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
                        <Link to="/app" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Enter the Network
                        </Link>
                    </div>

                    {/* Legit Counter */}
                    <div className="badge animate-fade-in" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        <Zap size={16} style={{ marginRight: '0.5rem' }} />
                        {totalLUs} Assignments Legitimized
                    </div>
                </div>
            </section>

            {/* Features/Explanation */}
            <section style={{ padding: '4rem 0', backgroundColor: 'var(--surface-color)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="card text-center">
                            <Search size={32} className="text-red" style={{ marginBottom: '1rem' }} />
                            <h3>Search & Deploy</h3>
                            <p className="text-muted">Quickly find specific Modules or LUs using our high-speed filter.</p>
                        </div>
                        <div className="card text-center">
                            <BookOpen size={32} className="text-red" style={{ marginBottom: '1rem' }} />
                            <h3>DevView Engine</h3>
                            <p className="text-muted">Syntax highlighted code, embedded drives, and native PDF reading built right in.</p>
                        </div>
                        <div className="card text-center">
                            <Clock size={32} className="text-red" style={{ marginBottom: '1rem' }} />
                            <h3>Shadow Forum</h3>
                            <p className="text-muted">Anonymous discussion threads. No signup. Ghost IDs assigned per session.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

