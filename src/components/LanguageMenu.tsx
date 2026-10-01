"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LANG, LANGS, LANG_NAMES, type Lang } from "@/lib/i18n";
import { chooseLang, currentLang, subscribeLang } from "@/lib/i18n/store";
import { Icon } from "./icons";
import { Popover } from "./ui/Popover";

/* The language the editor speaks. A globe and the language's code in the bar,
   and a short list under it, each language in its own name so a person can find
   theirs on a page they cannot read. It needs no translated text beyond the
   one word for its label, so the privacy page uses it too, and gives the word
   in every language. */

export default function LanguageMenu({ label: given }: { label: string | Record<Lang, string> }) {
  const lang = useSyncExternalStore(subscribeLang, currentLang, () => DEFAULT_LANG);
  const label = typeof given === "string" ? given : given[lang];
  const name = `${label}: ${LANG_NAMES[lang]}`;

  return (
    <Popover
      label={label}
      align="end"
      menu
      className="menu-lang"
      trigger={({ toggle, ref, open, panelId }) => (
        <button
          ref={ref}
          type="button"
          className="btn quiet"
          aria-label={name}
          title={name}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={toggle}
        >
          <Icon name="globe" />
          <span className="hide-narrow" translate="no">
            {lang.toUpperCase()}
          </span>
        </button>
      )}
    >
      {({ close }) =>
        LANGS.map(id => {
          const on = id === lang;
          return (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={on}
              lang={id}
              data-autofocus={on || undefined}
              className={"menu-item" + (on ? " on" : "")}
              onClick={() => {
                chooseLang(id);
                close();
              }}
            >
              <span className="menu-text" translate="no">
                {LANG_NAMES[id]}
              </span>
              {on && <Icon name="check" size={15} />}
            </button>
          );
        })
      }
    </Popover>
  );
}
