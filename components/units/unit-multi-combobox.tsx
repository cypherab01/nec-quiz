"use client";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type UnitOption = { code: string; name: string };

export function UnitMultiCombobox({
  options,
  value,
  onChange,
  disabled,
}: {
  options: UnitOption[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    const map = new Map(options.map((o) => [o.code, o]));
    return value.map((c) => map.get(c)).filter(Boolean) as UnitOption[];
  }, [options, value]);

  function toggle(code: string) {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
    } else {
      onChange([...value, code]);
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value.length === 0
              ? "Select unit(s)…"
              : `${value.length} unit(s) selected`}
            <ChevronsUpDownIcon className="ml-2 size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search units…" />
            <CommandList>
              <CommandEmpty>No units found.</CommandEmpty>
              {options.map((o) => {
                const isSelected = value.includes(o.code);
                return (
                  <CommandItem
                    key={o.code}
                    value={`${o.code} ${o.name}`}
                    onSelect={() => toggle(o.code)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-mono text-xs">{o.code}</span>
                    <span className="ml-2 text-sm">{o.name}</span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((u) => (
            <Badge key={u.code} variant="secondary" className="gap-1">
              <span className="font-mono">{u.code}</span>
              <button
                type="button"
                className="ml-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => onChange(value.filter((c) => c !== u.code))}
                aria-label={`Remove ${u.code}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onChange([])}
          >
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}


