"use client";

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
  return (
    <Popover
      label={`Options for ${name}`}
      align="end"
      menu
      trigger={({ toggle, ref, open, panelId }) => (
        <button
          ref={ref}
          type="button"
          className="iconbtn"
          aria-label={`Options for ${name}`}
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
            Move up
          </MenuItem>
          <MenuItem
            icon="arrowDown"
            disabled={index === total - 1}
            onClick={() => {
              onShift(index + 1);
              close();
            }}
          >
            Move down
          </MenuItem>
          <MenuItem
            icon="trash"
            danger
            onClick={() => {
              close();
              onDelete();
            }}
          >
            Delete
          </MenuItem>
        </>
      )}
    </Popover>
  );
}
