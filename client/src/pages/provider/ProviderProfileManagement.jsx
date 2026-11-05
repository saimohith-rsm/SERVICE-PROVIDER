import React, { useState } from 'react';
import { Briefcase, MapPin, Award, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProviderProfileManagement = () => {
  const { provider, refreshMe } = useAuth();

  const [businessName, setBusinessName] = useState(provider?.businessName || '');
  const [description, setDescription] = useState(provider?.description || '');
  const [experience, setExperience] = useState(provider?.experience || 1);
  const [serviceAreas, setServiceAreas] = useState(
    provider?.serviceAreas || ['Guntur', 'Brodipet', 'Arundelpet']
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const allAreas = [
    'Guntur',
    'Brodipet',
    'Arundelpet',
    'Lakshmipuram',
    'Syamala Nagar',
    'Koretipadu',
    'Vidyanagar',
    'Amaravati',
    'Vijayawada',
  ];

  const toggleArea = (area) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (serviceAreas.length === 0) {
      setError('Please select at least one active service area.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put('/providers/profile', {
        businessName,
        description,
        experience: Number(experience),
        serviceAreas,
      });

      if (res.data.success) {
        setMessage('Your business credentials and service locations have been saved.');
        await refreshMe();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update business profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Business Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update how customers discover your trade name and coverage areas in Guntur.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Business / Trade Name
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Years of Professional Experience
          </label>
          <input
            type="number"
            min="0"
            required
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Overview & Professional Bio
          </label>
          <textarea
            rows="3"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <MapPin size={14} className="text-teal-600" /> Active Service Localities (Guntur & AP)
          </label>
          <div className="flex flex-wrap gap-2">
            {allAreas.map((area) => {
              const selected = serviceAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {selected ? '✓ ' : '+ '}
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Update Business Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProviderProfileManagement;

