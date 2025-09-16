
import React, { useState } from 'react';
import type { WorkerProfile } from '../types';
import { useAuth } from '../App';
import { createWorkerProfile, updateWorkerProfile } from '../services/dataService';
import { countries } from '../data/countries';

const WorkerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<WorkerProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        
        const formData = new FormData(e.currentTarget);
        
        const profileData = {
            user_id: user!.id,
            full_name: formData.get('full_name') as string,
            trade_or_skill: formData.get('trade_or_skill') as string,
            experience_years: parseInt(formData.get('experience_years') as string, 10),
            summary: `Experienced ${formData.get('trade_or_skill')} with ${formData.get('experience_years')} years of professional experience.`,
            country_of_origin: formData.get('country_of_origin') as string,
            experience_in_country: parseInt(formData.get('experience_in_country') as string, 10),
        };
        
        if (profile) {
            // Update existing profile
            updateWorkerProfile(profile.id, profileData).then((updatedProfile) => {
                if (updatedProfile) {
                    setProfile(updatedProfile);
                }
            });
        } else {
            // Create new profile
            createWorkerProfile(profileData).then((newProfile) => {
                if (newProfile) {
                    setProfile(newProfile);
                }
            });
        }
        
        setIsEditing(false);
    };

    if (!profile && !isEditing) {
        return (
            <div className="text-center bg-white p-10 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Dashboard!</h2>
                <p className="mt-2 text-gray-600">Create your "Skill Passport" to start applying for jobs.</p>
                <button onClick={() => setIsEditing(true)} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    Create Your Profile
                </button>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{profile ? 'Edit' : 'Create'} Your Profile</h2>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="full_name" id="full_name" defaultValue={profile?.full_name} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="trade_or_skill" className="block text-sm font-medium text-gray-700">Primary Trade or Skill</label>
                        <input type="text" name="trade_or_skill" id="trade_or_skill" defaultValue={profile?.trade_or_skill} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">Total Years of Experience</label>
                        <input type="number" name="experience_years" id="experience_years" defaultValue={profile?.experience_years} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                    {/* FIX: Add form fields for country_of_origin and experience_in_country to be collected. */}
                    <div>
                        <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700">Country of Origin</label>
                        <select name="country_of_origin" id="country_of_origin" defaultValue={profile?.country_of_origin || ''} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="" disabled>Select a country</option>
                            {countries.map(country => (
                                <option key={country.code} value={country.name}>{country.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="experience_in_country" className="block text-sm font-medium text-gray-700">Years of Experience in Current Country</label>
                        <input type="number" name="experience_in_country" id="experience_in_country" defaultValue={profile?.experience_in_country} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="cv_upload" className="block text-sm font-medium text-gray-700">Upload CV (Optional)</label>
                        <input type="file" name="cv_upload" id="cv_upload" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">Save Profile</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-900">My Skill Passport</h2>
                 <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Edit Profile</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-lg">{profile?.full_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Trade/Skill</p>
                    <p className="font-semibold text-lg">{profile?.trade_or_skill}</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Total Experience</p>
                    <p className="font-semibold text-lg">{profile?.experience_years} years</p>
                </div>
                {/* FIX: Display the new profile fields. */}
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Country of Origin</p>
                    <p className="font-semibold text-lg">{profile?.country_of_origin}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Experience in Current Country</p>
                    <p className="font-semibold text-lg">{profile?.experience_in_country} years</p>
                </div>
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">My Applications</h3>
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
