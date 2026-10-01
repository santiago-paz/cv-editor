"use client";

import { useT } from "../i18n";
import { Icon } from "../icons";
import { MenuItem } from "../ui/bits";
import { Popover } from "../ui/Popover";

/** The three dots on a card: move it up or down, or delete it. */
export function CardMenu({
  name,
  index,
  total,
  onShift,
  onDelete,
}: {
  name: string;
  index: number;
  total: number;
  onShift: (to: number) => void;
  onDelete: () => void;
}) {
  const t = useT();
  return (
    <Popover
      label={t.card.options(name)}
      align="end"
      menu
      trigger={({ toggle, ref, open, panelId }) => (
        <button
          ref={ref}
          type="button"
          className="iconbtn"
          aria-label={t.card.options(name)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={toggle}
        >
          <Icon name="more" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <MenuItem
            icon="up"
            disabled={index === 0}
            onClick={() => {
              onShift(index - 1);
              close();
            }}
          >
            {t.card.moveUp}
          </MenuItem>
          <MenuItem
            icon="arrowDown"
            disabled={index === total - 1}
            onClick={() => {
              onShift(index + 1);
              close();
            }}
          >
            {t.card.moveDown}
          </MenuItem>
          <MenuItem
            icon="trash"
            danger
            onClick={() => {
              close();
              onDelete();
            }}
          >
            {t.common.delete}
          </MenuItem>
        </>
      )}
    </Popover>
  );
}
