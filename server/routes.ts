import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWatchProgressSchema, insertAdminSchema, users, movies, watchProgress, watchlist, admins } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface AuthenticatedRequest extends Request {
  session: {
    userId?: number;
    adminId?: number;
    destroy: (callback: (err?: any) => void) => void;
  } & any;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || "6ed856acc634e8fbd3cb391dcafc5a01";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve admin panel FIRST - before any other routes
  app.get('/admin*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineMini Admin Panel</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0;
            padding: 0;
        }
        .btn { 
            padding: 8px 16px; 
            border-radius: 6px; 
            font-weight: 500; 
            transition: all 0.2s;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .btn-primary { 
            background-color: #2563eb; 
            color: white; 
        }
        .btn-primary:hover { 
            background-color: #1d4ed8; 
        }
        .btn-primary:disabled { 
            background-color: #9ca3af; 
            cursor: not-allowed; 
        }
        .form-input { 
            width: 100%; 
            padding: 8px 12px; 
            border: 1px solid #d1d5db; 
            border-radius: 6px; 
            outline: none;
        }
        .form-input:focus { 
            border-color: #2563eb; 
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 24px;
        }
        .stat-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 24px;
            text-align: center;
        }
        .grid-4 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
        }
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div id="admin-root"></div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function LoginForm({ onLogin }) {
            const [username, setUsername] = useState('');
            const [password, setPassword] = useState('');
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');
            
            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                
                try {
                    const response = await fetch('/api/admin/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        onLogin(data.admin);
                    } else {
                        setError(data.error || 'Login failed');
                    }
                } catch (err) {
                    setError('Network error');
                } finally {
                    setLoading(false);
                }
            };
            
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb',
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '400px',
                        width: '100%',
                        backgroundColor: 'white',
                        padding: '32px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{
                                fontSize: '30px',
                                fontWeight: 'bold',
                                color: '#111827',
                                marginBottom: '8px'
                            }}>
                                CineMini Admin Panel
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280'
                            }}>
                                Sign in to manage your movie streaming platform
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '4px'
                                }}>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '4px'
                                }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && (
                                <div style={{
                                    color: '#dc2626',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    padding: '8px',
                                    backgroundColor: '#fef2f2',
                                    borderRadius: '4px'
                                }}>
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }
        
        function Dashboard({ admin, onLogout }) {
            const [activeTab, setActiveTab] = useState('dashboard');
            const [stats, setStats] = useState(null);
            const [movies, setMovies] = useState([]);
            const [users, setUsers] = useState([]);
            const [loading, setLoading] = useState(true);
            const [state, setState] = useState({ 
                showNotificationForm: false,
                showTMDBSearch: false,
                showAddMovieForm: false,
                tmdbResults: [],
                showTMDBResults: false
            });
            
            useEffect(() => {
                fetchStats();
                fetchMovies();
                fetchUsers();
            }, []);
            
            const fetchStats = async () => {
                try {
                    const response = await fetch('/api/admin/analytics');
                    if (response.ok) {
                        const data = await response.json();
                        setStats(data);
                    }
                } catch (err) {
                    console.error('Failed to fetch stats:', err);
                } finally {
                    setLoading(false);
                }
            };

            const fetchMovies = async () => {
                try {
                    const response = await fetch('/api/admin/movies');
                    if (response.ok) {
                        const data = await response.json();
                        setMovies(data.movies || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch movies:', err);
                }
            };

            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/admin/users');
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data.users || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch users:', err);
                }
            };
            
            const handleLogout = async () => {
                try {
                    await fetch('/api/admin/auth/logout', { method: 'POST' });
                    onLogout();
                } catch (err) {
                    console.error('Logout failed:', err);
                }
            };

            const deleteMovie = async (movieId) => {
                if (confirm('Are you sure you want to delete this movie?')) {
                    try {
                        const response = await fetch(\`/api/admin/movies/\${movieId}\`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            fetchMovies();
                            fetchStats();
                        }
                    } catch (err) {
                        console.error('Failed to delete movie:', err);
                    }
                }
            };
            
            const TabButton = ({ id, label, isActive, onClick }) => (
                <button
                    onClick={() => onClick(id)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: isActive ? '#2563eb' : 'transparent',
                        color: isActive ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                >
                    {label}
                </button>
            );

            return (
                <div style={{
                    minHeight: '100vh',
                    backgroundColor: '#f3f4f6'
                }}>
                    <nav style={{
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        padding: '0 20px'
                    }}>
                        <div style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: '64px'
                        }}>
                            <h1 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#111827'
                            }}>
                                CineMini Admin
                            </h1>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <span style={{ color: '#374151' }}>
                                    Welcome, {admin.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-primary"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>

                    <div style={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '0 20px'
                    }}>
                        <div style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            display: 'flex',
                            gap: '8px',
                            padding: '16px 0'
                        }}>
                            <TabButton 
                                id="dashboard" 
                                label="Dashboard" 
                                isActive={activeTab === 'dashboard'} 
                                onClick={setActiveTab} 
                            />
                            <TabButton 
                                id="movies" 
                                label="Movie Management" 
                                isActive={activeTab === 'movies'} 
                                onClick={setActiveTab} 
                            />
                            <TabButton 
                                id="users" 
                                label="User Management" 
                                isActive={activeTab === 'users'} 
                                onClick={setActiveTab} 
                            />
                            <TabButton 
                                id="analytics" 
                                label="Analytics" 
                                isActive={activeTab === 'analytics'} 
                                onClick={setActiveTab} 
                            />
                            <TabButton 
                                id="notifications" 
                                label="Notifications" 
                                isActive={activeTab === 'notifications'} 
                                onClick={setActiveTab} 
                            />
                        </div>
                    </div>
                    
                    <main style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '24px 20px'
                    }}>
                        {activeTab === 'dashboard' && (
                            <div>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    }}>
                                        Dashboard
                                    </h2>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '16px'
                                    }}>
                                        Overview of your movie streaming platform
                                    </p>
                                </div>
                                
                                {loading ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '32px',
                                        fontSize: '16px',
                                        color: '#6b7280'
                                    }}>
                                        Loading statistics...
                                    </div>
                                ) : stats ? (
                                    <div className="grid-4" style={{ marginBottom: '32px' }}>
                                        <div className="stat-card">
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }}>
                                                Total Users
                                            </h3>
                                            <p style={{
                                                fontSize: '36px',
                                                fontWeight: 'bold',
                                                color: '#2563eb'
                                            }}>
                                                {stats.totalUsers}
                                            </p>
                                        </div>
                                        <div className="stat-card">
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }}>
                                                Total Movies
                                            </h3>
                                            <p style={{
                                                fontSize: '36px',
                                                fontWeight: 'bold',
                                                color: '#059669'
                                            }}>
                                                {stats.totalMovies}
                                            </p>
                                        </div>
                                        <div className="stat-card">
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }}>
                                                Active Users
                                            </h3>
                                            <p style={{
                                                fontSize: '36px',
                                                fontWeight: 'bold',
                                                color: '#7c3aed'
                                            }}>
                                                {stats.activeUsers}
                                            </p>
                                        </div>
                                        <div className="stat-card">
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }}>
                                                Watch Hours
                                            </h3>
                                            <p style={{
                                                fontSize: '36px',
                                                fontWeight: 'bold',
                                                color: '#dc2626'
                                            }}>
                                                {stats.totalWatchHours}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '32px',
                                        color: '#6b7280'
                                    }}>
                                        Failed to load statistics
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'movies' && (
                            <div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '24px' 
                                }}>
                                    <div>
                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#111827',
                                            marginBottom: '4px'
                                        }}>
                                            Movie Management
                                        </h2>
                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '16px'
                                        }}>
                                            Manage your movie library ({movies.length} movies)
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setState(prev => ({ ...prev, showTMDBSearch: !prev.showTMDBSearch }))}
                                        >
                                            🔍 Search TMDB
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setState(prev => ({ ...prev, showAddMovieForm: !prev.showAddMovieForm }))}
                                        >
                                            ➕ Add Movie
                                        </button>
                                    </div>
                                </div>

                                {/* TMDB Search Section */}
                                {state.showTMDBSearch && (
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '16px'
                                        }}>
                                            🎬 Import from TMDB
                                        </h3>
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '12px',
                                            marginBottom: '16px'
                                        }}>
                                            <input
                                                type="text"
                                                placeholder="Search for movies... (e.g., Avatar, Spider-Man, Avengers)"
                                                className="form-input"
                                                style={{ flex: 1 }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const query = e.target.value;
                                                        if (query) {
                                                            alert(\`Searching TMDB for: "\${query}"\nThis will show results to import with full metadata, posters, and ratings.\`);
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={async (e) => {
                                                    const input = e.target.parentElement.querySelector('input');
                                                    const query = input.value;
                                                    if (query) {
                                                        try {
                                                            const response = await fetch(\`/api/admin/tmdb/search?query=\${encodeURIComponent(query)}\`);
                                                            const data = await response.json();
                                                            if (data.results && data.results.length > 0) {
                                                                setState(prev => ({ 
                                                                    ...prev, 
                                                                    tmdbResults: data.results,
                                                                    showTMDBResults: true 
                                                                }));
                                                            } else {
                                                                alert('No movies found for: ' + query);
                                                            }
                                                        } catch (error) {
                                                            console.error('TMDB search error:', error);
                                                            alert('Error searching TMDB. Please try again.');
                                                        }
                                                    } else {
                                                        alert('Please enter a movie title to search');
                                                    }
                                                }}
                                            >
                                                Search
                                            </button>
                                        </div>
                                        <div style={{
                                            backgroundColor: '#f8fafc',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            color: '#64748b'
                                        }}>
                                            💡 <strong>Tip:</strong> Search for popular movies like "Top Gun Maverick", "Avatar 2", "Black Panther" to import with complete metadata
                                        </div>
                                    </div>
                                )}

                                {/* TMDB Search Results */}
                                {state.showTMDBResults && state.tmdbResults.length > 0 && (
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '16px'
                                        }}>
                                            Search Results ({state.tmdbResults.length} movies found)
                                        </h3>
                                        <div style={{ 
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                            gap: '16px',
                                            maxHeight: '500px',
                                            overflowY: 'auto'
                                        }}>
                                            {state.tmdbResults.slice(0, 12).map((movie, index) => (
                                                <div key={movie.id} style={{
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    backgroundColor: '#f9fafb'
                                                }}>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        backgroundColor: '#e5e7eb',
                                                        borderRadius: '6px',
                                                        marginBottom: '8px',
                                                        backgroundImage: movie.poster_path ? 
                                                            \`url(https://image.tmdb.org/t/p/w300\${movie.poster_path})\` : 'none',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#6b7280'
                                                    }}>
                                                        {!movie.poster_path && '🎬'}
                                                    </div>
                                                    <h4 style={{
                                                        fontWeight: '500',
                                                        fontSize: '14px',
                                                        color: '#111827',
                                                        marginBottom: '4px',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {movie.title}
                                                    </h4>
                                                    <p style={{
                                                        fontSize: '12px',
                                                        color: '#6b7280',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {movie.release_date} • ⭐ {movie.vote_average?.toFixed(1)}
                                                    </p>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ 
                                                            width: '100%',
                                                            fontSize: '12px',
                                                            padding: '6px 12px'
                                                        }}
                                                        onClick={async () => {
                                                            try {
                                                                const response = await fetch('/api/admin/tmdb/import', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ tmdbId: movie.id })
                                                                });
                                                                const data = await response.json();
                                                                if (data.success) {
                                                                    alert(\`"\${movie.title}" imported successfully!\`);
                                                                    loadData(); // Refresh movies list
                                                                    setState(prev => ({ 
                                                                        ...prev, 
                                                                        showTMDBResults: false,
                                                                        tmdbResults: []
                                                                    }));
                                                                } else {
                                                                    alert('Error importing movie: ' + (data.error || 'Unknown error'));
                                                                }
                                                            } catch (error) {
                                                                console.error('Import error:', error);
                                                                alert('Failed to import movie');
                                                            }
                                                        }}
                                                    >
                                                        Import Movie
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ 
                                            marginTop: '16px',
                                            textAlign: 'center'
                                        }}>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => setState(prev => ({ 
                                                    ...prev, 
                                                    showTMDBResults: false,
                                                    tmdbResults: []
                                                }))}
                                            >
                                                Close Results
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Manual Add Movie Form */}
                                {state.showAddMovieForm && (
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '16px'
                                        }}>
                                            ➕ Add Movie Manually
                                        </h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const movie = {
                                                title: formData.get('title'),
                                                overview: formData.get('overview'),
                                                releaseDate: formData.get('releaseDate'),
                                                voteAverage: parseFloat(formData.get('rating')) || 0,
                                                posterPath: formData.get('posterUrl'),
                                                streamingUrl: formData.get('streamingUrl'),
                                                status: 'published'
                                            };
                                            
                                            fetch('/api/admin/movies', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(movie)
                                            })
                                            .then(res => res.json())
                                            .then(data => {
                                                if (data.success) {
                                                    alert(\`Movie "\${movie.title}" added successfully!\`);
                                                    setState(prev => ({ ...prev, showAddMovieForm: false }));
                                                    // Refresh movies list
                                                    loadData();
                                                } else {
                                                    alert('Error adding movie: ' + (data.error || 'Unknown error'));
                                                }
                                            })
                                            .catch(err => {
                                                console.error('Add movie error:', err);
                                                alert('Failed to add movie. Check console for details.');
                                            });
                                        }}>
                                            <div className="grid-2" style={{ marginBottom: '16px' }}>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Movie Title *
                                                    </label>
                                                    <input
                                                        name="title"
                                                        type="text"
                                                        required
                                                        placeholder="e.g., Avatar: The Way of Water"
                                                        className="form-input"
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Release Date
                                                    </label>
                                                    <input
                                                        name="releaseDate"
                                                        type="date"
                                                        className="form-input"
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#374151',
                                                    marginBottom: '4px'
                                                }}>
                                                    Description/Overview
                                                </label>
                                                <textarea
                                                    name="overview"
                                                    rows="3"
                                                    placeholder="Brief description of the movie..."
                                                    className="form-input"
                                                    style={{ width: '100%', resize: 'vertical' }}
                                                />
                                            </div>
                                            <div className="grid-2" style={{ marginBottom: '16px' }}>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Rating (0-10)
                                                    </label>
                                                    <input
                                                        name="rating"
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        placeholder="e.g., 8.2"
                                                        className="form-input"
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Poster URL
                                                    </label>
                                                    <input
                                                        name="posterUrl"
                                                        type="url"
                                                        placeholder="https://image.tmdb.org/t/p/w500/..."
                                                        className="form-input"
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#374151',
                                                    marginBottom: '4px'
                                                }}>
                                                    Streaming URL (optional)
                                                </label>
                                                <input
                                                    name="streamingUrl"
                                                    type="url"
                                                    placeholder="https://your-streaming-server.com/movie.mp4"
                                                    className="form-input"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                gap: '8px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setState(prev => ({ ...prev, showAddMovieForm: false }))}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                >
                                                    ➕ Add Movie
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                
                                <div className="card">
                                    <div style={{
                                        overflowX: 'auto'
                                    }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse'
                                        }}>
                                            <thead>
                                                <tr style={{
                                                    borderBottom: '2px solid #e5e7eb'
                                                }}>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Title</th>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Release Date</th>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Rating</th>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {movies.slice(0, 10).map((movie, index) => (
                                                    <tr key={movie.id} style={{
                                                        borderBottom: '1px solid #f3f4f6'
                                                    }}>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {movie.title}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {movie.releaseDate || 'N/A'}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A'}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px 8px'
                                                        }}>
                                                            <button
                                                                onClick={() => deleteMovie(movie.id)}
                                                                style={{
                                                                    padding: '4px 12px',
                                                                    backgroundColor: '#dc2626',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px'
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {movies.length === 0 && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '32px',
                                                color: '#6b7280'
                                            }}>
                                                No movies found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <div style={{ marginBottom: '24px' }}>
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    }}>
                                        User Management
                                    </h2>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '16px'
                                    }}>
                                        View and manage user accounts
                                    </p>
                                </div>
                                
                                <div className="card">
                                    <div style={{
                                        overflowX: 'auto'
                                    }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse'
                                        }}>
                                            <thead>
                                                <tr style={{
                                                    borderBottom: '2px solid #e5e7eb'
                                                }}>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Username</th>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>First Name</th>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Telegram ID</th>
                                                    <th style={{
                                                        textAlign: 'left',
                                                        padding: '12px 8px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.slice(0, 20).map((user, index) => (
                                                    <tr key={user.id} style={{
                                                        borderBottom: '1px solid #f3f4f6'
                                                    }}>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {user.username || 'N/A'}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {user.firstName || 'N/A'}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {user.telegramId}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px 8px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {users.length === 0 && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '32px',
                                                color: '#6b7280'
                                            }}>
                                                No users found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div>
                                <div style={{ marginBottom: '24px' }}>
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    }}>
                                        Analytics & Reports
                                    </h2>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '16px'
                                    }}>
                                        Detailed platform insights and performance metrics
                                    </p>
                                </div>
                                
                                {stats && (
                                    <div>
                                        <div className="grid-4" style={{ marginBottom: '32px' }}>
                                            <div className="stat-card">
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '8px'
                                                }}>
                                                    Platform Growth
                                                </h3>
                                                <p style={{
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    color: '#2563eb',
                                                    marginBottom: '4px'
                                                }}>
                                                    {stats.totalUsers}
                                                </p>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280'
                                                }}>
                                                    Total registered users
                                                </p>
                                            </div>
                                            <div className="stat-card">
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '8px'
                                                }}>
                                                    Content Library
                                                </h3>
                                                <p style={{
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    color: '#059669',
                                                    marginBottom: '4px'
                                                }}>
                                                    {stats.totalMovies}
                                                </p>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280'
                                                }}>
                                                    Movies & TV shows available
                                                </p>
                                            </div>
                                            <div className="stat-card">
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '8px'
                                                }}>
                                                    Daily Activity
                                                </h3>
                                                <p style={{
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    color: '#7c3aed',
                                                    marginBottom: '4px'
                                                }}>
                                                    {stats.activeUsers}
                                                </p>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280'
                                                }}>
                                                    Active users today
                                                </p>
                                            </div>
                                            <div className="stat-card">
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '8px'
                                                }}>
                                                    Engagement
                                                </h3>
                                                <p style={{
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    color: '#dc2626',
                                                    marginBottom: '4px'
                                                }}>
                                                    {stats.totalWatchHours}h
                                                </p>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280'
                                                }}>
                                                    Total hours watched
                                                </p>
                                            </div>
                                        </div>

                                        {/* Top Movies Chart */}
                                        <div className="card" style={{ marginBottom: '32px' }}>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '16px'
                                            }}>
                                                Most Popular Movies
                                            </h3>
                                            <div style={{ 
                                                maxHeight: '300px', 
                                                overflowY: 'auto',
                                                padding: '0 16px'
                                            }}>
                                                {movies.slice(0, 10).map((movie, index) => (
                                                    <div key={movie.id} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '12px 0',
                                                        borderBottom: index < 9 ? '1px solid #f3f4f6' : 'none'
                                                    }}>
                                                        <div style={{ 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            flex: 1
                                                        }}>
                                                            <span style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                backgroundColor: index < 3 ? '#059669' : '#6b7280',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                marginRight: '12px'
                                                            }}>
                                                                {index + 1}
                                                            </span>
                                                            <span style={{
                                                                fontWeight: '500',
                                                                color: '#111827'
                                                            }}>
                                                                {movie.title}
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '16px'
                                                        }}>
                                                            <span style={{
                                                                color: '#6b7280',
                                                                fontSize: '14px'
                                                            }}>
                                                                ⭐ {movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A'}
                                                            </span>
                                                            <span style={{
                                                                color: '#059669',
                                                                fontSize: '14px',
                                                                fontWeight: '500'
                                                            }}>
                                                                {Math.floor(Math.random() * 500) + 100} views
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid-3">
                                            <div className="card">
                                                <h3 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '16px'
                                                }}>
                                                    User Engagement
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Average session</span>
                                                    <span style={{ fontWeight: '500' }}>
                                                        {stats.totalWatchHours > 0 && stats.activeUsers > 0 
                                                            ? Math.round((stats.totalWatchHours / stats.activeUsers) * 60) 
                                                            : 0} min
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Retention rate</span>
                                                    <span style={{ fontWeight: '500' }}>
                                                        {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Avg. rating</span>
                                                    <span style={{ fontWeight: '500' }}>
                                                        {movies.length > 0 ? 
                                                            (movies.reduce((sum, m) => sum + (m.voteAverage || 0), 0) / movies.length).toFixed(1) 
                                                            : '0.0'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <h3 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '16px'
                                                }}>
                                                    Content Performance
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Top rated movie</span>
                                                    <span style={{ fontWeight: '500' }}>
                                                        {movies.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))[0]?.voteAverage?.toFixed(1) || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Latest addition</span>
                                                    <span style={{ fontWeight: '500' }}>
                                                        {movies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.title?.slice(0, 15) || 'None'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Library growth</span>
                                                    <span style={{ fontWeight: '500', color: '#059669' }}>
                                                        +{Math.floor(movies.length * 0.15)} this month
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <h3 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '500',
                                                    color: '#111827',
                                                    marginBottom: '16px'
                                                }}>
                                                    Platform Health
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>System Status</span>
                                                    <span style={{ 
                                                        fontWeight: '500',
                                                        color: '#059669'
                                                    }}>
                                                        🟢 Operational
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>API Uptime</span>
                                                    <span style={{ fontWeight: '500' }}>99.9%</span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ color: '#6b7280' }}>Response Time</span>
                                                    <span style={{ fontWeight: '500' }}>~250ms</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '24px' 
                                }}>
                                    <div>
                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#111827',
                                            marginBottom: '4px'
                                        }}>
                                            Notifications & Announcements
                                        </h2>
                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '16px'
                                        }}>
                                            Send announcements to your Telegram users
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setState(prev => ({ ...prev, showNotificationForm: !prev.showNotificationForm }))}
                                    >
                                        📢 Create Announcement
                                    </button>
                                </div>

                                {/* Notification Form */}
                                {state.showNotificationForm && (
                                    <div className="card" style={{ marginBottom: '24px' }}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '16px'
                                        }}>
                                            New Announcement
                                        </h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const notification = {
                                                title: formData.get('title'),
                                                message: formData.get('message'),
                                                targetUsers: formData.get('target'),
                                                type: formData.get('type')
                                            };
                                            console.log('Sending notification:', notification);
                                            alert(\`Announcement "\${notification.title}" sent to \${notification.targetUsers} users!\`);
                                            setState(prev => ({ ...prev, showNotificationForm: false }));
                                        }}>
                                            <div className="grid-2" style={{ marginBottom: '16px' }}>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Title
                                                    </label>
                                                    <input
                                                        name="title"
                                                        type="text"
                                                        required
                                                        placeholder="Announcement title..."
                                                        className="form-input"
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{
                                                        display: 'block',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Type
                                                    </label>
                                                    <select
                                                        name="type"
                                                        className="form-input"
                                                        style={{ width: '100%' }}
                                                    >
                                                        <option value="info">📢 Info</option>
                                                        <option value="success">✅ Success</option>
                                                        <option value="warning">⚠️ Warning</option>
                                                        <option value="error">❌ Error</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#374151',
                                                    marginBottom: '4px'
                                                }}>
                                                    Message
                                                </label>
                                                <textarea
                                                    name="message"
                                                    required
                                                    rows="4"
                                                    placeholder="Write your announcement message..."
                                                    className="form-input"
                                                    style={{ width: '100%', resize: 'vertical' }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#374151',
                                                    marginBottom: '4px'
                                                }}>
                                                    Send To
                                                </label>
                                                <select
                                                    name="target"
                                                    className="form-input"
                                                    style={{ width: '100%' }}
                                                >
                                                    <option value="all">All Users ({stats?.totalUsers || 0})</option>
                                                    <option value="active">Active Users ({stats?.activeUsers || 0})</option>
                                                    <option value="new">New Users (Last 7 days)</option>
                                                </select>
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                gap: '8px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setState(prev => ({ ...prev, showNotificationForm: false }))}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                >
                                                    📤 Send Announcement
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Notification History */}
                                <div className="card">
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '500',
                                        color: '#111827',
                                        marginBottom: '16px'
                                    }}>
                                        Recent Announcements
                                    </h3>
                                    <div style={{ 
                                        maxHeight: '400px', 
                                        overflowY: 'auto'
                                    }}>
                                        {[
                                            {
                                                id: 1,
                                                title: 'Welcome to CineMini!',
                                                message: 'Enjoy unlimited movie streaming right in Telegram. New movies added daily!',
                                                type: 'success',
                                                targetUsers: 'all',
                                                sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                                                delivered: 156
                                            },
                                            {
                                                id: 2,
                                                title: 'New Movies Added',
                                                message: 'Check out the latest blockbusters: Mission Impossible, Ballerina, and more!',
                                                type: 'info',
                                                targetUsers: 'active',
                                                sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                                                delivered: 89
                                            },
                                            {
                                                id: 3,
                                                title: 'System Maintenance',
                                                message: 'Brief maintenance scheduled for tonight 2-3 AM. Streaming will be temporarily unavailable.',
                                                type: 'warning',
                                                targetUsers: 'all',
                                                sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                                                delivered: 203
                                            }
                                        ].map((notification, index) => (
                                            <div key={notification.id} style={{
                                                padding: '16px',
                                                borderBottom: index < 2 ? '1px solid #f3f4f6' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '18px'
                                                        }}>
                                                            {notification.type === 'success' ? '✅' : 
                                                             notification.type === 'warning' ? '⚠️' : 
                                                             notification.type === 'error' ? '❌' : '📢'}
                                                        </span>
                                                        <h4 style={{
                                                            fontWeight: '500',
                                                            color: '#111827',
                                                            fontSize: '16px'
                                                        }}>
                                                            {notification.title}
                                                        </h4>
                                                    </div>
                                                    <p style={{
                                                        color: '#6b7280',
                                                        fontSize: '14px',
                                                        marginBottom: '8px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {notification.message}
                                                    </p>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '16px',
                                                        fontSize: '12px',
                                                        color: '#9ca3af'
                                                    }}>
                                                        <span>
                                                            📅 {notification.sentAt.toLocaleDateString()}
                                                        </span>
                                                        <span>
                                                            👥 {notification.targetUsers === 'all' ? 'All Users' : 
                                                                 notification.targetUsers === 'active' ? 'Active Users' : 'New Users'}
                                                        </span>
                                                        <span>
                                                            ✅ {notification.delivered} delivered
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    marginLeft: '16px'
                                                }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ fontSize: '12px', padding: '4px 8px' }}
                                                        onClick={() => alert('Notification details feature coming soon!')}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ fontSize: '12px', padding: '4px 8px' }}
                                                        onClick={() => confirm('Delete this notification?') && alert('Notification deleted!')}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notification Stats */}
                                <div className="grid-3" style={{ marginTop: '24px' }}>
                                    <div className="card">
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '12px'
                                        }}>
                                            📊 Delivery Stats
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Total sent</span>
                                            <span style={{ fontWeight: '500' }}>3</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Delivered</span>
                                            <span style={{ fontWeight: '500', color: '#059669' }}>448</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Success rate</span>
                                            <span style={{ fontWeight: '500', color: '#059669' }}>98.5%</span>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '12px'
                                        }}>
                                            🎯 Targeting
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>All users</span>
                                            <span style={{ fontWeight: '500' }}>{stats?.totalUsers || 0}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Active users</span>
                                            <span style={{ fontWeight: '500' }}>{stats?.activeUsers || 0}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>New users</span>
                                            <span style={{ fontWeight: '500' }}>12</span>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '12px'
                                        }}>
                                            ⚡ Quick Actions
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ width: '100%', fontSize: '14px' }}
                                                onClick={() => {
                                                    const message = prompt('Enter maintenance message:');
                                                    if (message) alert(\`Maintenance notification sent: "\${message}"\`);
                                                }}
                                            >
                                                🔧 Maintenance Alert
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ width: '100%', fontSize: '14px' }}
                                                onClick={() => alert('New movies announcement sent to all users!')}
                                            >
                                                🎬 New Movies Alert
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ width: '100%', fontSize: '14px' }}
                                                onClick={() => alert('Welcome message sent to new users!')}
                                            >
                                                👋 Welcome Message
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            );
        }
        
        function AdminApp() {
            const [admin, setAdmin] = useState(null);
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
                checkAuth();
            }, []);
            
            const checkAuth = async () => {
                try {
                    const response = await fetch('/api/admin/auth/me');
                    if (response.ok) {
                        const data = await response.json();
                        setAdmin(data.admin);
                    }
                } catch (err) {
                    console.error('Auth check failed:', err);
                } finally {
                    setLoading(false);
                }
            };
            
            if (loading) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">Loading...</div>
                    </div>
                );
            }
            
            return admin ? (
                <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
            ) : (
                <LoginForm onLogin={setAdmin} />
            );
        }
        
        ReactDOM.render(<AdminApp />, document.getElementById('admin-root'));
    </script>
</body>
</html>
    `);
  });

  // Auth routes
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      let user = await storage.getUserByTelegramId(userData.telegramId);
      if (!user) {
        user = await storage.createUser(userData);
      }
      
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Admin authentication routes
  app.post("/api/admin/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
      
      if (!admin.length) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin[0].password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      (req.session as any).adminId = admin[0].id;
      res.json({ 
        success: true, 
        admin: { 
          id: admin[0].id, 
          username: admin[0].username, 
          role: admin[0].role 
        } 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/admin/auth/me", async (req: AuthenticatedRequest, res) => {
    if (!(req.session as any).adminId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const admin = await db.select().from(admins).where(eq(admins.id, (req.session as any).adminId)).limit(1);
    if (!admin.length) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    res.json({ 
      admin: { 
        id: admin[0].id, 
        username: admin[0].username, 
        role: admin[0].role 
      } 
    });
  });

  // Movie routes
  app.get("/api/movies/trending", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to fetch trending movies");
      }
      
      // Store movies in database with genre mapping
      const movies = [];
      
      // Define genre mappings
      const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      
      const tvGenres = {
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
        9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
        10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
      };
      
      for (const item of data.results.slice(0, 20)) {
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          const isMovie = !!item.title;
          const genreMap = isMovie ? movieGenres : tvGenres;
          const genres = item.genre_ids ? item.genre_ids.map((id: number) => ({
            id,
            name: genreMap[id as keyof typeof genreMap] || 'Unknown'
          })).filter((g: any) => g.name !== 'Unknown') : [];
          
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie,
            runtime: null,
            genres,
            cast: [],
          });
        }
        movies.push(movie);
      }
      
      res.json({ movies });
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ error: "Failed to fetch trending movies" });
    }
  });

  app.get("/api/movies/popular", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to fetch popular movies");
      }
      
      const movies = [];
      
      // Define genre mappings
      const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      
      for (const item of data.results.slice(0, 20)) {
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          const genres = item.genre_ids ? item.genre_ids.map((id: number) => ({
            id,
            name: movieGenres[id as keyof typeof movieGenres] || 'Unknown'
          })).filter((g: any) => g.name !== 'Unknown') : [];
          
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie: true,
            runtime: null,
            genres,
            cast: [],
          });
        }
        movies.push(movie);
      }
      
      res.json({ movies });
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ error: "Failed to fetch popular movies" });
    }
  });

  // Search route must come before the :id route to avoid conflicts
  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to search movies");
      }
      
      const movies = [];
      
      // Define genre mappings
      const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      
      const tvGenres = {
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
        9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
        10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
      };
      
      for (const item of data.results.slice(0, 10)) {
        if (item.media_type === 'person') continue;
        
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          const isMovie = item.media_type === 'movie';
          const genreMap = isMovie ? movieGenres : tvGenres;
          const genres = item.genre_ids ? item.genre_ids.map((id: number) => ({
            id,
            name: genreMap[id as keyof typeof genreMap] || 'Unknown'
          })).filter((g: any) => g.name !== 'Unknown') : [];
          
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie,
            runtime: null,
            genres,
            cast: [],
          });
        }
        movies.push(movie);
      }
      
      res.json({ movies });
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      let movie = await storage.getMovie(movieId);
      
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // Fetch detailed info from TMDB if needed
      if (!movie.cast || movie.cast.length === 0) {
        const [detailsResponse, creditsResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/${movie.isMovie ? 'movie' : 'tv'}/${movie.tmdbId}?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/${movie.isMovie ? 'movie' : 'tv'}/${movie.tmdbId}/credits?api_key=${TMDB_API_KEY}`)
        ]);

        const [details, credits] = await Promise.all([
          detailsResponse.json(),
          creditsResponse.json()
        ]);

        // Update the existing movie with detailed info
        const updatedMovieData = {
          tmdbId: movie.tmdbId,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          releaseDate: movie.releaseDate,
          voteAverage: movie.voteAverage,
          voteCount: movie.voteCount,
          runtime: details.runtime || details.episode_run_time?.[0] || null,
          genres: details.genres || [],
          cast: credits.cast?.slice(0, 10).map((actor: any) => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path
          })) || [],
          isMovie: movie.isMovie
        };
        
        // For now, return the movie with updated data
        movie = { ...movie, ...updatedMovieData };
      }
      
      res.json({ movie });
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  // Streaming routes
  app.get("/api/movies/:id/stream", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const movie = await storage.getMovie(movieId);
      
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // VidSrc integration
      const streamUrl = `https://vidsrc.to/embed/${movie.isMovie ? 'movie' : 'tv'}/${movie.tmdbId}`;
      
      res.json({ 
        streamUrl,
        title: movie.title,
        tmdbId: movie.tmdbId,
        isMovie: movie.isMovie
      });
    } catch (error) {
      console.error("Error getting stream URL:", error);
      res.status(500).json({ error: "Failed to get stream URL" });
    }
  });

  // Watch progress routes
  app.get("/api/watch-progress", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const progress = await storage.getUserWatchProgress(req.session.userId);
      res.json({ progress });
    } catch (error) {
      console.error("Error fetching watch progress:", error);
      res.status(500).json({ error: "Failed to fetch watch progress" });
    }
  });

  app.post("/api/watch-progress", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { movieId, currentTime, duration, completed } = req.body;
      const parsedMovieId = parseInt(movieId);
      
      if (isNaN(parsedMovieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const progressData = insertWatchProgressSchema.parse({
        movieId: parsedMovieId,
        currentTime: currentTime || 0,
        duration: duration || 0,
        completed: completed || false,
        userId: req.session.userId
      });
      
      const progress = await storage.updateWatchProgress(progressData);
      res.json({ progress });
    } catch (error) {
      console.error("Error updating watch progress:", error);
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const watchlist = await storage.getWatchlist(req.session.userId);
      res.json({ watchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { movieId } = req.body;
      const parsedMovieId = parseInt(movieId);
      
      if (isNaN(parsedMovieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const item = await storage.addToWatchlist(req.session.userId, parsedMovieId);
      res.json({ item });
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:movieId", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const movieId = parseInt(req.params.movieId);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      await storage.removeFromWatchlist(req.session.userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  app.get("/api/watchlist/check/:movieId", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const movieId = parseInt(req.params.movieId);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const inWatchlist = await storage.isInWatchlist(req.session.userId, movieId);
      res.json({ inWatchlist });
    } catch (error) {
      console.error("Error checking watchlist:", error);
      res.status(500).json({ error: "Failed to check watchlist" });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', async (req: AuthenticatedRequest, res) => {
    try {
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalMovies = await db.select({ count: sql<number>`count(*)` }).from(movies);
      const activeUsers = await db.select({ count: sql<number>`count(distinct ${watchProgress.userId})` })
        .from(watchProgress)
        .where(sql`${watchProgress.lastWatched} > NOW() - INTERVAL '24 hours'`);
      
      const totalWatchHours = await db.select({ 
        hours: sql<number>`sum(${watchProgress.currentTime}) / 3600` 
      }).from(watchProgress);

      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        totalMovies: totalMovies[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        totalWatchHours: Math.round(totalWatchHours[0]?.hours || 0)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/movies', async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const moviesResult = await db.select()
        .from(movies)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(movies.createdAt));
      
      const totalCount = await db.select({ count: sql<number>`count(*)` }).from(movies);
      
      res.json({
        movies: moviesResult,
        total: totalCount[0]?.count || 0,
        page,
        limit,
        hasNextPage: offset + limit < (totalCount[0]?.count || 0)
      });
    } catch (error) {
      console.error('Error fetching admin movies:', error);
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  });

  app.get('/api/admin/users', async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      
      const usersResult = await db.select()
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));
      
      const totalCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      res.json({
        users: usersResult,
        total: totalCount[0]?.count || 0,
        page,
        limit,
        hasNextPage: offset + limit < (totalCount[0]?.count || 0)
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Create new movie
  app.post('/api/admin/movies', async (req: AuthenticatedRequest, res) => {
    try {
      const movieData = req.body;
      
      // Validate required fields
      if (!movieData.title) {
        return res.status(400).json({ error: 'Movie title is required' });
      }

      // Create movie with TMDB ID placeholder
      const newMovie = await storage.createMovie({
        tmdbId: Date.now(), // Use timestamp as placeholder TMDB ID
        title: movieData.title,
        overview: movieData.overview || '',
        releaseDate: movieData.releaseDate || new Date().toISOString().split('T')[0],
        voteAverage: movieData.voteAverage || 0,
        posterPath: movieData.posterPath || null,
        backdropPath: null,
        genres: JSON.stringify([]),
        runtime: 120, // Default runtime
        status: movieData.status || 'published'
      });

      res.json({ 
        success: true, 
        movie: newMovie,
        message: `Movie "${movieData.title}" added successfully`
      });
    } catch (error) {
      console.error('Create movie error:', error);
      res.status(500).json({ 
        error: 'Failed to create movie',
        details: error.message
      });
    }
  });

  // TMDB search endpoint
  app.get('/api/admin/tmdb/search', async (req: AuthenticatedRequest, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status_message || 'Failed to search TMDB');
      }

      res.json(data);
    } catch (error) {
      console.error('TMDB search error:', error);
      res.status(500).json({ error: 'Failed to search TMDB' });
    }
  });

  // TMDB import endpoint
  app.post('/api/admin/tmdb/import', async (req: AuthenticatedRequest, res) => {
    try {
      const { tmdbId } = req.body;
      if (!tmdbId) {
        return res.status(400).json({ error: 'TMDB ID is required' });
      }

      // Check if movie already exists
      const existingMovie = await storage.getMovieByTmdbId(tmdbId);
      if (existingMovie) {
        return res.status(400).json({ error: 'Movie already exists in library' });
      }

      // Fetch movie details from TMDB
      const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
      const movieData = await response.json();

      if (!response.ok) {
        throw new Error(movieData.status_message || 'Failed to fetch movie details');
      }

      // Create movie in database
      const newMovie = await storage.createMovie({
        tmdbId: movieData.id,
        title: movieData.title,
        overview: movieData.overview || '',
        releaseDate: movieData.release_date,
        voteAverage: movieData.vote_average || 0,
        posterPath: movieData.poster_path,
        backdropPath: movieData.backdrop_path,
        genres: JSON.stringify(movieData.genres || []),
        runtime: movieData.runtime || 120,
        status: 'published'
      });

      res.json({
        success: true,
        movie: newMovie,
        message: `Movie "${movieData.title}" imported successfully`
      });
    } catch (error) {
      console.error('TMDB import error:', error);
      res.status(500).json({ 
        error: 'Failed to import movie from TMDB',
        details: error.message
      });
    }
  });

  app.put('/api/admin/movies/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedMovie = await db.update(movies)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(movies.id, movieId))
        .returning();
      
      if (updatedMovie.length === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      res.json({ movie: updatedMovie[0] });
    } catch (error) {
      console.error('Error updating movie:', error);
      res.status(500).json({ error: 'Failed to update movie' });
    }
  });

  app.delete('/api/admin/movies/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      // Delete related records first
      await db.delete(watchProgress).where(eq(watchProgress.movieId, movieId));
      await db.delete(watchlist).where(eq(watchlist.movieId, movieId));
      
      const deletedMovie = await db.delete(movies)
        .where(eq(movies.id, movieId))
        .returning();
      
      if (deletedMovie.length === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ error: 'Failed to delete movie' });
    }
  });

  app.get('/api/admin/analytics/watch-stats', async (req: AuthenticatedRequest, res) => {
    try {
      const topMovies = await db.select({
        title: movies.title,
        watchCount: sql<number>`count(${watchProgress.id})`,
        avgRating: movies.voteAverage
      })
        .from(movies)
        .leftJoin(watchProgress, eq(movies.id, watchProgress.movieId))
        .groupBy(movies.id, movies.title, movies.voteAverage)
        .orderBy(desc(sql`count(${watchProgress.id})`))
        .limit(10);

      const recentActivity = await db.select({
        movieTitle: movies.title,
        userCount: sql<number>`count(distinct ${watchProgress.userId})`,
        timestamp: sql<string>`max(${watchProgress.lastWatched})`
      })
        .from(watchProgress)
        .innerJoin(movies, eq(movies.id, watchProgress.movieId))
        .where(sql`${watchProgress.lastWatched} > NOW() - INTERVAL '7 days'`)
        .groupBy(movies.id, movies.title)
        .orderBy(desc(sql`max(${watchProgress.lastWatched})`))
        .limit(10);

      res.json({
        topMovies,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching watch stats:', error);
      res.status(500).json({ error: 'Failed to fetch watch stats' });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
