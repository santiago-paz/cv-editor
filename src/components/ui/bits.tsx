"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../icons";

/** A label over a box. */
export function Field({
  label,
  htmlFor,
  hint,
  aside,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  /** Something at the right of the label, such as a count. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={"field" + (className ? ` ${className}` : "")}>
      {(label || aside) && (
        <div className="field-head">
          {htmlFor ? (
            <label className="field-label" htmlFor={htmlFor}>
              {label}
            </label>
          ) : (
            <span className="field-label">{label}</span>
          )}
          {aside}
        </div>
      )}
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

/** A square button with an icon and a name for screen readers and the tooltip. */
export function IconButton({
  icon,
  label,
  danger,
  flow,
  className,
  ...rest
}: {
  icon: IconName;
  label: string;
  danger?: boolean;
  /** Takes part in the Enter flow. */
  flow?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "title">) {
  return (
    <button
      type="button"
      {...rest}
      className={"iconbtn" + (danger ? " danger" : "") + (className ? ` ${className}` : "")}
      aria-label={label}
      title={label}
      data-flow={flow ? "" : undefined}
    >
      <Icon name={icon} />
    </button>
  );
}

/** A line of a menu: an icon, a name, and what it does. */
export function MenuItem({
  icon,
  danger,
  hint,
  children,
  ...rest
}: {
  icon?: IconName;
  danger?: boolean;
  /** A second, quieter line under the name. */
  hint?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button type="button" role="menuitem" {...rest} className={"menu-item" + (danger ? " danger" : "")}>
      {icon && <Icon name={icon} />}
      <span className="menu-text">
        {children}
        {hint && <small>{hint}</small>}
      </span>
    </button>
  );
}

/** "+ Add a job": a button that adds a row and takes part in the Enter flow. */
export function AddButton({
  children,
  flow = true,
  ...rest
}: { children: ReactNode; flow?: boolean } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button type="button" {...rest} className={"add" + (rest.className ? ` ${rest.className}` : "")} data-flow={flow ? "" : undefined}>
      <Icon name="plus" size={14} />
      {children}
    </button>
  );
}
