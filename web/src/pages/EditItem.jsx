import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemService from '../services/ItemService';
import CategoryService from '../services/CategoryService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { decodeContactPreference } from '../utils/contactPreference';
import {
  buildPlatformForApi,
  OTHER_SELECT_VALUE,
  parsePlatformFromStored,
} from '../utils/contactPlatforms';
import ContactPlatformFields from '../components/ContactPlatformFields';
import { withOthersLast } from '../utils/categoryOrder';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    categoryId: '',
    status: 'LOST',
    currentStatus: '',
    dropoffLocation: '',
    platformSelect: '',
    platformOther: '',
    contactDetails: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [itemRes, catRes] = await Promise.all([
          ItemService.getItemById(id),
          CategoryService.getAll(),
        ]);

        const item = itemRes.data || itemRes;
        setCategories(catRes.data || catRes || []);

        const dec =
          item.contactPlatform != null || item.contactDetails != null
            ? {
                platform: item.contactPlatform || '',
                details: item.contactDetails || '',
              }
            : decodeContactPreference(item.contactPreference);

        const plat = parsePlatformFromStored(dec.platform);
        setForm({
          title: item.title || '',
          description: item.description || '',
          location: item.location || '',
          categoryId: item.categoryId || '',
          status: item.status || 'LOST',
          currentStatus: item.currentStatus || '',
          dropoffLocation: item.dropoffLocation || '',
          platformSelect: plat.platformSelect,
          platformOther: plat.platformOther,
          contactDetails: dec.details,
        });
      } catch {
        setError('Failed to load item data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }
    if (error) setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (!form.categoryId) errs.categoryId = 'Select a category.';
    if (!form.currentStatus) errs.currentStatus = 'Select item disposition.';

    if (form.currentStatus === 'SURRENDERED' && !form.dropoffLocation.trim()) {
      errs.dropoffLocation = 'Specify where the item was surrendered.';
    }
    if (form.currentStatus === 'HOLDING') {
      if (!form.platformSelect) {
        errs.platformSelect = 'Select a platform.';
      } else if (
        form.platformSelect === OTHER_SELECT_VALUE &&
        !form.platformOther.trim()
      ) {
        errs.platformOther = 'Specify the platform.';
      }
      if (!form.contactDetails.trim()) {
        errs.contactDetails = 'Enter your contact details.';
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        categoryId: Number(form.categoryId),
        status: form.status,
        currentStatus: form.currentStatus,
      };

      if (form.currentStatus === 'SURRENDERED') {
        payload.dropoffLocation = form.dropoffLocation.trim();
      }
      if (form.currentStatus === 'HOLDING') {
        payload.contactPlatform = buildPlatformForApi(
          form.platformSelect,
          form.platformOther
        );
        payload.contactDetails = form.contactDetails.trim();
      }

      await ItemService.updateItem(id, payload);
      setSuccess(true);
      setTimeout(() => navigate(`/items/${id}`), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to update. Try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 ${
      fieldErrors[field]
        ? 'border-maroon-400 bg-maroon-50/30'
        : 'border-zinc-300'
    }`;

  const holdingPlatformFieldErrors = {
    platformSelect: fieldErrors.platformSelect,
    platformOther: fieldErrors.platformOther,
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-stone-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#166534' }} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Item Updated</h2>
            <p className="text-sm text-zinc-500">Redirecting to item page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors mb-6 cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          Back
        </button>

        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900">
            Edit Report
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Update the details of your lost or found report.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-maroon-50 border border-maroon-200 text-sm text-maroon-800 animate-fade-in-up">
            <ErrorOutlineIcon sx={{ fontSize: 18, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up stagger-1">
          <div className="flex gap-3">
            {['LOST', 'FOUND'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  form.status === s
                    ? s === 'LOST'
                      ? 'bg-maroon-900 text-white shadow-[0_2px_12px_rgba(123,17,19,0.25)]'
                      : 'bg-emerald-700 text-white shadow-[0_2px_12px_rgba(22,101,52,0.25)]'
                    : 'bg-white border border-zinc-300 text-zinc-600 hover:border-zinc-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
              Item Title
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass('title')}
            />
            {fieldErrors.title && (
              <p className="text-xs text-maroon-600">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={`${inputClass('description')} resize-none`}
            />
            {fieldErrors.description && (
              <p className="text-xs text-maroon-600">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-sm font-medium text-zinc-700">
                Location
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass('location')}
              />
              {fieldErrors.location && (
                <p className="text-xs text-maroon-600">{fieldErrors.location}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="block text-sm font-medium text-zinc-700">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className={inputClass('categoryId')}
              >
                <option value="">Select category</option>
                {withOthersLast(categories).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name || cat.categoryName}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p className="text-xs text-maroon-600">{fieldErrors.categoryId}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Item Disposition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'HOLDING', label: "I'm holding it" },
                { value: 'SURRENDERED', label: 'Surrendered to office' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, currentStatus: opt.value })
                  }
                  className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    form.currentStatus === opt.value
                      ? 'border-maroon-600 bg-maroon-50/50 ring-1 ring-maroon-200'
                      : 'border-zinc-300 bg-white hover:border-zinc-400'
                  }`}
                >
                  <span className="block text-sm font-medium text-zinc-900">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            {fieldErrors.currentStatus && (
              <p className="text-xs text-maroon-600">{fieldErrors.currentStatus}</p>
            )}
          </div>

          {form.currentStatus === 'SURRENDERED' && (
            <div className="space-y-1.5 animate-fade-in-up">
              <label htmlFor="dropoffLocation" className="block text-sm font-medium text-zinc-700">
                Drop-off Location
              </label>
              <input
                id="dropoffLocation"
                name="dropoffLocation"
                value={form.dropoffLocation}
                onChange={handleChange}
                className={inputClass('dropoffLocation')}
              />
              {fieldErrors.dropoffLocation && (
                <p className="text-xs text-maroon-600">{fieldErrors.dropoffLocation}</p>
              )}
            </div>
          )}

          {form.currentStatus === 'HOLDING' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
              <ContactPlatformFields
                platformSelect={form.platformSelect}
                platformOther={form.platformOther}
                fieldErrors={holdingPlatformFieldErrors}
                onPlatformSelectChange={(value) => {
                  setForm({
                    ...form,
                    platformSelect: value,
                    platformOther:
                      value === OTHER_SELECT_VALUE ? form.platformOther : '',
                  });
                  setFieldErrors({
                    ...fieldErrors,
                    platformSelect: undefined,
                    platformOther: undefined,
                  });
                  if (error) setError('');
                }}
                onPlatformOtherChange={(value) => {
                  setForm({ ...form, platformOther: value });
                  setFieldErrors({ ...fieldErrors, platformOther: undefined });
                  if (error) setError('');
                }}
                inputClass={inputClass}
                selectId="edit-contactPlatformSelect"
                otherId="edit-contactPlatformOther"
              />
              <div className="space-y-1.5">
                <label htmlFor="contactDetails" className="block text-sm font-medium text-zinc-700">
                  Details
                </label>
                <input
                  id="contactDetails"
                  name="contactDetails"
                  value={form.contactDetails}
                  onChange={handleChange}
                  placeholder="e.g. @name, phone number"
                  className={inputClass('contactDetails')}
                />
                {fieldErrors.contactDetails && (
                  <p className="text-xs text-maroon-600">{fieldErrors.contactDetails}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl text-sm font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gold-500 text-maroon-950 hover:bg-gold-400 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_12px_rgba(201,162,39,0.3)] disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-maroon-950/30 border-t-maroon-950 rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
