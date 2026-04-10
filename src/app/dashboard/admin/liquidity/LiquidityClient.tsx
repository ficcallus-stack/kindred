"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialIcon } from '@/components/MaterialIcon';
import { cn } from '@/lib/utils';
import { injectGhostNanny, injectSyntheticParent, spawnSyntheticJob } from './actions';
import { useToast } from '@/components/Toast';

interface Props {
  initialGhostUsers: any[];
  initialSyntheticJobs: any[];
}

export default function LiquidityClient({ initialGhostUsers, initialSyntheticJobs }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Form States
  const [nannyForm, setNannyForm] = useState({
    email: '',
    fullName: '',
    location: '',
    bio: '',
    hourlyRate: '25',
    experienceYears: 5,
  });

  const [parentForm, setParentForm] = useState({
    email: '',
    fullName: '',
    location: '',
    bio: '',
  });

  const [jobForm, setJobForm] = useState({
    parentId: '',
    title: '',
    description: '',
    budget: '$20 - $30/hr',
    location: '',
  });

  const ghostParents = initialGhostUsers.filter(u => u.role === 'parent');

  const handleInjectNanny = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('nanny');
    try {
      await injectGhostNanny(nannyForm);
      showToast("Ghost Nanny injected successfully", "success");
      setNannyForm({ email: '', fullName: '', location: '', bio: '', hourlyRate: '25', experienceYears: 5 });
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(null);
    }
  };

  const handleInjectParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('parent');
    try {
      await injectSyntheticParent(parentForm);
      showToast("Synthetic Parent injected successfully", "success");
      setParentForm({ email: '', fullName: '', location: '', bio: '' });
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(null);
    }
  };

  const handleSpawnJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('job');
    try {
      await spawnSyntheticJob(jobForm);
      showToast("Synthetic Job spawned successfully", "success");
      setJobForm({ parentId: '', title: '', description: '', budget: '$20 - $30/hr', location: '' });
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <MaterialIcon name="magic_button" className="text-primary" fill />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/50">Liquidity Engine</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-primary font-headline">The Dark Arts</h1>
          <p className="text-slate-500 mt-1 font-medium">Manufacturing marketplace supply and demand velocity.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
          <div className="flex flex-col items-end px-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ghosts</span>
            <span className="text-xl font-black text-primary">{initialGhostUsers.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex flex-col items-end px-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthetic Jobs</span>
            <span className="text-xl font-black text-primary">{initialSyntheticJobs.length}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nanny Injector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border p-8 shadow-sm flex flex-col h-full"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <MaterialIcon name="person_add" />
            </div>
            <div>
              <h3 className="font-bold text-primary">Inject Ghost Nanny</h3>
              <p className="text-xs text-slate-400">Manual supply seeding</p>
            </div>
          </div>
          <form onSubmit={handleInjectNanny} className="space-y-4 flex-1">
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Full Name" value={nannyForm.fullName} onChange={e => setNannyForm({...nannyForm, fullName: e.target.value})} required
            />
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Email address" type="email" value={nannyForm.email} onChange={e => setNannyForm({...nannyForm, email: e.target.value})} required
            />
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Location (City, ST)" value={nannyForm.location} onChange={e => setNannyForm({...nannyForm, location: e.target.value})} required
            />
            <div className="flex gap-4">
              <input 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="Rate ($)" value={nannyForm.hourlyRate} onChange={e => setNannyForm({...nannyForm, hourlyRate: e.target.value})} required
              />
              <input 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="Exp (Years)" type="number" value={nannyForm.experienceYears} onChange={e => setNannyForm({...nannyForm, experienceYears: parseInt(e.target.value)})} required
              />
            </div>
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
              placeholder="Professional Bio" value={nannyForm.bio} onChange={e => setNannyForm({...nannyForm, bio: e.target.value})} required
            />
            <button 
              disabled={loading === 'nanny'}
              className="w-full py-4 bg-primary text-white rounded-[1.5rem] font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading === 'nanny' ? 'Injecting...' : 'Inject verified Elite Nanny'}
            </button>
          </form>
        </motion.div>

        {/* Parent Injector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] border p-8 shadow-sm flex flex-col h-full"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <MaterialIcon name="group_add" />
            </div>
            <div>
              <h3 className="font-bold text-primary">Inject Synthetic Parent</h3>
              <p className="text-xs text-slate-400">Demand source creation</p>
            </div>
          </div>
          <form onSubmit={handleInjectParent} className="space-y-4 flex-1">
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Family Name" value={parentForm.fullName} onChange={e => setParentForm({...parentForm, fullName: e.target.value})} required
            />
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Email address" type="email" value={parentForm.email} onChange={e => setParentForm({...parentForm, email: e.target.value})} required
            />
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Geographic Target" value={parentForm.location} onChange={e => setParentForm({...parentForm, location: e.target.value})} required
            />
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
              placeholder="Family Overview/Bio" value={parentForm.bio} onChange={e => setParentForm({...parentForm, bio: e.target.value})} required
            />
            <div className="flex-1" />
            <button 
              disabled={loading === 'parent'}
              className="w-full py-4 bg-amber-600 text-white rounded-[1.5rem] font-bold text-sm shadow-lg shadow-amber-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {loading === 'parent' ? 'Creating...' : 'Create Synthetic Parent'}
            </button>
          </form>
        </motion.div>

        {/* Job Spawner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] border p-8 shadow-sm flex flex-col h-full bg-slate-900 text-white"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-secondary">
              <MaterialIcon name="auto_awesome" />
            </div>
            <div>
              <h3 className="font-bold text-white">Spawning Pool</h3>
              <p className="text-xs text-white/40">Instant Job Emission</p>
            </div>
          </div>
          <form onSubmit={handleSpawnJob} className="space-y-4 flex-1">
            <select 
              className="w-full bg-white/5 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-secondary/50 font-medium text-white"
              value={jobForm.parentId} onChange={e => setJobForm({...jobForm, parentId: e.target.value})} required
            >
              <option value="" disabled className="text-slate-950">Select Synthetic Parent</option>
              {ghostParents.map(p => (
                <option key={p.id} value={p.id} className="text-slate-950">{p.fullName}</option>
              ))}
            </select>
            <input 
              className="w-full bg-white/5 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-white/20 focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
              placeholder="Job Title" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} required
            />
            <input 
              className="w-full bg-white/5 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-white/20 focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
              placeholder="Location" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} required
            />
            <input 
              className="w-full bg-white/5 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-white/20 focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
              placeholder="Budget Display ($20-$30/hr)" value={jobForm.budget} onChange={e => setJobForm({...jobForm, budget: e.target.value})} required
            />
            <textarea 
              className="w-full bg-white/5 border-none rounded-2xl px-5 py-3.5 text-sm placeholder:text-white/20 focus:ring-2 focus:ring-secondary/50 transition-all font-medium min-h-[100px]"
              placeholder="Job Description" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required
            />
            <button 
              disabled={loading === 'job'}
              className="w-full py-4 bg-secondary text-on-secondary rounded-[1.5rem] font-bold text-sm shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading === 'job' ? 'Spawning...' : 'Emit Synthetic Job'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* History */}
      <section className="bg-white rounded-[2.5rem] border p-10">
        <h3 className="text-2xl font-black text-primary mb-8 font-headline">Recent Synthetic Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Last 10 Ghost Entities</span>
            <div className="space-y-4">
              {initialGhostUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl border bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", u.role === 'caregiver' ? 'bg-blue-500' : 'bg-amber-500')} />
                    <div>
                      <p className="text-sm font-bold text-primary">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{u.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">ID: {u.id.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Last 10 Synthetic Jobs</span>
            <div className="space-y-4">
              {initialSyntheticJobs.map(j => (
                <div key={j.id} className="p-4 rounded-2xl border bg-slate-900 border-white/10">
                  <p className="text-sm font-bold text-white mb-1">{j.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{j.location}</p>
                    <p className="text-[10px] text-white/40 font-bold">{new Date(j.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
