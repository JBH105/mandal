import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building, Eye, Edit } from "lucide-react";

export interface Mandal {
  id: number;
  nameEn: string;
  nameGu: string;
  adminUsername: string;
  establishedDate: string;
  status: "Active" | "Inactive";
  totalMembers: number;
  createdAt: string;
}

interface MandalCardProps {
  mandal: Mandal;
  index: number;
  onView: (mandal: Mandal) => void;
  onEdit: (mandal: Mandal) => void;
}

interface StatusBadgeProps {
  status: "Active" | "Inactive";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge
    variant={status === "Active" ? "default" : "secondary"}
    className={status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
  >
    {status}
  </Badge>
);

export const MandalCard = ({ mandal, index, onView, onEdit }: MandalCardProps) => (
  <Card className="border-l-4 border-l-red-500">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              #{index + 1}
            </Badge>
            <StatusBadge status={mandal.status} />
          </div>
          <h4 className="font-semibold text-lg text-gray-900">{mandal.nameEn}</h4>
          <p className="text-sm text-gray-600 font-medium">{mandal.nameGu}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Building className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Admin:</span>
          <span className="font-medium">{mandal.adminUsername}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Established:</span>
          {/* <span className="font-medium">{new Date(mandal.establishedDate).toLocaleDateString()}</span> */}
         <span className="font-medium">{new Intl.DateTimeFormat("en-GB").format(new Date(mandal.establishedDate))}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Members:</span>
          <span className="font-medium">{mandal.totalMembers}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onView(mandal)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit(mandal)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    </CardContent>
  </Card>
);