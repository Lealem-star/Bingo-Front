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
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Main Post Creation Area */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-white text-xl font-bold mb-6 text-center">What is in Your Mind?</h2>

                <form onSubmit={submit} className="space-y-4">
                    {/* Upload File Section */}
                    <div className="space-y-2">
                        <label className="text-white/80 text-sm font-medium">Upload {form.kind}</label>
                        <div className="flex gap-2">
                            <select
                                value={form.kind}
                                onChange={e => setForm({ ...form, kind: e.target.value, file: null })}
                                className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                            <input
                                type="file"
                                accept={form.kind === 'image' ? 'image/*' : 'video/*'}
                                onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                            />
                        </div>
                        {form.file && (
                            <div className="text-white/60 text-sm">
                                Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
                    </div>

                    {/* Write Your Message Section */}
                    <div className="space-y-2">
                        <label className="text-white/80 text-sm font-medium">Write Your Message</label>
                        <textarea
                            value={form.caption}
                            onChange={e => setForm({ ...form, caption: e.target.value })}
                            placeholder="Write your announcement or message here..."
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            id="active"
                            type="checkbox"
                            checked={form.active}
                            onChange={e => setForm({ ...form, active: e.target.checked })}
                            className="w-4 h-4 text-amber-500 bg-white/10 border-white/20 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="active" className="text-white/80 text-sm">Make this post active</label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || !form.file}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Post Announcement'}
                    </button>
                </form>
            </div>

            {/* Recent Posts */}
            <div className="space-y-3">
                <h3 className="text-white text-lg font-semibold">Recent Posts</h3>
                <div className="space-y-2">
                    {posts.map(p => (
                        <div key={p._id} className="p-4 rounded-lg bg-white/5 border border-white/10 text-white">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-amber-400">{p.kind.toUpperCase()}</div>
                                <div className="opacity-70 text-sm">{new Date(p.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="truncate opacity-90 text-sm mb-2">{p.url || p.filename || 'File uploaded'}</div>
                            {p.caption ? <div className="opacity-80 text-sm mb-2">{p.caption}</div> : null}
                            <div className="flex justify-between items-center">
                                <span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {p.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="text-center text-white/60 py-8">
                            No posts yet. Create your first announcement!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
