
import React, { useState, useEffect, useCallback } from 'react';
import type { Job } from '../types';
import { generateJobs } from '../services/geminiService';
import Spinner from '../components/Spinner';

const JobCard: React.FC<{ job: Job, onApply: () => void }> = ({ job, onApply }) => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold text-indigo-600">{job.employer_name}</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{job.title}</h3>
                </div>
            </div>
             <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{job.location}, {job.country}</span>
                </div>
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 14v3m-4.5-6.5H6a2 2 0 00-2 2v2a2 2 0 002 2h1.5" /></svg>
                    <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                </div>
            </div>
            <p className="text-gray-600 mt-3 text-sm line-clamp-3">{job.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                {job.required_skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">{skill}</span>
                ))}
            </div>
        </div>
        <div className="p-6 bg-gray-50">
             <button onClick={onApply} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                Apply Now
            </button>
        </div>
    </div>
);


const JobSearchPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAppliedMessage, setShowAppliedMessage] = useState(false);

    const fetchJobs = useCallback(async (query: string) => {
        setIsLoading(true);
        const fetchedJobs = await generateJobs(query);
        // Ensure only active jobs are shown to applicants
        setJobs(fetchedJobs.filter(job => job.status === 'Active'));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Fix: Pass an empty string to fetchJobs for the initial load to satisfy the function's signature.
        fetchJobs('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs(searchTerm);
    }

    const handleApply = () => {
        setShowAppliedMessage(true);
        setTimeout(() => setShowAppliedMessage(false), 3000);
    };

    return (
        <div>
             {showAppliedMessage && (
                <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
                    Application submitted successfully!
                </div>
            )}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
                <p className="text-gray-600 mb-4">Search our AI-powered job board for skilled trade positions.</p>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="e.g., 'licensed electrician in new york'"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md shadow-sm hover:bg-indigo-700 transition-colors" disabled={isLoading}>
                        {isLoading ? '...' : 'Search'}
                    </button>
                </form>
            </div>
            {isLoading ? (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600">Our AI is finding the best jobs for you...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} onApply={handleApply}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobSearchPage;