import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Terminal, Upload, Search } from 'lucide-react';
import Home from './pages/Home';
import AppPage from './pages/AppPage';
import UploadModal from './components/UploadModal';

function App() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <BrowserRouter>
            <div className="app-wrapper">
                <header className="header">
                    <div className="container header-container">
                        <Link to="/" className="logo">
                            <Terminal className="logo-icon" />
                            <span>Bhej De Bhai</span>
                        </Link>

                        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link to="/app" className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
                                <Search size={18} style={{ marginRight: '0.5rem' }} />
                                Explore
                            </Link>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem' }}
                                onClick={() => setIsUploadModalOpen(true)}
                            >
                                <Upload size={18} />
                                Upload
                            </button>
                        </nav>
                    </div>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/app" element={<AppPage />} />
                    </Routes>
                </main>

                {isUploadModalOpen && (
                    <UploadModal onClose={() => setIsUploadModalOpen(false)} />
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;

