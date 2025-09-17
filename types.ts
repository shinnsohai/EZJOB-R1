export enum UserRole {
    WORKER = 'WORKER',
    EMPLOYER = 'EMPLOYER',
}

export interface User {
    id: string;
    identifier: string; // Can be email or phone number
    role: UserRole;
}

export interface AuthContextType {
    user: User | null;
    login: (authUser: import('./services/authService').AuthUser) => void;
    logout: () => void;
}

export interface WorkerProfile {
    id: string;
    user_id: string;
    full_name: string;
    trade_or_skill: string;
    experience_years: number;
    cv_url?: string;
    summary?: string;
    composite_score?: number; // For AI-based ranking
    country_of_origin: string;
    experience_in_country: number;
}

export interface EmployerProfile {
    id: string;
    user_id: string;
    company_name: string;
    description?: string;
}

export interface Job {
    id: string;
    employer_id: string;
    employer_name: string;
    title: string;
    description: string;
    required_skills: string[];
    status: 'Active' | 'On Hold' | 'Closed';
    location: string;
    country: string;
    salary_min: number;
    salary_max: number;
}

export interface Application {
    id: string;
    job_id: string;
    worker_id: string;
    status: 'Submitted' | 'Viewed' | 'Shortlisted';
}