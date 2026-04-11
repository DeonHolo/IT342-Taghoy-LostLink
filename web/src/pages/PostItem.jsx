import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemService from '../services/ItemService';
import CategoryService from '../services/CategoryService';
import { getProfile, updateProfile } from '../services/api';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { withOthersLast } from '../utils/categoryOrder';
import {
  OTHER_SELECT_VALUE,
  buildPlatformForApi,
  parsePlatformFromStored,
} from '../utils/contactPlatforms';
import ContactPlatformFields from '../components/ContactPlatformFields';

export default function PostItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    CategoryService.getAll()
      .then((data) => setCategories(data.data || data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getProfile();
        const p = res.data?.data;
        if (!p || cancelled) return;
        const plat = parsePlatformFromStored(
          p.contactPlatform ?? ''
        );
        setForm((f) => ({
          ...f,
          platformSelect: plat.platformSelect,
          platformOther: plat.platformOther,
          contactDetails: p.contactDetails ?? f.contactDetails,
        }));
      } catch {
        /* guest or network */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors({ ...fieldErrors, image: 'Image must be under 5MB.' });
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setFieldErrors({ ...fieldErrors, image: 'Only JPEG and PNG allowed.' });
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setFieldErrors({ ...fieldErrors, image: undefined });
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (!form.categoryId) errs.categoryId = 'Select a category.';

    if (form.status === 'FOUND' && !image) {
      errs.image = 'An image is required when reporting a found item.';
    }

    if (!form.currentStatus) {
      errs.currentStatus = 'Select item disposition.';
    }

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
        errs.platformOther = 'Type the platform name.';
      }
      if (!form.contactDetails.trim()) {
        errs.contactDetails = 'Enter your contact details (ID, number, etc.).';
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

    setLoading(true);
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

      const res = await ItemService.createItem(payload);
      const created = res?.data ?? res;
      const newId = created?.id;

      if (image && newId) {
        await ItemService.uploadImage(newId, image);
      }

      if (form.currentStatus === 'HOLDING') {
        try {
          await updateProfile({
            contactPlatform: buildPlatformForApi(
              form.platformSelect,
              form.platformOther
            ),
            contactDetails: form.contactDetails.trim(),
          });
        } catch {
          /* item already created; profile sync is best-effort */
        }
      }

      setSuccess(true);
      setTimeout(() => navigate('/feed'), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.error?.details ||
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details?.image ||
        'Failed to post item. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 ${
      fieldErrors[field]
        ? 'border-maroon-400 bg-maroon-50/30'
        : 'border-zinc-300'
    }`;

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#166534' }} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Item Posted</h2>
            <p className="text-sm text-zinc-500">
              Your report is now live on the campus feed.
            </p>
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
            Report an Item
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Fill in the details below to report a lost or found item on campus.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-maroon-50 border border-maroon-200 text-sm text-maroon-800 animate-fade-in-up">
            <ErrorOutlineIcon sx={{ fontSize: 18, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 animate-fade-in-up stagger-1"
        >
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
                {s === 'LOST' ? 'I Lost Something' : 'I Found Something'}
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
              placeholder="e.g. Black Casio Calculator"
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
              placeholder="Describe the item in detail..."
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
                placeholder="e.g. 3rd Floor RTL, Study Area"
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
                { value: 'HOLDING', label: 'I\'m holding it', desc: 'You currently have the item.' },
                { value: 'SURRENDERED', label: 'Surrendered to office', desc: 'Dropped off at a campus office.' },
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
                  <span className="block text-xs text-zinc-500 mt-0.5">
                    {opt.desc}
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
                placeholder="e.g. Library Front Desk, Front Gate Guard"
                className={inputClass('dropoffLocation')}
              />
              {fieldErrors.dropoffLocation && (
                <p className="text-xs text-maroon-600">{fieldErrors.dropoffLocation}</p>
              )}
            </div>
          )}

          {form.currentStatus === 'HOLDING' && (
            <div className="space-y-3 animate-fade-in-up">
              <p className="text-xs text-zinc-500">
                Pulled from your profile when available. Saving here updates your profile too.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ContactPlatformFields
                  platformSelect={form.platformSelect}
                  platformOther={form.platformOther}
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
                    setFieldErrors({
                      ...fieldErrors,
                      platformOther: undefined,
                    });
                    if (error) setError('');
                  }}
                  fieldErrors={fieldErrors}
                  inputClass={inputClass}
                  selectId="post-contactPlatformSelect"
                  otherId="post-contactPlatformOther"
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
                    placeholder="e.g. @your.name, 09XX-XXX-XXXX"
                    className={inputClass('contactDetails')}
                  />
                  {fieldErrors.contactDetails && (
                    <p className="text-xs text-maroon-600">{fieldErrors.contactDetails}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Photo{' '}
              {form.status === 'FOUND' ? (
                <span className="text-maroon-600">(required)</span>
              ) : (
                <span className="text-zinc-400">(optional)</span>
              )}
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-900/70 text-white hover:bg-zinc-900/90 transition-all cursor-pointer"
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 ${
                  fieldErrors.image
                    ? 'border-maroon-400 bg-maroon-50/30'
                    : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                }`}
              >
                <CloudUploadOutlinedIcon
                  sx={{ fontSize: 32, color: '#a1a1aa' }}
                />
                <span className="text-sm text-zinc-500">
                  Click to upload (JPEG, PNG, max 5MB)
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="hidden"
            />
            {fieldErrors.image && (
              <p className="text-xs text-maroon-600">{fieldErrors.image}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-gold-500 text-maroon-950 hover:bg-gold-400 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_12px_rgba(201,162,39,0.3)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-maroon-950/30 border-t-maroon-950 rounded-full animate-spin" />
                Posting...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
