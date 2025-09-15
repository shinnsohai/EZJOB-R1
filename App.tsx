
import React, { useState, createContext, useContext, useMemo, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { User, AuthContextType } from './types';
import { UserRole } from './types';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSearchPage from './pages/JobSearchPage';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = useCallback((identifier: string, role: UserRole) => {
        const mockUser: User = {
            id: crypto.randomUUID(),
            identifier, // Can be email or phone
            role,
        };
        setUser(mockUser);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const ProtectedRoute: React.FC<{ children: React.ReactElement; role: UserRole }> = ({ children, role }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};


function App() {
    return (
        <AuthProvider>
            <HashRouter>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<AuthPage mode="login" />} />
                            <Route path="/register" element={<AuthPage mode="register" />} />
                            <Route path="/jobs" element={<JobSearchPage />} />

                            <Route 
                                path="/worker/dashboard" 
                                element={
                                    <ProtectedRoute role={UserRole.WORKER}>
                                        <WorkerDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            <Route 
                                path="/employer/dashboard" 
                                element={
                                    <ProtectedRoute role={UserRole.EMPLOYER}>
                                        <EmployerDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </HashRouter>
        </AuthProvider>
    );
}

export default App;