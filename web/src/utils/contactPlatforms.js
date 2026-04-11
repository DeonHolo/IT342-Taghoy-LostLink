/** Canonical values stored in contactPlatform (API / DB). */
export const PLATFORM_PRESETS = ['Facebook', 'MS Teams', 'Email', 'Phone'];

export const OTHER_SELECT_VALUE = '__OTHER__';

export function platformSelectOptions() {
  return [
    { value: '', label: 'Select platform' },
    ...PLATFORM_PRESETS.map((p) => ({ value: p, label: p })),
    { value: OTHER_SELECT_VALUE, label: 'Other' },
  ];
}

/**
 * Map stored contactPlatform string → select value + optional "Other" text.
 */
export function parsePlatformFromStored(stored) {
  const s = (stored ?? '').trim();
  if (!s) return { platformSelect: '', platformOther: '' };
  const found = PLATFORM_PRESETS.find((p) => p.toLowerCase() === s.toLowerCase());
  if (found) return { platformSelect: found, platformOther: '' };
  return { platformSelect: OTHER_SELECT_VALUE, platformOther: s };
}

/** Value sent as contactPlatform to the API. */
export function buildPlatformForApi(platformSelect, platformOther) {
  if (!platformSelect) return '';
  if (platformSelect === OTHER_SELECT_VALUE) return (platformOther ?? '').trim();
  return platformSelect;
}
