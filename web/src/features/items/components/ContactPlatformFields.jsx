import {
  OTHER_SELECT_VALUE,
  platformSelectOptions,
} from '../../../shared/utils/contactPlatforms';

export default function ContactPlatformFields({
  platformSelect,
  platformOther,
  onPlatformSelectChange,
  onPlatformOtherChange,
  fieldErrors = {},
  inputClass,
  selectId = 'contactPlatformSelect',
  otherId = 'contactPlatformOther',
}) {
  const ic = typeof inputClass === 'function' ? inputClass : () => inputClass;

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-medium text-zinc-700">
        Platform
      </label>
      <select
        id={selectId}
        value={platformSelect}
        onChange={(e) => onPlatformSelectChange(e.target.value)}
        className={ic('platformSelect')}
      >
        {platformSelectOptions().map((o) => (
          <option key={o.value === '' ? '_placeholder' : o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {fieldErrors.platformSelect && (
        <p className="text-xs text-maroon-600">{fieldErrors.platformSelect}</p>
      )}

      {platformSelect === OTHER_SELECT_VALUE && (
        <div className="space-y-1.5 pt-1">
          <label htmlFor={otherId} className="block text-sm font-medium text-zinc-700">
            Specify platform
          </label>
          <input
            id={otherId}
            type="text"
            value={platformOther}
            onChange={(e) => onPlatformOtherChange(e.target.value)}
            placeholder="e.g. Instagram, Telegram, Viber"
            className={ic('platformOther')}
          />
          {fieldErrors.platformOther && (
            <p className="text-xs text-maroon-600">{fieldErrors.platformOther}</p>
          )}
        </div>
      )}
    </div>
  );
}
