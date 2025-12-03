"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar } from "lucide-react";
import {
  getMandals,
  getMandalSubUsersApi,
  createMandalSubUserApi,
  createMemberDataApi,
  getMemberDataApi,
  getAllMonthsApi,
  MemberData,
} from "@/auth/auth";
import { showErrorToast, showSuccessToast } from "@/middleware/lib/toast";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BiDollar } from "react-icons/bi";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import {
  validateNewMemberForm,
  cleanPhoneNumberForPayload,
  formatPhoneNumber,
  ValidationErrors,
} from "./validation";
import { AxiosError } from "axios";
import { OverdueInfo } from "@/components/ui/overdue-info";
import { SkeletonCard, SkeletonTable, Loader } from "@/components/ui/loader";

interface Calculations {
  totalInstallments: number;
  totalAmount: number;
  totalInterest: number;
  totalFines: number;
  totalWithdrawals: number;
  totalNewWithdrawals: number;
  grandTotal: number;
  totalMembers: number;
  totalName: number;
  bandSilak: number;
  Mandalcash: number;
  interestPerPerson: number;
  perPerson: number;
}

interface FormData {
  subUserId: string;
  installment: string;
  amount: string;
  interest: string;
  fine: string;
  withdrawal: string;
  newWithdrawal: string;
}

export interface NewMemberForm {
  subUserName: string;
  phoneNumber: string;
}

interface SubUser {
  _id: string;
  mandal: string;
  subUserName: string;
  phoneNumber: string;
}

