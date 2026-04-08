"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = {
  label: string;
  value: string;
};

export type ListFilterBarProps = {
  /** Search input value */
  searchValue?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Callback when search changes */
  onSearchChange?: (value: string) => void;
  /** Status filter options */
  statusOptions?: FilterOption[];
  /** Current status filter value */
  statusValue?: string;
  /** Status filter label */
  statusLabel?: string;
  /** Callback when status changes */
  onStatusChange?: (value: string) => void;
  /** Date filter options */
  dateOptions?: FilterOption[];
  /** Current date filter value */
  dateValue?: string;
  /** Date filter label */
  dateLabel?: string;
  /** Callback when date changes */
  onDateChange?: (value: string) => void;
  /** Custom filter controls */
  customFilters?: React.ReactNode;
  /** Whether any filters are active */
  hasActiveFilters?: boolean;
  /** Reset all filters callback */
  onReset?: () => void;
  /** Total results count */
  resultCount?: number;
  /** Result count label */
  resultLabel?: string;
  /** Compact mode for tight spaces */
  compact?: boolean;
  className?: string;
};

/**
 * ListFilterBar - Consistent search and filter controls for operational lists
 * 
 * Pattern:
 * - Search input on the left
 * - Filter controls in the middle
 * - Result count and reset on the right
 * 
 * Use for:
 * - Queue pages
 * - List pages
 * - Admin tables
 * - Any operational list that needs filtering
 */
export function ListFilterBar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  statusOptions,
  statusValue,
  statusLabel = "Status",
  onStatusChange,
  dateOptions,
  dateValue,
  dateLabel = "Date",
  onDateChange,
  customFilters,
  hasActiveFilters,
  onReset,
  resultCount,
  resultLabel = "items",
  compact = false,
  className,
}: ListFilterBarProps) {
  const showSearch = onSearchChange != null;
  const showStatus = statusOptions && statusOptions.length > 0 && onStatusChange;
  const showDate = dateOptions && dateOptions.length > 0 && onDateChange;
  const showReset = hasActiveFilters && onReset;
  const showResults = resultCount != null;

  // Auto-detect active filters if not explicitly provided
  const isFiltered = hasActiveFilters ?? (
    (searchValue && searchValue.length > 0) ||
    (statusValue && statusValue !== "all") ||
    (dateValue && dateValue !== "all")
  );

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          )}
          {(showStatus || showDate || customFilters) && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          )}
        </div>
        {(isFiltered || showResults) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {showResults && (
              <span>
                {resultCount} {resultLabel}
              </span>
            )}
            {isFiltered && onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Left: Search */}
      {showSearch && (
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Middle: Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {showStatus && (
          <Select value={statusValue} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={statusLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {statusLabel}s</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showDate && (
          <Select value={dateValue} onValueChange={onDateChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={dateLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              {dateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {customFilters}
      </div>

      {/* Right: Results & Reset */}
      <div className="flex items-center gap-3">
        {showResults && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {resultCount} {resultLabel}
          </span>
        )}
        
        {showReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact filter summary for mobile or dense UIs
 */
export function FilterSummary({
  search,
  status,
  date,
  onClear,
  className,
}: {
  search?: string;
  status?: string;
  date?: string;
  onClear?: () => void;
  className?: string;
}) {
  const hasFilters = search || status || date;
  
  if (!hasFilters) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      <span className="text-muted-foreground">Filters:</span>
      
      {search && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
          Search: {search}
        </span>
      )}
      
      {status && status !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
          Status: {status}
        </span>
      )}
      
      {date && date !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
          Date: {date}
        </span>
      )}
      
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs text-primary hover:underline ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
