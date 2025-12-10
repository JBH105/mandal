"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building, Eye, Edit, Trash2 } from "lucide-react";

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

interface MobileCardViewProps {
  mandals: Mandal[];
  onView: (mandal: Mandal) => void;
  onEdit: (mandal: Mandal) => void;
  onDelete: (mandal: Mandal) => void;
}

export const MobileCardView = ({ mandals, onView, onEdit, onDelete }: MobileCardViewProps) => (
  <div
    className="
      grid 
      grid-cols-1 
      gap-4 
      md:grid-cols-2     /* Tablet: 2 cards per row */
      lg:hidden          /* Hide on desktop */
    "
  >
    <div className="col-span-1 md:col-span-2 flex items-center justify-between">
      <h3 className="text-lg font-semibold">All Mandals ({mandals.length})</h3>
    </div>

    {mandals.map((mandal, index) => (
      <Card key={mandal.id} className="border-l-4 border-l-red-500">
        <CardContent className="p-4">

          {/* CONTENT SAME AS BEFORE */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                <Badge
                  variant={mandal.status === "Active" ? "default" : "secondary"}
                  className={
                    mandal.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {mandal.status}
                </Badge>
              </div>
              <h4 className="font-semibold text-lg">{mandal.nameEn}</h4>
              <p className="text-sm text-gray-600">{mandal.nameGu}</p>
            </div>
          </div>

          {/* ICON ROWS */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Admin:</span>
              <span className="font-medium">{mandal.adminUsername}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Established:</span>
              <span className="font-medium">
                {new Intl.DateTimeFormat("en-GB").format(new Date(mandal.establishedDate))}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Members:</span>
              <span className="font-medium">{mandal.totalMembers}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(mandal)}>
              <Eye className="h-4 w-4 mr-1" /> 
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(mandal)}>
              <Edit className="h-4 w-4 mr-1" /> 
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onDelete(mandal)}>
              <Trash2 className="h-4 w-4 mr-1" /> 
            </Button>
          </div>

        </CardContent>
      </Card>
    ))}
  </div>
);
