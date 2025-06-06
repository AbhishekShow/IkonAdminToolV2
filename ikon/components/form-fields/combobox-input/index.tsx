import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import React from "react";
import { FormComboboxInputProps } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/shadcn/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn/ui/command";

export default function FormComboboxInput({
  formControl,
  name,
  label,
  placeholder,
  formDescription,
  items,
  disabled,
  onSelect,
}: FormComboboxInputProps) {
  return (
    <>
      <FormField
        control={formControl}
        name={name}
        render={({ field }) => (
          <FormItem className="">
            {label && (
              <>
                <FormLabel>{label}</FormLabel>
              </>
            )}
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={
                      disabled == true ||
                      (disabled && disabled(...arguments))
                    }
                  >
                    {field.value
                      ? items.find((item) => item.value === field.value)
                        ?.label || field.value
                      : placeholder}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList >
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          value={item.label || item.value}
                          key={item.value}
                          disabled={( item.disabled == true || (item.disabled && item.disabled(item)))}
                          onSelect={(value) => {
                            field.onChange(item.value);
                            onSelect && onSelect(value);
                          }}
                        >
                          {item?.label || item.value}
                          <Check
                            className={cn(
                              "ml-auto",
                              item.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {formDescription && (
              <FormDescription>{formDescription}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
