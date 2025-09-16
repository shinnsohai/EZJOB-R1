import { supabase } from '../lib/supabase';
import type { Job, WorkerProfile } from '../types';

export const getJobs = async (query: string = ""): Promise<Job[]> => {
    try {
        let queryBuilder = supabase
            .from('jobs')
            .select('*')
            .eq('status', 'Active');

        if (query.trim()) {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,required_skills.cs.{${query}}`);
        }

        const { data, error } = await queryBuilder;
        
        if (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
};

export const createJob = async (jobData: Omit<Job, 'id'>): Promise<Job | null> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .insert([jobData])
            .select()
            .single();

        if (error) {
            console.error('Error creating job:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating job:', error);
        return null;
    }
};

export const updateJobStatus = async (jobId: string, status: 'Active' | 'On Hold' | 'Closed'): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('jobs')
            .update({ status })
            .eq('id', jobId);

        if (error) {
            console.error('Error updating job status:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating job status:', error);
        return false;
    }
};

export const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (error) {
            console.error('Error deleting job:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting job:', error);
        return false;
    }
};

export const getWorkerProfiles = async (jobTitle: string = "", jobCountry: string = ""): Promise<WorkerProfile[]> => {
    try {
        let queryBuilder = supabase
            .from('worker_profiles')
            .select('*');

        if (jobTitle.trim()) {
            queryBuilder = queryBuilder.ilike('trade_or_skill', `%${jobTitle}%`);
        }

        if (jobCountry.trim()) {
            queryBuilder = queryBuilder.or(`country_of_origin.ilike.%${jobCountry}%,experience_in_country.gt.0`);
        }

        const { data, error } = await queryBuilder;
        
        if (error) {
            console.error('Error fetching worker profiles:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error fetching worker profiles:', error);
        return [];
    }
};

export const createWorkerProfile = async (profileData: Omit<WorkerProfile, 'id'>): Promise<WorkerProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('worker_profiles')
            .insert([profileData])
            .select()
            .single();

        if (error) {
            console.error('Error creating worker profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating worker profile:', error);
        return null;
    }
};

export const updateWorkerProfile = async (profileId: string, profileData: Partial<WorkerProfile>): Promise<WorkerProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('worker_profiles')
            .update(profileData)
            .eq('id', profileId)
            .select()
            .single();

        if (error) {
            console.error('Error updating worker profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error updating worker profile:', error);
        return null;
    }
};

export const getEmployerJobs = async (employerId: string): Promise<Job[]> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('employer_id', employerId);

        if (error) {
            console.error('Error fetching employer jobs:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching employer jobs:', error);
        return [];
    }
};