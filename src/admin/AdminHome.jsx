import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api/client';

export default function AdminHome() {
    const [posts, setPosts] = useState([]);
    const [form, setForm] = useState({ kind: 'image', file: null, caption: '', active: true });
    const [uploading, setUploading] = useState(false);

    const load = async () => {
        const data = await apiFetch('/admin/posts');
        setPosts(data.posts || []);
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.file) {
            alert('Please select a file to upload');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('kind', form.kind);
            formData.append('file', form.file);
            formData.append('caption', form.caption);
            formData.append('active', form.active);

            await apiFetch('/admin/posts', {
                method: 'POST',
                body: formData,
                headers: {} // Let the browser set Content-Type for FormData
            });

            setForm({ kind: 'image', file: null, caption: '', active: true });
            load();
        } catch (error) {
            console.error('Upload failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                formData: {
                    kind: form.kind,
                    file: form.file ? {
                        name: form.file.name,
                        size: form.file.size,
                        type: form.file.type
                    } : null,
                    caption: form.caption,
                    active: form.active
                }
            });
            alert(`Upload failed: ${error.message}. Please try again.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Premium Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
                <div className="relative px-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-white to-purple-100 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                <img src="/lb.png" alt="Love Bingo Logo" className="w-10 h-10" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                            <p className="text-purple-200 text-sm font-medium">Content Management</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Post Creation Area */}
            <div className="px-4 mb-8">
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl border-b border-white/20 p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent mb-2">
                                Create Announcement
                            </h2>
                            <p className="text-purple-200 text-sm">Share updates with your players</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Upload File Section */}
                            <div className="space-y-4">
                                <label className="text-white font-bold text-lg flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    Upload {form.kind}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select
                                            value={form.kind}
                                            onChange={e => setForm({ ...form, kind: e.target.value, file: null })}
                                            className="w-full px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 transition-all duration-300 shadow-lg"
                                        >
                                            <option value="image">📷 Image</option>
                                            <option value="video">🎥 Video</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept={form.kind === 'image' ? 'image/*' : 'video/*'}
                                            onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                            className="w-full px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400/50 transition-all duration-300 shadow-lg file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-amber-500 file:to-orange-500 file:text-white hover:file:from-amber-600 hover:file:to-orange-600"
                                        />
                                    </div>
                                </div>
                                {form.file && (
                                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-4 border border-green-400/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">File Selected</p>
                                                <p className="text-white/70 text-sm">{form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Write Your Message Section */}
                            <div className="space-y-4">
                                <label className="text-white font-bold text-lg flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    Write Your Message
                                </label>
                                <textarea
                                    value={form.caption}
                                    onChange={e => setForm({ ...form, caption: e.target.value })}
                                    placeholder="Write your announcement or message here..."
                                    rows={4}
                                    className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 resize-none transition-all duration-300 shadow-lg"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <input
                                            id="active"
                                            type="checkbox"
                                            checked={form.active}
                                            onChange={e => setForm({ ...form, active: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <label htmlFor="active" className="flex items-center cursor-pointer">
                                            <div className={`relative w-14 h-8 rounded-full transition-all duration-300 ${form.active ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-white/20'}`}>
                                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${form.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                    <div>
                                        <label htmlFor="active" className="text-white font-semibold cursor-pointer">
                                            Make this post active
                                        </label>
                                        <p className="text-white/60 text-sm">Players will see this announcement</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={uploading || !form.file}
                                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-8 py-5 rounded-2xl font-black text-lg hover:from-amber-600 hover:via-orange-600 hover:to-red-600 transition-all duration-300 shadow-2xl shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Uploading...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Post Announcement
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Premium Recent Posts */}
            <div className="px-4 pb-8">
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 backdrop-blur-xl border-b border-white/20 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Recent Posts</h3>
                                <p className="text-purple-200 text-sm">Manage your announcements</p>
                            </div>
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="p-6">
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {posts.map(p => (
                                    <div key={p._id} className="group relative overflow-hidden">
                                        <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:border-white/30">
                                            {/* Post Header */}
                                            <div className="p-6 border-b border-white/10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${p.kind === 'image' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {p.kind === 'image' ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                )}
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-lg">{p.kind.toUpperCase()}</p>
                                                            <p className="text-white/60 text-sm">Media Post</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.active ? 'bg-green-500/20 text-green-400 border border-green-400/30' : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'}`}>
                                                        {p.active ? '✅ Active' : '⏸️ Inactive'}
                                                    </span>
                                                </div>
                                                <div className="text-white/60 text-sm">
                                                    {new Date(p.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Post Content */}
                                            <div className="p-6">
                                                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                                                    <p className="text-white/80 text-sm font-medium">📁 {p.url || p.filename || 'File uploaded'}</p>
                                                </div>
                                                {p.caption && (
                                                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/20">
                                                        <p className="text-white text-sm leading-relaxed">💬 {p.caption}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hover Effect Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
                                <p className="text-white/60">Create your first announcement to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
