"use client";

import { resetAll } from "@/lib/store";

export function ResetButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Erase every plan, stay and checklist change saved in this browser?")) resetAll();
      }}
      className="font-mono text-[11px] tracking-[0.2em] uppercase underline-offset-4 transition-colors duration-150 hover:text-red hover:underline"
    >
      Reset this issue
    </button>
  );
}
