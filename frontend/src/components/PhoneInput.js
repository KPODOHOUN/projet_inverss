import { useMemo, useState } from 'react';
import COUNTRIES, { flagEmoji } from '../data/countries';

// Splits a stored "+229 90123456"-style string into a dial code (matched
// against the longest known prefix, since +1 / +1242 / +1876 etc. overlap)
// and the rest, so editing an existing phone number pre-selects the right
// country instead of dumping everything into the number field.
const splitPhone = (value) => {
  const v = (value || '').trim();
  if (!v.startsWith('+')) return { dial: '', rest: v };
  const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
    .find(c => v.startsWith(c.dial));
  if (!match) return { dial: '', rest: v };
  return { dial: match.dial, rest: v.slice(match.dial.length).trim() };
};

// Dial-code select + local-number input, combined into one "+229 90123456"
// string via onChange — the rest of the app still just sees a single phone
// string, no schema change needed.
const DEFAULT_SELECT_CLASS = 'w-28 shrink-0 px-2 py-3 bg-black border-2 border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors';
const DEFAULT_INPUT_CLASS = 'flex-1 min-w-0 px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors';

export default function PhoneInput({ value, onChange, placeholder, selectClassName, inputClassName }) {
  const initial = useMemo(() => splitPhone(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [dial, setDial] = useState(initial.dial);
  const [rest, setRest] = useState(initial.rest);

  const emit = (nextDial, nextRest) => {
    const combined = nextDial ? `${nextDial} ${nextRest}`.trim() : nextRest;
    onChange(combined);
  };

  return (
    <div className="flex gap-2">
      <select
        value={dial}
        onChange={e => { setDial(e.target.value); emit(e.target.value, rest); }}
        className={selectClassName || DEFAULT_SELECT_CLASS}
      >
        <option value="">—</option>
        {COUNTRIES.map(c => (
          <option key={c.iso2} value={c.dial}>{flagEmoji(c.iso2)} {c.dial}</option>
        ))}
      </select>
      <input
        type="tel"
        value={rest}
        onChange={e => { setRest(e.target.value); emit(dial, e.target.value); }}
        placeholder={placeholder || '90 12 34 56'}
        className={inputClassName || DEFAULT_INPUT_CLASS}
      />
    </div>
  );
}
