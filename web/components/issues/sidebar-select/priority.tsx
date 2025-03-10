import React from "react";

// ui
import { CustomSelect, PriorityIcon } from "@plane/ui";
// types
import { TIssuePriorities } from "types";
// constants
import { PRIORITIES } from "constants/project";

type Props = {
  value: TIssuePriorities;
  onChange: (val: TIssuePriorities) => void;
  disabled?: boolean;
};

export const SidebarPrioritySelect: React.FC<Props> = ({ value, onChange, disabled = false }) => (
  <CustomSelect
    customButton={
      <div
        className={`flex items-center gap-1 text-left text-xs capitalize rounded px-2 py-0.5 ${
          value === "urgent"
            ? "border-red-500/20 bg-red-500/20 text-red-500"
            : value === "high"
            ? "border-orange-500/20 bg-orange-500/20 text-orange-500"
            : value === "medium"
            ? "border-yellow-500/20 bg-yellow-500/20 text-yellow-500"
            : value === "low"
            ? "border-green-500/20 bg-green-500/20 text-green-500"
            : "bg-custom-background-80 border-custom-border-200 text-custom-text-200"
        }`}
      >
        <span className="flex items-center justify-center h-4 w-4 overflow-hidden">
          <PriorityIcon priority={value} transparentBg={true} className={`w-3.5 h-3.5 ${(value === "urgent" || value === "none") ? 'p-0.5' : '-mt-1'} `} />
        </span>
        <span>{value ?? "None"}</span>
      </div>
    }
    value={value}
    onChange={onChange}
    optionsClassName="w-min"
    disabled={disabled}
  >
    {PRIORITIES.map((option) => (
      <CustomSelect.Option key={option} value={option} className="capitalize">
        <>
          <PriorityIcon priority={option} />
          {option ?? "None"}
        </>
      </CustomSelect.Option>
    ))}
  </CustomSelect>
);
