
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { countries, Country } from '../data/countries';
import { authService } from '../services/authService';
import Spinner from '../components/Spinner';


interface AuthPageProps {
    mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [role, setRole] = useState<UserRole>(UserRole.WORKER);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.role) {
            setRole(location.state.role as UserRole);
        }
    }, [location.state]);
    
    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isRegister = mode === 'register';

    const title = isRegister ? 'Create Your Account' : 'Welcome Back!';
    const subTitle = isRegister
        ? "Join EZJOB to find your next opportunity or hire the best talent."
        : "Log in to access your dashboard.";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        let loginIdentifier = '';
        let isValid = true;

        if (authMethod === 'email') {
            if (!email) {
                setError('Email is required.');
                isValid = false;
            }
            loginIdentifier = email;
        } else { // phone
            if (!phone) {
                setError('Phone number is required.');
                isValid = false;
            }
            loginIdentifier = `${countryCode}${phone}`;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            isValid = false;
        }

        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            let result;
            
            if (isRegister) {
                // Registration
                if (authMethod === 'email') {
                    result = await authService.signUpWithEmail(email, password, role);
                } else {
                    result = await authService.signUpWithPhone(`${countryCode}${phone}`, password, role);
                }
            } else {
                // Login
                if (authMethod === 'email') {
                    result = await authService.signInWithEmail(email, password);
                } else {
                    result = await authService.signInWithPhone(`${countryCode}${phone}`, password);
                }
            }

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            if (result.user) {
                login(result.user);
                const destination = result.user.role === UserRole.WORKER ? '/worker/dashboard' : '/employer/dashboard';
                navigate(destination);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }

        setIsLoading(false);
    };
    
    const AuthMethodToggle = () => (
        <div className="flex justify-center items-center text-sm mb-4">
            <button type="button" onClick={() => setAuthMethod('email')} className={`px-4 py-1 ${authMethod === 'email' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                Use Email
            </button>
            <span className="text-gray-300 mx-2">|</span>
            <button type="button" onClick={() => setAuthMethod('phone')} className={`px-4 py-1 ${authMethod === 'phone' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                Use Phone
            </button>
        </div>
    );
    
    const EmailInput = () => (
         <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
                id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
            />
        </div>
    );
    
    const PhoneInput = () => {
        const filteredCountries = countries.filter(
            country =>
                country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                country.dial_code.substring(1).startsWith(searchTerm) ||
                country.dial_code.startsWith(searchTerm)
        );

        const handleCountrySelect = (country: Country) => {
            setCountryCode(country.dial_code);
            setIsDropdownOpen(false);
            setSearchTerm('');
        };

        return (
             <div className="flex">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        type="button" 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="appearance-none rounded-l-md relative block w-24 px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center"
                    >
                       {countryCode} &#9662;
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-72 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                            <div className="p-2">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <ul>
                                {filteredCountries.map(c => (
                                    <li key={c.code}>
                                        <button 
                                            type="button"
                                            onClick={() => handleCountrySelect(c)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {c.name} ({c.dial_code})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <label htmlFor="phone" className="sr-only">Phone number</label>
                <input
                    id="phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="appearance-none rounded-r-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Phone number"
                />
            </div>
        )
    };

    return (
        <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                        <p className="text-gray-600 mt-2">{subTitle}</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegister && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                                <div className="flex rounded-md shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setRole(UserRole.WORKER)}
                                        className={`flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${role === UserRole.WORKER ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-md border border-gray-300`}
                                    >
                                        Worker
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole(UserRole.EMPLOYER)}
                                        className={`-ml-px flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${role === UserRole.EMPLOYER ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-md border border-gray-300`}
                                    >
                                        Employer
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <AuthMethodToggle />

                        {authMethod === 'email' ? <EmailInput /> : <PhoneInput />}
                       
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isLoading ? <Spinner size="sm" /> : (isRegister ? 'Sign Up' : 'Sign In')}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            {isRegister ? "Already have an account?" : "Don't have an account?"}
                            <Link to={isRegister ? '/login' : '/register'} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                                {isRegister ? 'Sign in' : 'Sign up'}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
