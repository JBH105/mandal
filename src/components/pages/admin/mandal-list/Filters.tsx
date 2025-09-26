import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StatusFilter = "all" | "active" | "inactive";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export const Filters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: FiltersProps) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <Input
        placeholder="Search mandals by name or admin username..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  </div>
);