import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getActivity } from '../services/api';
import { formatContactLine } from '../utils/contactPreference';
import Navbar from '../components/Navbar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArticleIcon from '@mui/icons-material/Article';

function StatCard({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 px-5 rounded-2xl bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</span>
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function Profile() {
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    contactPlatform: '',
    contactDetails: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setFeedback(null);
    try {
      const profileRes = await getProfile();
      const p = profileRes.data?.data;
      if (!profileRes.data?.success || !p) {
        setFeedback({
          type: 'error',
          message: profileRes.data?.error?.details || profileRes.data?.error?.message || 'Failed to load profile.',
        });
        return;
      }
      setProfile(p);
      setForm({
        firstName: p?.firstName || '',
        lastName: p?.lastName || '',
        studentId: p?.studentId || '',
        contactPlatform: p?.contactPlatform ?? '',
        contactDetails: p?.contactDetails ?? '',
      });
    } catch (err) {
      const detail =
        err.response?.data?.error?.details ||
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach the API. Is the backend running on port 8080?' : null);
      setFeedback({
        type: 'error',
        message: detail || 'Failed to load profile data.',
      });
      return;
    } finally {
      setLoading(false);
    }

    try {
      const activityRes = await getActivity();
      if (activityRes.data?.success) {
        setActivity(activityRes.data.data);
      }
    } catch {
      // Profile already loaded; activity is optional
      setActivity(null);
      setFeedback({
        type: 'error',
        message: 'Profile loaded, but activity stats could not be loaded. Try refreshing.',
      });
    }
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { ...form };

      if (showPasswordSection && passwordForm.newPassword) {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setFeedback({ type: 'error', message: 'New passwords do not match.' });
          setSaving(false);
          return;
        }
        if (passwordForm.newPassword.length < 6) {
          setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
          setSaving(false);
          return;
        }
        payload.currentPassword = passwordForm.currentPassword;
        payload.newPassword = passwordForm.newPassword;
      }

      const res = await updateProfile(payload);
      if (res.data?.success) {
        setProfile(res.data.data);
        setEditing(false);
        setShowPasswordSection(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setFeedback({ type: 'success', message: 'Profile updated successfully.' });

        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...stored,
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
        }));
      } else {
        setFeedback({ type: 'error', message: res.data?.error?.details || res.data?.error?.message || 'Update failed.' });
      }
    } catch (err) {
      const detail = err.response?.data?.error?.detail;
      setFeedback({ type: 'error', message: detail || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[80dvh] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-maroon-200 border-t-maroon-700 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-[820px] mx-auto px-4 sm:px-6 py-10">
        {feedback && (
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-fade-in-up ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'bg-red-50 text-red-800 border border-red-200/60'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            )}
            {feedback.message}
          </div>
        )}

        <section className="bg-white rounded-3xl border border-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-900 px-6 sm:px-8 py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border-2 border-gold-500/40 flex items-center justify-center shadow-lg">
                  <PersonOutlineIcon sx={{ fontSize: 32, color: '#e6bb3a' }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <p className="text-sm text-maroon-200 mt-1">{profile?.email}</p>
                  {profile?.role && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      {profile.role}
                    </span>
                  )}
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-maroon-100 bg-white/10 hover:bg-white/20 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                >
                  <EditOutlinedIcon sx={{ fontSize: 14 }} />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6">
            {activity && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <StatCard label="Total Posts" value={activity.totalPosts} accent="text-maroon-800" />
                <StatCard label="Lost" value={activity.lostCount} accent="text-red-600" />
                <StatCard label="Found" value={activity.foundCount} accent="text-emerald-600" />
              </div>
            )}

            {!editing ? (
              <div className="space-y-5">
                <InfoRow label="First Name" value={profile?.firstName} />
                <InfoRow label="Last Name" value={profile?.lastName} />
                <InfoRow label="Student ID" value={profile?.studentId || 'Not set'} muted={!profile?.studentId} />
                <InfoRow
                  label="Contact Preference"
                  value={
                    formatContactLine(
                      profile?.contactPlatform,
                      profile?.contactDetails,
                      profile?.contactPreference
                    ) || 'Not set'
                  }
                  muted={
                    !formatContactLine(
                      profile?.contactPlatform,
                      profile?.contactDetails,
                      profile?.contactPreference
                    )
                  }
                />
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in-up">
                <FormField label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
                <FormField label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
                <FormField label="Student ID" value={form.studentId} onChange={(v) => setForm({ ...form, studentId: v })} placeholder="e.g. 20-1234-567" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Contact — Platform"
                    value={form.contactPlatform}
                    onChange={(v) => setForm({ ...form, contactPlatform: v })}
                    placeholder="e.g. MS Teams, Phone"
                  />
                  <FormField
                    label="Contact — Details"
                    value={form.contactDetails}
                    onChange={(v) => setForm({ ...form, contactDetails: v })}
                    placeholder="e.g. @name, 09XX-XXX-XXXX"
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="flex items-center gap-2 text-sm font-medium text-maroon-700 hover:text-maroon-900 transition-colors cursor-pointer"
                  >
                    <LockOutlinedIcon sx={{ fontSize: 16 }} />
                    {showPasswordSection ? 'Cancel password change' : 'Change password'}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="space-y-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60 animate-fade-in-up">
                    <FormField
                      label="Current Password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(v) => setPasswordForm({ ...passwordForm, currentPassword: v })}
                    />
                    <FormField
                      label="New Password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(v) => setPasswordForm({ ...passwordForm, newPassword: v })}
                    />
                    <FormField
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(v) => setPasswordForm({ ...passwordForm, confirmPassword: v })}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-maroon-800 text-white hover:bg-maroon-700 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer active:scale-[0.97]"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setShowPasswordSection(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setForm({
                        firstName: profile?.firstName || '',
                        lastName: profile?.lastName || '',
                        studentId: profile?.studentId || '',
                        contactPlatform: profile?.contactPlatform ?? '',
                        contactDetails: profile?.contactDetails ?? '',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {activity?.recentPosts?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 flex items-center gap-2">
              <ArticleIcon sx={{ fontSize: 20, color: '#7B1113' }} />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activity.recentPosts.map((post, i) => (
                <a
                  key={post.id}
                  href={`/items/${post.id}`}
                  className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-maroon-200 hover:shadow-md transition-all duration-200 animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{post.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{post.location || 'No location'}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      post.status === 'LOST'
                        ? 'bg-red-50 text-red-700 border border-red-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {post.status}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function InfoRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className={`text-sm font-semibold ${muted ? 'text-zinc-400 italic' : 'text-zinc-900'}`}>{value}</span>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400"
      />
    </div>
  );
}
