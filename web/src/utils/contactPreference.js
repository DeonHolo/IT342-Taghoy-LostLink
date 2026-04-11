/** Matches backend ContactPreferenceCodec (platform|||details). */
export const CONTACT_SEP = '|||';

export function encodeContactPreference(platform, details) {
  const p = (platform ?? '').trim();
  const d = (details ?? '').trim();
  if (!p && !d) return '';
  return p + CONTACT_SEP + d;
}

export function decodeContactPreference(stored) {
  if (stored == null || String(stored).trim() === '') {
    return { platform: '', details: '' };
  }
  const s = String(stored);
  const i = s.indexOf(CONTACT_SEP);
  if (i < 0) {
    return { platform: '', details: s.trim() };
  }
  return {
    platform: s.slice(0, i).trim(),
    details: s.slice(i + CONTACT_SEP.length).trim(),
  };
}

/** Between platform and details (avoids "Contact: Foo: Bar" double-colon look). */
export const CONTACT_DISPLAY_SEP = ' \u2013 '; // en dash

export function formatContactLine(platform, details, legacyPreference) {
  const p = (platform ?? '').trim();
  const d = (details ?? '').trim();
  if (p && d) return `${p}${CONTACT_DISPLAY_SEP}${d}`;
  if (d) return d;
  if (p) return p;
  const leg = (legacyPreference ?? '').trim();
  if (!leg) return '';
  const dec = decodeContactPreference(leg);
  if (dec.platform && dec.details) {
    return `${dec.platform}${CONTACT_DISPLAY_SEP}${dec.details}`;
  }
  return dec.details || dec.platform || leg;
}
