"use client";

import { useState, type ReactNode } from "react";
import type { Cv } from "@/lib/cv/types";
import { useSuggest } from "../suggest-context";
import type { Say, Update } from "../types";
import { Field } from "../ui/bits";
import { Combo } from "../ui/Combo";
import { LinksEditor } from "./Links";

/* The first step: who you are and how to reach you. The name, the job title
   and the place each take a few letters and Enter. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function YouStep({ cv, update, say, photo }: { cv: Cv; update: Update; say: Say; photo: ReactNode }) {
  const suggest = useSuggest();
  const person = cv.person;
  const [emailTouched, setEmailTouched] = useState(false);

  const set = (key: keyof Cv["person"]) => (value: string) =>
    update(draft => {
      draft.person[key] = value;
    });

  const emailBad = emailTouched && person.email.trim() !== "" && !EMAIL.test(person.email.trim());

  return (
    <>
      <header className="pane-head">
        <h2 className="pane-title">About you</h2>
        <p className="pane-help">
          Type a few letters, then press <kbd className="key inline">↵</kbd>. It fills in and moves on.
        </p>
      </header>

      {photo}

      <div className="fields">
        <Field label="Name" htmlFor="you-name">
          <Combo
            id="you-name"
            value={person.name}
            onChange={set("name")}
            field="person.name"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Alex Moreno"
          />
        </Field>
        <Field label="Job title" htmlFor="you-role">
          <Combo
            id="you-role"
            value={person.role}
            onChange={set("role")}
            suggest={suggest.title}
            field="person.role"
            placeholder="Senior Frontend Engineer"
          />
        </Field>
        <Field label="Location" htmlFor="you-location">
          <Combo
            id="you-location"
            value={person.location}
            onChange={set("location")}
            suggest={suggest.city}
            openOnFocus
            field="person.location"
            placeholder="Berlin, Germany"
          />
        </Field>
        <div className="two">
          <Field
            label="Email"
            htmlFor="you-email"
            hint={emailBad ? <span className="bad-hint">This does not look like an email address.</span> : undefined}
          >
            <Combo
              id="you-email"
              value={person.email}
              onChange={set("email")}
              suggest={suggest.email}
              field="person.email"
              inputMode="email"
              autoCapitalize="none"
              placeholder="alex@gmail.com"
              aria-invalid={emailBad || undefined}
              onBlur={() => setEmailTouched(true)}
            />
          </Field>
          <Field label="Phone" htmlFor="you-phone">
            <Combo
              id="you-phone"
              type="tel"
              value={person.phone}
              onChange={set("phone")}
              field="person.phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+49 30 1234 5678"
            />
          </Field>
        </div>
      </div>

      <section className="block" aria-labelledby="you-links">
        <h3 className="block-title" id="you-links">
          Links
        </h3>
        <LinksEditor
          links={cv.links}
          path="links"
          say={say}
          edit={recipe =>
            update(draft => {
              recipe(draft.links);
            })
          }
        />
      </section>
    </>
  );
}