export default function AnalyticsPage() {
  const [mandalName, setMandalName] = useState<string>("આઈ શ્રી ખોડિયાર");
  const [establishedDate, setEstablishedDate] = useState<string | null>(null);
  const [mandalId, setMandalId] = useState<string | null>(null);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    subUserId: "",
    installment: "",
    amount: "",
    interest: "",
    fine: "",
    withdrawal: "",
    newWithdrawal: "",
  });
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] =
    useState<boolean>(false);
  const [newMemberData, setNewMemberData] = useState<NewMemberForm>({
    subUserName: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{
    subUserName: boolean;
    phoneNumber: boolean;
  }>({
    subUserName: false,
    phoneNumber: false,
  });
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isAddingMonth, setIsAddingMonth] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [isTableDataLoading, setIsTableDataLoading] = useState<boolean>(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [hasDataLoaded, setHasDataLoaded] = useState<boolean>(false);

  // Reduce initial loading time
  useEffect(() => {
    const timer = setTimeout(() => setIsDashboardLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch initial data in parallel
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsDashboardLoading(true);
        
        // Fetch mandal data first
        const mandals = await getMandals();
        if (mandals.length > 0) {
          setMandalName(mandals[0].nameGu);
          setEstablishedDate(mandals[0].establishedDate);
          const currentMandalId = mandals[0]._id;
          setMandalId(currentMandalId);

          // Fetch sub-users and months in parallel
          const [users, allMonths] = await Promise.all([
            getMandalSubUsersApi(),
            getAllMonthsApi(),
          ]);

          // Filter sub-users for current mandal
          const filteredUsers = users.filter(
            (user: SubUser) => user.mandal === currentMandalId
          );
          setSubUsers(filteredUsers);

          // Handle months
          if (Array.isArray(allMonths) && allMonths.length > 0) {
            setMonths(allMonths);
            const defaultMonth = allMonths[0];
            setSelectedMonth(defaultMonth);

            // Fetch member data for selected month
            if (defaultMonth) {
              const data: MemberData[] = await getMemberDataApi(defaultMonth);
              setMemberData(data);
              setHasDataLoaded(true);
            }
          } else {
            setMonths([]);
            setHasDataLoaded(true);
          }

          // Check if this is a new mandal
          const mandalIsNew = !Array.isArray(allMonths) || allMonths.length === 0;
          if (mandalIsNew) {
            showSuccessToast(
              "Welcome to your new mandal! Start by adding members."
            );
          }
        } else {
          setMandalName("No Mandal Found");
          setHasDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMandalName("Error Loading Mandal");
        setHasDataLoaded(true);
      } finally {
        setIsDashboardLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch member data when selectedMonth changes (with debouncing)
  useEffect(() => {
    if (!selectedMonth) return;
    
    const fetchMemberData = async () => {
      try {
        setIsTableDataLoading(true);
        const data: MemberData[] = await getMemberDataApi(selectedMonth);
        setMemberData(data);
      } catch (error) {
        console.log("🚀 ~ fetchMemberData ~ error:", error);
        showErrorToast("Error fetching member data:");
      } finally {
        setIsTableDataLoading(false);
      }
    };

    // Small delay to prevent too rapid API calls
    const timer = setTimeout(() => {
      fetchMemberData();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  };

  // Memoize calculations for performance
  const calculations = useMemo(() => {
    const totalInstallments = memberData.reduce(
      (sum, row) => sum + row.installment,
      0
    );
    const totalAmount = memberData.reduce((sum, row) => sum + row.amount, 0);
    const totalInterest = memberData.reduce((sum, row) => sum + row.interest, 0);
    const totalFines = memberData.reduce((sum, row) => sum + row.fine, 0);
    const totalWithdrawals = memberData.reduce((sum, row) => sum + row.withdrawal, 0);
    const totalNewWithdrawals = memberData.reduce(
      (sum, row) => sum + row.newWithdrawal,
      0
    );
    const totalMembers = memberData.length;
    
    const totalName = totalInstallments + totalInterest + totalWithdrawals;
    const bandSilak = totalName - totalNewWithdrawals;
    const Mandalcash = 0 + bandSilak;
    const interestPerPerson = totalMembers > 0 ? totalInterest / totalMembers : 0;
    const perPerson = totalMembers > 0 ? bandSilak / totalMembers : 0;

    return {
      totalInstallments,
      totalAmount,
      totalInterest,
      totalFines,
      totalWithdrawals,
      totalNewWithdrawals,
      grandTotal: 0,
      totalMembers,
      totalName,
      bandSilak,
      Mandalcash,
      interestPerPerson,
      perPerson,
    };
  }, [memberData]);

  const getFilteredErrors = () => {
    const allErrors = validateNewMemberForm(newMemberData);
    const filtered: ValidationErrors = {};
    if (touched.subUserName && allErrors.subUserName) {
      filtered.subUserName = allErrors.subUserName;
    }
    if (touched.phoneNumber && allErrors.phoneNumber) {
      filtered.phoneNumber = allErrors.phoneNumber;
    }
    return filtered;
  };

  const handleAddMember = async () => {
    const validationErrors = validateNewMemberForm(newMemberData);
    setErrors(validationErrors);
    setTouched({ subUserName: true, phoneNumber: true });

    if (Object.keys(validationErrors).length > 0) {
      showErrorToast("Please fix the errors in the form");
      return;
    }

    try {
      setIsAddingMember(true);
      setIsTableDataLoading(true);

      const cleanPhoneNumber = cleanPhoneNumberForPayload(
        newMemberData.phoneNumber
      );

      const phoneNumberExists = subUsers.some(
        (user) => user.phoneNumber === cleanPhoneNumber
      );

      if (phoneNumberExists) {
        showErrorToast(
          "This phone number is already registered with another member"
        );
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Phone number already exists",
        }));
        setIsTableDataLoading(false);
        return;
      }

      const response = await createMandalSubUserApi({
        subUserName: newMemberData.subUserName,
        phoneNumber: cleanPhoneNumber,
      });

      showSuccessToast("Member created successfully!");

      // Refresh sub-users
      const users = await getMandalSubUsersApi();
      const filteredUsers = users.filter(
        (user: SubUser) => user.mandal === mandalId
      );
      setSubUsers(filteredUsers);

      const newMember = filteredUsers.find(
        (user: SubUser) =>
          user.subUserName === newMemberData.subUserName &&
          user.phoneNumber === cleanPhoneNumber
      );

      if (newMember) {
        try {
          const allMonths = await getAllMonthsApi();
          const validMonths = Array.isArray(allMonths) ? allMonths : [];

          let targetMonth = selectedMonth;

          if (validMonths.length === 0) {
            targetMonth = getCurrentMonth();
            const memberDataPayload = {
              subUserId: newMember._id,
              month: targetMonth,
              installment: 0,
              amount: 0,
              interest: 0,
              fine: 0,
              withdrawal: 0,
              newWithdrawal: 0,
            };
            await createMemberDataApi(memberDataPayload);
            setMonths([targetMonth]);
            setSelectedMonth(targetMonth);
            const updatedData = await getMemberDataApi(targetMonth);
            setMemberData(updatedData);
          } else {
            const sortedMonths = validMonths.sort().reverse();
            const currentMonthIndex = sortedMonths.indexOf(selectedMonth);
            if (currentMonthIndex !== -1) {
              const monthsToCreate = sortedMonths.slice(0, currentMonthIndex + 1);
              for (const month of monthsToCreate) {
                const memberDataPayload = {
                  subUserId: newMember._id,
                  month: month,
                  installment: 0,
                  amount: 0,
                  interest: 0,
                  fine: 0,
                  withdrawal: 0,
                  newWithdrawal: 0,
                };
                await createMemberDataApi(memberDataPayload);
              }
            }
            const updatedData = await getMemberDataApi(targetMonth);
            setMemberData(updatedData);
          }
        } catch (dataError) {
          console.error("Error creating member data:", dataError);
          showErrorToast("Member created but failed to add to month data");
        }
      } else {
        const updatedData = await getMemberDataApi(selectedMonth);
        setMemberData(updatedData);
      }

      setNewMemberData({ subUserName: "", phoneNumber: "" });
      setErrors({});
      setTouched({ subUserName: false, phoneNumber: false });
      setIsAddMemberDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error creating member:", error);
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error?.toLowerCase() ||
          error.response?.data?.message?.toLowerCase();
        if (errorMessage.includes("phone") && errorMessage.includes("already")) {
          showErrorToast("Phone number already in use");
          setErrors((prev) => ({
            ...prev,
            phoneNumber: "This phone number is already registered",
          }));
        } else if (error.response?.data?.error) {
          showErrorToast(error.response.data.error);
        } else {
          showErrorToast("Failed to create member");
        }
      } else {
        showErrorToast("Failed to create member");
      }
    } finally {
      setIsAddingMember(false);
      setIsTableDataLoading(false);
    }
  };

  const isNewMandal = async (): Promise<boolean> => {
    try {
      const allMonths = await getAllMonthsApi();
      return !Array.isArray(allMonths) || allMonths.length === 0;
    } catch (error) {
      console.error("Error checking mandal status:", error);
      return true;
    }
  };

  const handleAddData = async () => {
    if (!formData.subUserId || !selectedMonth) {
      showErrorToast("Please select a member and month");
      return;
    }

    try {
      setUpdatingMemberId(formData.subUserId);
      const data = {
        subUserId: formData.subUserId,
        month: selectedMonth,
        installment: parseInt(formData.installment) || 0,
        amount: parseInt(formData.amount) || 0,
        interest: parseInt(formData.interest) || 0,
        fine: parseInt(formData.fine) || 0,
        withdrawal: parseInt(formData.withdrawal) || 0,
        newWithdrawal: parseInt(formData.newWithdrawal) || 0,
      };

      const response = await createMemberDataApi(data);
      showSuccessToast(response.message || "Member data updated successfully");

      const updatedData = await getMemberDataApi(selectedMonth);
      setMemberData(updatedData);

      setFormData({
        subUserId: "",
        installment: "",
        amount: "",
        interest: "",
        fine: "",
        withdrawal: "",
        newWithdrawal: "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.log("🚀 ~ handleAddData ~ error:", error);
      showErrorToast("Failed to update member data");
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleAddNewMonth = async () => {
    let newMonth: string;
    if (months.length === 0 && establishedDate) {
      const [year, month] = establishedDate.slice(0, 7).split("-").map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      newMonth = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`;
    } else if (months.length > 0) {
      const latestMonth = months[0];
      const [year, month] = latestMonth.split("-").map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      newMonth = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`;
    } else {
      newMonth = getCurrentMonth();
    }

    try {
      setIsAddingMonth(true);
      setIsTableLoading(true);

      let prevData: MemberData[] = [];
      if (months.length > 0) {
        const latestMonth = months[0];
        prevData = await getMemberDataApi(latestMonth);
      }

      for (const subUser of subUsers) {
        const prev = prevData.find((p) => p.subUser._id === subUser._id);
        const data = {
          subUserId: subUser._id,
          month: newMonth,
          installment: 0,
          amount: prev ? prev.amount + prev.newWithdrawal - prev.withdrawal : 0,
          interest: 0,
          fine: 0,
          withdrawal: 0,
          newWithdrawal: 0,
        };
        await createMemberDataApi(data);
      }

      const allMonths = await getAllMonthsApi();
      const validMonths = Array.isArray(allMonths) ? allMonths : [];
      setMonths(validMonths);
      setSelectedMonth(newMonth);
      
      const data = await getMemberDataApi(newMonth);
      setMemberData(data);
      setSelectedMembers([]);

      showSuccessToast(`Month ${newMonth} initialized successfully`);
    } catch (error) {
      showErrorToast("Error initializing new month data:");
      console.error(error);
    } finally {
      setIsAddingMonth(false);
      setIsTableLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMemberData({ ...newMemberData, subUserName: value });
    setTouched({ ...touched, subUserName: true });
    setErrors(getFilteredErrors());
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+91 ")) {
      value = "+91 " + value.replace(/^\+91\s*/, "");
    }
    const digits = value
      .replace(/^\+91\s*/, "")
      .replace(/\s/g, "")
      .replace(/\D/g, "");
    const formattedValue = formatPhoneNumber(digits);
    setNewMemberData({ ...newMemberData, phoneNumber: formattedValue });
    setTouched({ ...touched, phoneNumber: true });
    setErrors(getFilteredErrors());
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNewMemberData({ subUserName: "", phoneNumber: "" });
      setErrors({});
      setTouched({ subUserName: false, phoneNumber: false });
    }
    setIsAddMemberDialogOpen(open);
  };

  const hasError = (field: keyof typeof touched) =>
    touched[field] && !!errors[field];

  const handleRowAction = (row: MemberData) => {
    setFormData({
      subUserId: row.subUser._id,
      installment: row.installment?.toString() || "0",
      amount: row.amount?.toString() || "0",
      interest: row.interest?.toString() || "0",
      fine: row.fine?.toString() || "0",
      withdrawal: row.withdrawal?.toString() || "0",
      newWithdrawal: row.newWithdrawal?.toString() || "0",
    });
    setIsAddDialogOpen(true);
  };

  useEffect(() => {
    if (memberData.length > 0 && selectedMonth) {
      const membersWithInstallmentPlusInterest = memberData
        .filter((member) => member.total > 0)
        .map((member) => member._id);
      setSelectedMembers(membersWithInstallmentPlusInterest);
    }
  }, [memberData, selectedMonth]);

  // Show only initial skeleton, not when there's no data
  if (isDashboardLoading && !hasDataLoaded) {
    return (
      <div className="p-6 space-y-6">
        {/* Page Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Main Table Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          <SkeletonTable rows={5} cols={11} />
        </div>

        {/* Summary Section Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-white/60 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-28 h-4 bg-gray-200/60 rounded animate-pulse" />
                  <div className="w-6 h-6 bg-gray-200/60 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-16 h-8 bg-gray-200/60 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-gray-200/60 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Monthly Ledger"
        description="View your monthly ledger, withdrawals, and interest earnings in one place."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex flex-row gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] sm:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                {isAddingMonth ? (
                  <span className="text-gray-400">Loading months...</span>
                ) : (
                  <SelectValue placeholder="Select month" />
                )}
              </SelectTrigger>
              {!isAddingMonth && (
                <SelectContent>
                  {Array.isArray(months) && months.length > 0 ? (
                    months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {new Date(month + "-01").toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No months available
                    </SelectItem>
                  )}
                </SelectContent>
              )}
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-auto sm:w-auto" disabled={!selectedMonth}>
                  <Plus className="h-4 w-4" />
                  Update Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] p-4 sm:max-w-2xl sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-xl">
                    Update Member Data
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2 sm:gap-4 sm:py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="subUserId" className="text-sm sm:text-base">
                      સભ્યનું નામ (Member Name)
                    </Label>
                    <Select
                      value={formData.subUserId}
                      onValueChange={(value) => {
                        const existing = memberData.find(
                          (m) => m.subUser?._id === value
                        );
                        if (existing) {
                          setFormData({
                            subUserId: value,
                            installment:
                              existing.installment?.toString() || "0",
                            amount: existing.amount?.toString() || "0",
                            interest: existing.interest?.toString() || "0",
                            fine: existing.fine?.toString() || "0",
                            withdrawal: existing.withdrawal?.toString() || "0",
                            newWithdrawal:
                              existing.newWithdrawal?.toString() || "0",
                          });
                        } else {
                          setFormData({
                            subUserId: value,
                            installment: "0",
                            amount: "0",
                            interest: "0",
                            fine: "0",
                            withdrawal: "0",
                            newWithdrawal: "0",
                          });
                        }
                      }}
                      disabled={!subUsers || subUsers.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !subUsers || subUsers.length === 0
                              ? "No member added"
                              : "Select member"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subUsers &&
                          subUsers.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.subUserName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="installment"
                      className="text-sm sm:text-base"
                    >
                      હપ્તો (Installment)
                    </Label>
                    <Input
                      id="installment"
                      type="number"
                      value={formData.installment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installment: e.target.value,
                        })
                      }
                      placeholder="Enter installment amount"
                      className="text-sm sm:text-base"
                      disabled={updatingMemberId !== null}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-sm sm:text-base">
                      આ નો ઉ. (Amount)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                      className="text-sm sm:text-base"
                      disabled={updatingMemberId !== null}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="interest" className="text-sm sm:text-base">
                      બ્યાજ (Interest)
                    </Label>
                    <Input
                      id="interest"
                      type="number"
                      value={formData.interest}
                      onChange={(e) =>
                        setFormData({ ...formData, interest: e.target.value })
                      }
                      placeholder="Enter interest"
                      className="text-sm sm:text-base"
                      disabled={updatingMemberId !== null}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fine" className="text-sm sm:text-base">
                      દંડ (Fine)
                    </Label>
                    <Input
                      id="fine"
                      type="number"
                      value={formData.fine}
                      onChange={(e) =>
                        setFormData({ ...formData, fine: e.target.value })
                      }
                      placeholder="Enter fine amount"
                      className="text-sm sm:text-base"
                      disabled={updatingMemberId !== null}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="withdrawal"
                      className="text-sm sm:text-base"
                    >
                      ઉપાડ જમા (Withdrawal)
                    </Label>
                    <Input
                      id="withdrawal"
                      type="number"
                      value={formData.withdrawal}
                      onChange={(e) =>
                        setFormData({ ...formData, withdrawal: e.target.value })
                      }
                      placeholder="Enter withdrawal amount"
                      className="text-sm sm:text-base"
                      disabled={updatingMemberId !== null}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="newWithdrawal"
                      className="text-sm sm:text-base"
                    >
                      નવો ઉપાડ (New Withdrawal)
                    </Label>
                    <Input
                      id="newWithdrawal"
                      type="number"
                      value={formData.newWithdrawal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newWithdrawal: e.target.value,
                        })
                      }
                      placeholder="Enter new withdrawal amount"
                      className="text-sm sm:text-base"
                      disabled={updatingMemberId !== null}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setFormData({
                        subUserId: "",
                        installment: "",
                        amount: "",
                        interest: "",
                        fine: "",
                        withdrawal: "",
                        newWithdrawal: "",
                      });
                      setUpdatingMemberId(null);
                      setIsAddDialogOpen(false);
                    }}
                    className="text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddData}
                    className="text-sm sm:text-base"
                    disabled={
                      !subUsers ||
                      subUsers.length === 0 ||
                      updatingMemberId !== null
                    }
                  >
                    {updatingMemberId ? (
                      <div className="flex items-center gap-2">
                        <Loader
                          size="sm"
                          variant="white"
                          type="dots"
                          className="!gap-0"
                          show
                        />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update Data"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Button
            onClick={handleAddNewMonth}
            className="w-auto text-sm px-2 py-1 self-start sm:w-auto sm:text-base sm:px-4 sm:py-2"
            disabled={isAddingMonth}
          >
            {isAddingMonth ? (
              <Loader
                size="sm"
                variant="white"
                type="dots"
                className="!gap-0"
                show
              />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isAddingMonth ? "Adding..." : "Add New Month"}
          </Button>

          <div className="fixed bottom-4 right-4 sm:static sm:bottom-auto sm:right-auto">
            <Dialog
              open={isAddMemberDialogOpen}
              onOpenChange={handleDialogClose}
            >
              <DialogTrigger asChild>
                <Button className="w-12 h-12 rounded-full sm:rounded sm:w-auto sm:h-auto sm:p-2 flex items-center justify-center">
                  <Plus className="h-6 w-6 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add Member</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] p-4 sm:max-w-md sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-xl">
                    Add New Member
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 py-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="subUserName"
                      className="text-sm sm:text-base"
                    >
                      Member Name
                    </Label>
                    <Input
                      id="subUserName"
                      value={newMemberData.subUserName}
                      onChange={handleNameChange}
                      placeholder="Enter member name"
                      className={
                        hasError("subUserName")
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }
                      disabled={isAddingMember}
                    />
                    {hasError("subUserName") && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subUserName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm sm:text-base"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={newMemberData.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="+91 12345 67890"
                      className={
                        hasError("phoneNumber")
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }
                      disabled={isAddingMember}
                    />
                    {hasError("phoneNumber") && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    disabled={
                      Object.keys(validateNewMemberForm(newMemberData)).length >
                        0 || isAddingMember
                    }
                  >
                    {isAddingMember ? (
                      <div className="flex items-center gap-2">
                        <Loader
                          size="sm"
                          variant="white"
                          type="dots"
                          className="!gap-0"
                          show
                        />
                        Adding...
                      </div>
                    ) : (
                      "Add Member"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <HiOutlineUserGroup />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculations.totalMembers}
            </div>
            <p className="text-xs text-green-600">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collection
            </CardTitle>
            <BiDollar />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{calculations.totalInstallments.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Total amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interest Earned
            </CardTitle>
            <HiArrowTrendingUp />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{calculations.totalInterest.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Monthly interest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <HiArrowTrendingDown />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{calculations.totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-red-600">Total withdrawals</p>
          </CardContent>
        </Card>
      </div>

      <Card className="">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-red-600">
                {mandalName}
              </CardTitle>
              <div className="flex gap-4 mt-2">
                <Badge variant="outline">{calculations.totalMembers}</Badge>
                <Badge variant="outline">
                  {selectedMonth
                    ? new Date(selectedMonth + "-01").toLocaleDateString("en-GB")
                    : "No Month Selected"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center font-semibold">
                    <Checkbox
                      checked={
                        selectedMembers.length === memberData.length &&
                        memberData.length > 0
                          ? true
                          : selectedMembers.length > 0
                          ? "indeterminate"
                          : false
                      }
                      disabled
                    />
                  </TableHead>
                  <TableHead className="w-12 text-center font-semibold">
                    ક્રમ નં.
                  </TableHead>
                  <TableHead className="min-w-[150px] font-semibold">
                    સભ્યનું નામ
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[120px]">
                    હપ્તો
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    આ.નો ઉ.
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    વ્યાજ
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    દંડ
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    ઉપાડ જમા
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    નવો ઉપાડ
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    હપ્તો + વ્યાજ
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTableLoading || isTableDataLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="text-center">
                        <div className="h-5 w-5 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-8 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-40 bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-5 w-28 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-8 w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : memberData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <HiOutlineUserGroup className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          No members added yet
                        </p>
                        <p className="text-sm text-gray-400">
                          Click the + Add Member button to add your first member
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  memberData.map((row, index) => (
                    <TableRow key={row._id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedMembers.includes(row._id)}
                          disabled
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.subUser?.subUserName}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          ₹{row.installment?.toLocaleString()}
                          <OverdueInfo
                            memberId={row.subUser._id}
                            currentMonth={selectedMonth}
                            memberName={row.subUser?.subUserName}
                            currentInstallment={row.installment}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {row?.amount > 0
                          ? `₹${row?.amount.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row?.interest > 0 ? `₹${row?.interest}` : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row?.fine > 0 ? `₹${row?.fine}` : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row?.withdrawal > 0
                          ? `₹${row?.withdrawal.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row?.newWithdrawal > 0
                          ? `₹${row?.newWithdrawal.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        ₹{row.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRowAction(row)}
                          disabled={updatingMemberId === row.subUser._id}
                        >
                          {updatingMemberId === row.subUser._id ? (
                            <Loader
                              size="sm"
                              variant="primary"
                              type="dots"
                              className="!gap-0"
                              show
                            />
                          ) : (
                            "Update"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {memberData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Summary Calculations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">કુલ હપ્તા</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ₹{calculations.totalInstallments.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      કુલ બ્યાજ
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      ₹{calculations.totalInterest.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      કુલ ઉપાડ જમા
                    </p>
                    <p className="text-2xl font-bold text-orange-800">
                      ₹{calculations.totalWithdrawals.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">કુલ રકમ</p>
                    <p className="text-2xl font-bold text-purple-800">
                      ₹{calculations.totalName.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      Total Members ( કુલ સભ્ય ):
                    </span>
                    <span className="font-bold">{calculations.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      Total Installments ( કુલ હપ્તો ):
                    </span>
                    <span className="font-bold">
                      ₹{calculations.totalInstallments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      Total Interest ( કુલ વ્યાજ ):
                    </span>
                    <span className="font-bold">
                      ₹{calculations.totalInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      Total Withdrawals Deposit ( ઉપાડ જમા ):
                    </span>
                    <span className="font-bold">
                      ₹{calculations.totalWithdrawals.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-blue-800">
                      Total ( કુલ રકમ ):
                    </span>
                    <span className="font-bold text-xl text-blue-800">
                      ₹{calculations.totalName.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      New Withdrawals ( નવો ઉપાડ ):
                    </span>
                    <span className="font-bold">
                      ₹{calculations.totalNewWithdrawals.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200">
                    <span className="font-bold text-green-800">
                      Band Silak ( શ્રી બંધ સિલક: )
                    </span>
                    <span className="font-bold text-xl text-green-800">
                      ₹{calculations.bandSilak.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-blue-800">
                      Grand Total ( કુલ ધીરાણા ):
                    </span>
                    <span className="font-bold text-xl text-blue-800">
                      ₹ {calculations.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-2 border-red-200 mt-6">
                <span className="font-bold text-red-800">
                  Mandal&apos;s cash ( મંડળની રોકડ ):
                </span>
                <span className="font-bold text-xl text-red-800">
                  ₹ {calculations.Mandalcash.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200 mt-6">
                <span className="font-bold text-green-800">
                  per person ( વ્યક્તિ દીઠ ):
                </span>
                <span className="font-bold text-xl text-green-800">
                  ₹ {calculations.perPerson.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200 mt-6">
                <span className="font-bold text-green-800">
                  Interest per person ( વ્યક્તિ દીઠ વ્યાજ):
                </span>
                <span className="font-bold text-xl text-green-800">
                  ₹ {calculations.interestPerPerson.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}