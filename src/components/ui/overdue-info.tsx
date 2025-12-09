"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { getMemberDataApi } from "@/auth/auth";
import { MemberData } from "@/auth/auth";

interface OverdueInfoProps {
  memberId: string;
  currentMonth: string;
  memberName: string;
  currentInstallment: number;
}

export function OverdueInfo({ memberId, currentMonth, memberName, currentInstallment }: OverdueInfoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [overdueMonths, setOverdueMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoButton, setShowInfoButton] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const getPreviousMonth = (month: string): string => {
    const [yearStr, monthStr] = month.split('-');
    let year = parseInt(yearStr);
    let mon = parseInt(monthStr);
    mon -= 1;
    if (mon === 0) {
      mon = 12;
      year -= 1;
    }
    return `${year}-${mon.toString().padStart(2, '0')}`;
  };

  // Check for pending months and show info button if ANY pending months exist
  useEffect(() => {
    const checkPendingMonths = async () => {
      try {
        const pending: string[] = [];
        let checkMonth = getPreviousMonth(currentMonth);
        
        // Check ALL previous months for pending installments
        for (let i = 0; i < 24; i++) {
          try {
            const monthData: MemberData[] = await getMemberDataApi(checkMonth);
            const memberMonthData = monthData.find(data => data.subUser._id === memberId);
            
            if (memberMonthData) {
              // If installment is 0, it's pending
              if (memberMonthData.installment === 0) {
                pending.push(checkMonth);
              }
              // Continue checking even if paid, to find all pending months
            } else {
              // If no data exists for this member in this month, stop checking
              break;
            }
          } catch (error) {
            console.log("🚀 ~ checkPendingMonths ~ error:", error)
            // If error fetching month data, stop checking further
            break;
          }
          
          checkMonth = getPreviousMonth(checkMonth);
        }
        
        // Show info button if there are ANY pending months
        const hasPendingMonths = pending.length > 0;
        setShowInfoButton(hasPendingMonths);
        setPendingCount(pending.length);
        setOverdueMonths(pending);
      } catch (error) {
        console.error("Error checking pending months:", error);
        setShowInfoButton(false);
        setPendingCount(0);
      }
    };

    checkPendingMonths();
  }, [currentMonth, memberId]);

  const checkAllPendingMonths = async () => {
    setIsLoading(true);
    try {
      const pending: string[] = [];
      let checkMonth = getPreviousMonth(currentMonth);
      
      // Check ALL previous months for pending installments
      for (let i = 0; i < 24; i++) {
        try {
          const monthData: MemberData[] = await getMemberDataApi(checkMonth);
          const memberMonthData = monthData.find(data => data.subUser._id === memberId);
          
          if (memberMonthData) {
            // If installment is 0, it's pending
            if (memberMonthData.installment === 0) {
              pending.push(checkMonth);
            }
            // Continue checking even if paid, to find all pending months
          } else {
            // If no data exists for this member in this month, stop checking
            break;
          }
        } catch (error) {
          console.log("🚀 ~ checkAllPendingMonths ~ error:", error)
          // If error fetching month data, stop checking further
          break;
        }
        
        checkMonth = getPreviousMonth(checkMonth);
      }
      
      setOverdueMonths(pending);
    } catch (error) {
      console.error("Error checking pending months:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      checkAllPendingMonths();
    }
  }, [isDialogOpen]);

  const formatMonth = (month: string) => {
    return new Date(month + '-01').toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Don't render anything if no pending months
  if (!showInfoButton) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 ml-1 relative"
          onClick={() => setIsDialogOpen(true)}
        >
          <Info className="h-3 w-3" />
          {/* Show pending count as a badge on the button */}
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {memberName} - Pending Installments
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <p className="text-center text-sm">Checking payment history...</p>
          ) : overdueMonths.length > 0 ? (
            <div>
              <p className="text-red-600 font-semibold mb-3">
                📅 Pending Installments ({overdueMonths.length} months)
              </p>
              <div className="max-h-60 overflow-y-auto">
                <ul className="space-y-2">
                  {overdueMonths.map((month) => (
                    <li key={month} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
                      <span className="font-medium">{formatMonth(month)}</span>
                      <Badge variant="destructive" className="text-xs">
                        Pending
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Total {overdueMonths.length} month(s) pending. Please clear all installments.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-600 mb-2">
                <div className="text-2xl">✅</div>
              </div>
              <p className="font-semibold text-green-800">All installments are paid!</p>
              <p className="text-xs text-gray-600 mt-1">
                No pending payments found
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}   