
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
                Find Your Next Skilled Trade Job.
                <span className="block text-indigo-600">Faster. Smarter. Better.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
                EZJOB connects top-tier skilled workers with the best employers. Powered by AI, we make finding your next opportunity or your next great hire effortless.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={() => navigate('/register', { state: { role: 'WORKER' } })}
                    className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                >
                    I'm a Worker
                </button>
                <button
                    onClick={() => navigate('/register', { state: { role: 'EMPLOYER' } })}
                    className="w-full sm:w-auto bg-slate-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-900 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                >
                    I'm an Employer
                </button>
            </div>
             <div className="mt-16">
                 <Link to="/jobs" className="text-indigo-600 font-semibold hover:underline">
                    Or, browse all available jobs &rarr;
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
