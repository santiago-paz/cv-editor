"use client";

import { useState } from "react";
import { link } from "@/lib/cv/defaults";
import type { Link } from "@/lib/cv/types";
import { printedLink } from "@/lib/suggest/contact";
import { useT } from "../i18n";
import { useSuggest } from "../suggest-context";
import type { Say } from "../types";
import { AddButton, IconButton } from "../ui/bits";
import { Combo } from "../ui/Combo";
import { changeThenFocus, flowStep } from "../ui/flow";

/* A list of links, each one box: type "link", pick a site, finish the address.
   What prints is the address itself, without "https://", unless the person
   chooses their own text. Enter on the last link starts the next; Enter on an
   empty one moves on. */

export function LinksEditor({
  links,
  path,
  edit,
  say,
  max = 12,
  addLabel,
}: {
  links: Link[];
  /** The path of one link is `${path}.${id}`. */
  path: string;
  edit: (recipe: (list: Link[]) => void) => void;
  say: Say;
  max?: number;
  addLabel?: string;
}) {
  const t = useT();
  const suggest = useSuggest();
  const [custom, setCustom] = useState<Record<string, boolean>>({});

  function add(at: number) {
    const made = link();
    changeThenFocus(
      () =>
        edit(list => {
          list.splice(at, 0, made);
        }),
      `[data-field="${path}.${made.id}"]`,
    );
  }

  function remove(index: number) {
    const gone = links[index];
    edit(list => {
      list.splice(index, 1);
    });
    if (gone.url.trim() || gone.label.trim()) {
      say(t.links.deleted, () =>
        edit(list => {
          list.splice(Math.min(index, list.length), 0, gone);
        }),
      );
    }
  }

  function advance(index: number, input: HTMLInputElement) {
    const item = links[index];
    const empty = !item.url.trim() && !item.label.trim();
    if (empty) {
      flowStep(input);
      if (links.length > 1) {
        edit(list => {
          const at = list.findIndex(one => one.id === item.id);
          if (at > -1 && !list[at].url.trim() && !list[at].label.trim()) list.splice(at, 1);
        });
      }
      return;
    }
    if (index === links.length - 1 && links.length < max) add(index + 1);
    else flowStep(input);
  }

  const set = (id: string, key: "label" | "url") => (value: string) =>
    edit(list => {
      const target = list.find(one => one.id === id);
      if (target) target[key] = value;
    });

  return (
    <div className="links">
      {links.map((item, index) => {
        const showLabel = !!item.label || custom[item.id];
        return (
          <div key={item.id} className="link-row" data-row={item.id}>
            <div className="link-line">
              <Combo
                value={item.url}
                onChange={set(item.id, "url")}
                suggest={suggest.link}
                openOnFocus
                field={`${path}.${item.id}`}
                inputMode="url"
                aria-label={t.links.label(index + 1)}
                placeholder={index === 0 ? "linkedin.com/in/you" : "github.com/you"}
                onAdvance={input => advance(index, input)}
              />
              <IconButton icon="close" label={t.links.delete(index + 1)} danger tabIndex={-1} onClick={() => remove(index)} />
            </div>
            {showLabel ? (
              <Combo
                value={item.label}
                onChange={set(item.id, "label")}
                boxClassName="quiet"
                aria-label={t.links.textLabel(index + 1)}
                placeholder={printedLink(item.url) || t.links.textPlaceholder}
                onAdvance={input => advance(index, input)}
              />
            ) : (
              item.url.trim() && (
                <button type="button" className="text-button" onClick={() => setCustom(current => ({ ...current, [item.id]: true }))}>
                  {t.links.prints(printedLink(item.url))}
                </button>
              )
            )}
          </div>
        );
      })}
      {links.length < max && (
        <AddButton flow={false} onClick={() => add(links.length)}>
          {addLabel ?? t.links.add}
        </AddButton>
      )}
    </div>
  );
}
