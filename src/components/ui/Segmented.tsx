"use client";

import { useId } from "react";

/** One choice out of a few, drawn as a row of buttons. They stay real radio
    buttons, so the arrow keys move between them and screen readers read them
    as a group. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const name = useId();
  return (
    <div className={"seg" + (className ? ` ${className}` : "")} role="radiogroup" aria-label={label}>
      {options.map(option => (
        <label key={option.value} title={option.hint}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
