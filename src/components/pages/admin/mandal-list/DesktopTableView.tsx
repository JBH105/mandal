import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DesktopTableViewProps {
  mandals: Mandal[];
  onView: (mandal: Mandal) => void;
  onEdit: (mandal: Mandal) => void;
  onDelete: (mandal: Mandal) => void;
}

export interface Mandal {
  id: string;
  nameEn: string;
  nameGu: string;
  adminUsername: string;
  establishedDate: string;
  status: "Active" | "Inactive";
  totalMembers: number;
  createdAt: string;
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

export const DesktopTableView = ({ mandals, onView, onEdit, onDelete }: DesktopTableViewProps) => (
  <Card className="hidden md:block">
    <CardHeader>
      <CardTitle>All Mandals ({mandals.length})</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-red-50">
              <TableHead className="font-semibold text-red-800">Sr. No.</TableHead>
              <TableHead className="font-semibold text-red-800">Mandal Name (English)</TableHead>
              <TableHead className="font-semibold text-red-800">મંડળ નામ (ગુજરાતી)</TableHead>
              <TableHead className="font-semibold text-red-800">Mandal Username</TableHead>
              <TableHead className="font-semibold text-red-800">Established Date</TableHead>
              <TableHead className="font-semibold text-red-800">Status</TableHead>
              <TableHead className="font-semibold text-red-800">Total Members</TableHead>
              <TableHead className="font-semibold text-red-800">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mandals.map((mandal, index) => (
              <TableRow key={mandal.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{mandal.nameEn}</TableCell>
                <TableCell className="font-medium">{mandal.nameGu}</TableCell>
                <TableCell>{mandal.adminUsername}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("en-GB").format(new Date(mandal.establishedDate))}
                </TableCell>
                <TableCell>
                  <StatusBadge status={mandal.status} />
                </TableCell>
                <TableCell>{mandal.totalMembers}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onView(mandal)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(mandal)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(mandal)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);