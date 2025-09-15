
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const Logo = () => (
        <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-2xl font-bold text-slate-800">EZJOB</span>
        </Link>
    );

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Logo />
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {user?.role === UserRole.WORKER && (
                                <>
                                    <Link to="/worker/dashboard" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                    <Link to="/jobs" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Find Jobs</Link>
                                </>
                            )}
                            {user?.role === UserRole.EMPLOYER && (
                                <Link to="/employer/dashboard" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                            )}
                            {!user && <Link to="/jobs" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Find Jobs</Link>}
                        </div>
                    </div>
                    <div className="hidden md:block">
                        {user ? (
                            <div className="flex items-center space-x-4">
                               <span className="text-sm text-gray-500">{user.identifier}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;