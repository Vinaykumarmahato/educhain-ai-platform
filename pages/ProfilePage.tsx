
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Icons } from '../constants';
import { uploadToCloudinary } from '../services/cloudinary';
import { mockApi } from '../services/mockApi';

interface ProfilePageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            // Save to backend immediately
            const updatedUser = await mockApi.updateProfile({
                ...formData,
                avatar: url
            });

            setFormData(prev => ({ ...prev, avatar: url }));
            onUpdateUser(updatedUser);
        } catch (error: any) {
            console.error('Upload failed', error);
            if (error.response) {
                alert(`Failed: Server responded with status ${error.response.status}. ${JSON.stringify(error.response.data)}`);
            } else {
                alert(`Failed to update profile image: ${error.message}`);
            }
        } finally {
            setUploading(false);
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return 'System Administrator';
            case UserRole.TEACHER: return 'Faculty Member';
            case UserRole.STUDENT: return 'Undergraduate Student';
            default: return 'User';
        }
    };

    const handleSave = async () => {
        try {
            const updatedUser = await mockApi.updateProfile({
                fullName: formData.fullName,
                email: formData.email
            });
            onUpdateUser(updatedUser);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Failed to save profile', error);
            if (error.response) {
                alert(`Failed: Server responded with status ${error.response.status}. ${JSON.stringify(error.response.data)}`);
            } else {
                alert(`Failed to save profile changes: ${error.message}`);
            }
        }
    };

    const handleImageClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        } else {
            // Optional: alert user or just do nothing
            alert("Click 'Edit Profile' to change your photo.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Institutional Profile</h2>
                    <p className="text-slate-500 font-medium text-sm">Manage your enterprise identity and preferences.</p>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isEditing ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white shadow-slate-900/20'
                        }`}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Card: Summary */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm flex flex-col items-center text-center">
                        <div className={`relative mb-6 group ${isEditing ? 'cursor-pointer' : 'cursor-default'}`} onClick={handleImageClick}>
                            <img
                                src={formData.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=4f46e5&color=fff&size=128`}
                                alt="avatar"
                                className={`w-32 h-32 rounded-[40px] object-cover ring-8 ring-slate-50 shadow-2xl transition-all ${uploading ? 'opacity-50 grayscale' : ''}`}
                            />
                            {isEditing && (
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                                    {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Icons.Edit className="w-4 h-4" />}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">{user.fullName}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{getRoleLabel(user.role)}</p>

                        <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">ID</span>
                                <span className="font-black text-slate-900">{user.username}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Status</span>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-black uppercase text-[8px]">Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl">
                        <h4 className="text-sm font-black uppercase tracking-widest mb-4">Security Notice</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium"> Your account is protected by enterprise-grade encryption. Last login: Just now from Kolkata, India. </p>
                    </div>
                </div>

                {/* Right Card: Settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Information</h4>
                            <Icons.ClipboardList className="text-slate-300 w-5 h-5" />
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
                                    <input
                                        type="text"
                                        readOnly={!isEditing}
                                        className={`w-full px-5 py-4 rounded-2xl border-2 transition-all text-sm font-black ${isEditing ? 'border-blue-100 bg-white focus:border-blue-500' : 'border-slate-50 bg-slate-50 text-slate-600'
                                            }`}
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional ID</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 text-sm font-black cursor-not-allowed"
                                        value={formData.username}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email Address</label>
                                <input
                                    type="email"
                                    readOnly={!isEditing}
                                    className={`w-full px-5 py-4 rounded-2xl border-2 transition-all text-sm font-black ${isEditing ? 'border-blue-100 bg-white focus:border-blue-500' : 'border-slate-50 bg-slate-50 text-slate-600'
                                        }`}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Portal Preferences</h5>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Email Notifications', desc: 'Receive daily academic digests', active: true },
                                        { label: 'Two-Factor Auth', desc: 'Secure your institutional workspace', active: false },
                                        { label: 'Dark Portal Mode', desc: 'Optimize UI for low-light environments', active: false }
                                    ].map((pref, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div>
                                                <p className="text-xs font-black text-slate-900">{pref.label}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pref.desc}</p>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative transition-all ${pref.active ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pref.active ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
