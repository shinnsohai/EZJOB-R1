import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Job, WorkerProfile } from '../types';
import { createJob, getEmployerJobs, updateJobStatus, deleteJob, getWorkerProfiles } from '../services/dataService';
import { useAuth } from '../App';
import Spinner from '../components/Spinner';
import { countries, Country } from '../data/countries';

type View = 'DASHBOARD' | 'NEW_JOB' | 'APPLICANTS' | 'SEARCH_WORKERS';
type JobStatus = 'Active' | 'On Hold' | 'Closed';

const EmployerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<View>('DASHBOARD');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [workers, setWorkers] = useState<WorkerProfile[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());
    const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
    
    // Load employer's jobs on component mount
    useEffect(() => {
        if (user?.id) {
            loadEmployerJobs();
        }
    }, [user?.id]);

    const loadEmployerJobs = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        const employerJobs = await getEmployerJobs(user.id);
        setJobs(employerJobs);
        setIsLoading(false);
    };

    // Country Dropdown State
    const [country, setCountry] = useState('United States');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    
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

    const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.id) return;
        
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const company = formData.get('company') as string;
        const location = formData.get('location') as string;
        const salary_min = parseInt(formData.get('salary_min') as string, 10);
        const salary_max = parseInt(formData.get('salary_max') as string, 10);

        const jobData: Omit<Job, 'id'> = {
            employer_id: user.id,
            employer_name: company,
            title,
            description: `We are looking for a skilled ${title} to join our team at ${company}. This is an excellent opportunity for an experienced professional.`,
            required_skills: [title.toLowerCase(), 'experience', 'professional'],
            status: 'Active',
            location,
            country,
            salary_min,
            salary_max
        };
        
        const newJob = await createJob(jobData);
        if (newJob) {
            setJobs(prev => [...prev, newJob]);
        }
        setIsLoading(false);
        setView('DASHBOARD');
    };

    const fetchAndShowApplicants = useCallback(async (job: Job) => {
        setIsLoading(true);
        setView('APPLICANTS');
        setSelectedJob(job);
        setSelectedApplicants(new Set());
        const fetchedApplicants = await getWorkerProfiles(job.title, job.country);
        setWorkers(fetchedApplicants);
        setIsLoading(false);
    }, []);

    const searchAndRankWorkers = useCallback(async (job: Job) => {
        setIsLoading(true);
        setView('SEARCH_WORKERS');
        setSelectedJob(job);
        setSelectedWorkers(new Set()); // Reset selection
        const rankedWorkers = await getWorkerProfiles(job.title, job.country);
        setWorkers(rankedWorkers);
        setIsLoading(false);
    }, []);

    const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
        const success = await updateJobStatus(jobId, newStatus);
        if (success) {
            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job.id === jobId ? { ...job, status: newStatus } : job
                )
            );
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this job posting? This action cannot be undone.')) {
            const success = await deleteJob(jobId);
            if (success) {
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            }
        }
    };

    const handleToggleWorkerSelection = (workerId: string) => {
        const newSelection = new Set(selectedWorkers);
        if (newSelection.has(workerId)) {
            newSelection.delete(workerId);
        } else {
            newSelection.add(workerId);
        }
        setSelectedWorkers(newSelection);
    };

    const handleSelectAllWorkers = () => {
        if (selectedWorkers.size === workers.length) {
            setSelectedWorkers(new Set());
        } else {
            setSelectedWorkers(new Set(workers.map(w => w.id)));
        }
    };

    const handleToggleApplicantSelection = (workerId: string) => {
        const newSelection = new Set(selectedApplicants);
        if (newSelection.has(workerId)) {
            newSelection.delete(workerId);
        } else {
            newSelection.add(workerId);
        }
        setSelectedApplicants(newSelection);
    };

    const handleSelectAllApplicants = () => {
        if (selectedApplicants.size === workers.length) {
            setSelectedApplicants(new Set());
        } else {
            setSelectedApplicants(new Set(workers.map(w => w.id)));
        }
    };
    
    const CountryDropdown = () => {
        const filteredCountries = countries.filter(
            c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.dial_code.includes(searchTerm)
        );

        const handleCountrySelect = (c: Country) => {
            setCountry(c.name);
            setIsDropdownOpen(false);
            setSearchTerm('');
        };

        return (
             <div className="relative" ref={dropdownRef}>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <button 
                    type="button" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-left"
                >
                   <span className="flex justify-between items-center">
                        <span>{country}</span>
                        <span>&#9662;</span>
                   </span>
                </button>
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                                        {c.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        const statusClasses = {
            Active: "bg-green-100 text-green-800",
            'On Hold': "bg-yellow-100 text-yellow-800",
            Closed: "bg-gray-100 text-gray-800",
        };
        return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
    };
    
    const JobStatusControl: React.FC<{ job: Job }> = ({ job }) => {
        const buttonClasses = "text-xs font-medium py-1 px-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        const activeClasses = "bg-green-200 text-green-900 hover:bg-green-300";
        const onHoldClasses = "bg-yellow-200 text-yellow-900 hover:bg-yellow-300";
        const closedClasses = "bg-gray-200 text-gray-900 hover:bg-gray-300";

        return (
            <div className="flex items-center gap-2">
                <button onClick={() => handleStatusChange(job.id, 'Active')} disabled={job.status === 'Active'} className={`${buttonClasses} ${activeClasses}`}>Active</button>
                <button onClick={() => handleStatusChange(job.id, 'On Hold')} disabled={job.status === 'On Hold'} className={`${buttonClasses} ${onHoldClasses}`}>On Hold</button>
                <button onClick={() => handleStatusChange(job.id, 'Closed')} disabled={job.status === 'Closed'} className={`${buttonClasses} ${closedClasses}`}>Close</button>
            </div>
        )
    };

    const renderContent = () => {
        switch (view) {
            case 'NEW_JOB':
                return (
                    <div>
                        <button onClick={() => setView('DASHBOARD')} className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-500">&larr; Back to Dashboard</button>
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Job Posting</h2>
                            <form onSubmit={handleCreateJob} className="space-y-6">
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input type="text" name="company" id="company" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                                    <input type="text" name="title" id="title" required placeholder="e.g., Senior Plumber" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Work Location</label>
                                    <input type="text" name="location" id="location" required placeholder="e.g., San Francisco, CA" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <CountryDropdown />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700">Minimum Salary (Annual)</label>
                                        <input type="number" name="salary_min" id="salary_min" required placeholder="e.g., 50000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                    </div>
                                    <div>
                                        <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700">Maximum Salary (Annual)</label>
                                        <input type="number" name="salary_max" id="salary_max" required placeholder="e.g., 70000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">Our AI will generate a detailed description and required skills based on your job title.</p>
                                <p className="text-sm text-gray-500">You can edit the job details after creation.</p>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                                        {isLoading ? <Spinner size="sm" /> : 'Create Job'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'APPLICANTS':
                 return (
                    <div>
                        <button onClick={() => setView('DASHBOARD')} className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-500">&larr; Back to Dashboard</button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Applicants for {selectedJob?.title}</h2>
                        {isLoading ? (
                            <div className="text-center py-10"><Spinner size="lg" /><p className="mt-2 text-gray-500">Loading applicants...</p></div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            onChange={handleSelectAllApplicants}
                                            checked={workers.length > 0 && selectedApplicants.size === workers.length}
                                        />
                                        <label className="ml-3 text-sm font-medium text-gray-700">
                                            {selectedApplicants.size > 0 ? `${selectedApplicants.size} selected` : 'Select All'}
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => alert(`Shortlisted ${selectedApplicants.size} applicants!`)}
                                            disabled={selectedApplicants.size === 0}
                                            className="bg-indigo-600 text-white font-bold text-sm py-2 px-3 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                        >
                                            Shortlist Selected
                                        </button>
                                         <button 
                                            onClick={() => alert(`Rejected ${selectedApplicants.size} applicants!`)}
                                            disabled={selectedApplicants.size === 0}
                                            className="bg-red-600 text-white font-bold text-sm py-2 px-3 rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                                        >
                                            Reject Selected
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {workers.map(app => (
                                        <div key={app.id} className={`bg-white p-4 rounded-lg shadow-md transition-all ${selectedApplicants.has(app.id) ? 'ring-2 ring-indigo-500' : ''}`}>
                                            <div className="flex items-start">
                                                <input 
                                                    type="checkbox"
                                                    className="h-4 w-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedApplicants.has(app.id)}
                                                    onChange={() => handleToggleApplicantSelection(app.id)}
                                                />
                                                <div className="ml-4 flex-grow">
                                                     <h3 className="font-bold text-lg">{app.full_name}</h3>
                                                     <p className="text-sm text-indigo-600 font-semibold">{app.trade_or_skill} - {app.experience_years} years total</p>
                                                     <p className="text-xs text-gray-500 mt-1">{app.summary}</p>
                                                     <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 9a9 9 0 019-9" /></svg>
                                                            <span className="ml-1.5">From: <span className="font-semibold text-gray-800">{app.country_of_origin}</span></span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            <span className="ml-1.5"><span className="font-semibold text-gray-800">{app.experience_in_country} years</span> exp. in {selectedJob?.country}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-3">
                                                 <button onClick={() => alert(`Shortlisted ${app.full_name}`)} className="bg-indigo-100 text-indigo-800 text-xs font-bold py-1 px-3 rounded-md hover:bg-indigo-200">Shortlist</button>
                                                 <button onClick={() => alert(`Rejected ${app.full_name}`)} className="bg-red-100 text-red-800 text-xs font-bold py-1 px-3 rounded-md hover:bg-red-200">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'SEARCH_WORKERS':
                return (
                    <div>
                        <button onClick={() => setView('DASHBOARD')} className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-500">&larr; Back to Dashboard</button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Search for Workers</h2>
                        <p className="text-gray-600 mb-4">AI-powered search for: <span className="font-semibold">{selectedJob?.title}</span></p>

                         {isLoading ? (
                            <div className="text-center py-10"><Spinner size="lg" /><p className="mt-2 text-gray-500">Searching for workers...</p></div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            onChange={handleSelectAllWorkers}
                                            checked={workers.length > 0 && selectedWorkers.size === workers.length}
                                        />
                                        <label className="ml-3 text-sm font-medium text-gray-700">
                                            {selectedWorkers.size > 0 ? `${selectedWorkers.size} selected` : 'Select All'}
                                        </label>
                                    </div>
                                    <button 
                                        onClick={() => alert(`${selectedWorkers.size} workers have been shortlisted!`)}
                                        disabled={selectedWorkers.size === 0}
                                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                    >
                                        Shortlist Selected
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {workers.map(worker => (
                                        <div key={worker.id} onClick={() => handleToggleWorkerSelection(worker.id)} className={`bg-white p-4 rounded-lg shadow-md flex items-start cursor-pointer transition-all ${selectedWorkers.has(worker.id) ? 'ring-2 ring-indigo-500' : 'ring-1 ring-transparent'}`}>
                                            <input 
                                                type="checkbox"
                                                className="h-4 w-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedWorkers.has(worker.id)}
                                                readOnly
                                            />
                                            <div className="ml-4 flex-grow">
                                                <h3 className="font-bold text-lg">{worker.full_name}</h3>
                                                <p className="text-sm text-indigo-600 font-semibold">{worker.trade_or_skill} - {worker.experience_years} years total</p>
                                                <p className="text-xs text-gray-500 mt-1">{worker.summary}</p>
                                                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 9a9 9 0 019-9" /></svg>
                                                        <span className="ml-1.5">From: <span className="font-semibold text-gray-800">{worker.country_of_origin}</span></span>
                                                    </div>
                                                    <div className="flex items-center">
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        <span className="ml-1.5"><span className="font-semibold text-gray-800">{worker.experience_in_country} years</span> exp. in {selectedJob?.country}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center ml-4 px-4">
                                                <span className="text-xs text-gray-500">Match Score</span>
                                                <span className="text-2xl font-bold text-indigo-600">{worker.composite_score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>
                );
            case 'DASHBOARD':
            default:
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
                            <button onClick={() => setView('NEW_JOB')} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                                + Post New Job
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">My Job Postings</h2>
                            {jobs.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by posting a new job.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map(job => (
                                        <div key={job.id} className="bg-gray-50 p-4 rounded-lg ">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="mb-4 sm:mb-0">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                                        <JobStatusBadge status={job.status} />
                                                    </div>
                                                    <p className="text-sm text-gray-500">{job.employer_name} &middot; {job.location}, {job.country}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button onClick={() => fetchAndShowApplicants(job)} className="bg-indigo-100 text-indigo-800 text-sm font-bold py-2 px-3 rounded-md hover:bg-indigo-200 transition-colors">View Applicants</button>
                                                    <button onClick={() => searchAndRankWorkers(job)} className="bg-gray-100 text-gray-800 text-sm font-bold py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">Search Workers</button>
                                                    {job.status === 'Closed' && (
                                                        <button onClick={() => handleDeleteJob(job.id)} className="bg-red-100 text-red-800 text-sm font-bold py-2 px-3 rounded-md hover:bg-red-200 transition-colors">Delete</button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                 <JobStatusControl job={job} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return <>{renderContent()}</>;
};

export default EmployerDashboard;