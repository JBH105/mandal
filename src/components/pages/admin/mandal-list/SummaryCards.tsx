import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

interface SummaryCardsProps {
  total: number;
  active: number;
  inactive: number;
}

export const SummaryCards = ({ total, active, inactive }: SummaryCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Mandals</CardTitle>
        <Building className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">{total}</div>
        <p className="text-xs text-muted-foreground">All registered mandals</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Mandals</CardTitle>
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{active}</div>
        <p className="text-xs text-muted-foreground">Currently active</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Inactive Mandals</CardTitle>
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">{inactive}</div>
        <p className="text-xs text-muted-foreground">Currently inactive</p>
      </CardContent>
    </Card>
  </div>
);