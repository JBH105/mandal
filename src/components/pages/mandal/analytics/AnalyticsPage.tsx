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
import { Plus, Calendar, Search } from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi";
import {
  getMandals,
  getMandalSubUsersApi,
  createMandalSubUserApi,
  createMemberDataApi,
  getMemberDataApi,
  MemberData,
  SubUser,
  getMonthApi,
  addNewMonthApi,
  setNewInstallmentApi,
} from "@/auth/auth";
import { showErrorToast, showSuccessToast } from "@/middleware/lib/toast";
import {
  validateNewMemberForm,
  cleanPhoneNumberForPayload,
  formatPhoneNumber,
  ValidationErrors,
} from "./validation";
import { SkeletonCard, SkeletonTable, Loader } from "@/components/ui/loader";
import { MobileFooter } from "@/components/ui/mobile-footer";
import { IoPersonAdd } from "react-icons/io5";
import { TbTransactionRupee } from "react-icons/tb";

interface FormData {
  subUserId: string;
  installment: string;
  withdrawal: string;
  interest: string;
  fine: string;
  paidWithdrawal: string;
  newWithdrawal: string;
  pendingInstallment: string;
  paidInstallment: string;
  paidInterest: string;
}

export interface NewMemberForm {
  subUserName: string;
  phoneNumber: string;
}

export default function AnalyticsPage() {
  const [mandalName, setMandalName] = useState<string>("આઈ શ્રી ખોડિયાર");
  const [establishedDate, setEstablishedDate] = useState<string | null>(null);
  const [mandalId, setMandalId] = useState<string | null>(null);
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [filteredMemberData, setFilteredMemberData] = useState<MemberData[]>(
    []
  );
  const [months, setMonths] = useState<{ _id: string; month: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    subUserId: "",
    installment: "",
    withdrawal: "",
    interest: "",
    fine: "",
    paidWithdrawal: "",
    newWithdrawal: "",
    pendingInstallment: "",
    paidInstallment: "",
    paidInterest: "",
  });
  const [selectedMemberName, setSelectedMemberName] = useState<string>("");
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
  }>({ subUserName: false, phoneNumber: false });
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isAddingMonth, setIsAddingMonth] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [isTableDataLoading, setIsTableDataLoading] = useState<boolean>(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [hasDataLoaded, setHasDataLoaded] = useState<boolean>(false);
  const [previousMonthData, setPreviousMonthData] = useState<MemberData[]>([]);
  const [mandalMonthlyInstallment, setMandalMonthlyInstallment] =
    useState<number>(0);
  const [isHaptoDialogOpen, setIsHaptoDialogOpen] = useState<boolean>(false);
  const [haptoValue, setHaptoValue] = useState<string>("");
  const [haptoLabelValue, setHaptoLabelValue] = useState<string>("");
  const [isInstallmentPaid, setIsInstallmentPaid] = useState<boolean>(true);
  const [isHaptoSet, setIsHaptoSet] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddMonthDialogOpen, setIsAddMonthDialogOpen] =
    useState<boolean>(false);
  const [newMonthName, setNewMonthName] = useState<string>("");
  const [isMonthLoading, setIsMonthLoading] = useState<boolean>(false);

  const getSelectedMonthObjectId = (): string | null => {
    if (!selectedMonth) return null;
    const found = months.find((m) => m.month === selectedMonth);
    return found?._id || null;
  };

  const getDisplayInstallmentValue = (row: MemberData) => {
    const regularInstallment =
      row.installment === 0 && mandalMonthlyInstallment > 0
        ? mandalMonthlyInstallment
        : row.installment;

    const pending = row.pendingInstallment || 0;
    // const interest = row.interest || 0;

    const total = regularInstallment;
    return {
      value: total,
      hasPending: pending > 0,
      pendingAmount: pending,
    };
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  useEffect(() => {
    if (!selectedMonth || months.length === 0) return;

    const fetchMemberDataForMonth = async () => {
      try {
        setIsTableDataLoading(true);

        const monthId = getSelectedMonthObjectId();
        if (!monthId) {
          showErrorToast("Month ID not found");
          return;
        }

        const data = await getMemberDataApi(monthId);
        setMemberData(data);
        setFilteredMemberData(data);

        // const currentIndex = months.findIndex((m) => m.month === selectedMonth);
        // if (currentIndex >= 0 && currentIndex < months.length - 1) {
        //   const previousMonthId = months[currentIndex + 1]._id;
        //   const prevData = await getMemberDataApi(previousMonthId);
        //   setPreviousMonthData(prevData);
        // } else {
        //   setPreviousMonthData([]);
        // }
      } catch (error) {
        console.error("Error fetching member data:", error);
        showErrorToast("Failed to load member data");
      } finally {
        setIsTableDataLoading(false);
      }
    };

    fetchMemberDataForMonth();
  }, [selectedMonth, months]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsDashboardLoading(true);

        const mandals = await getMandals();
        if (mandals.length === 0) {
          setMandalName("No Mandal Found");
          setHasDataLoaded(true);
          return;
        }

        const currentMandal = mandals[0];
        setMandalName(currentMandal.nameGu);
        setEstablishedDate(currentMandal.establishedDate);
        setMandalId(currentMandal._id);

        const backendInstallment = currentMandal.setInstallment || 0;
        setMandalMonthlyInstallment(backendInstallment);
        setIsHaptoSet(backendInstallment > 0);

        const [users, monthResponse] = await Promise.all([
          getMandalSubUsersApi(),
          getMonthApi(),
        ]);

        setSubUsers(users);

        const monthObjects = Array.isArray(monthResponse)
          ? monthResponse
              .filter((m) => m && m._id && m.month)
              .sort((a, b) => {
                const da = new Date(a.month + "-01");
                const db = new Date(b.month + "-01");
                return db.getTime() - da.getTime();
              })
          : [];

        setMonths(monthObjects);

        if (monthObjects.length > 0) {
          const defaultMonthName = monthObjects[0].month;
          const defaultMonthId = monthObjects[0]._id;

          setSelectedMonth(defaultMonthName);

          // ✅ ID પાસ કરીને ડેટા મેળવો
          const data = await getMemberDataApi(defaultMonthId);
          setMemberData(data);
          setFilteredMemberData(data);

          // if (monthObjects.length > 1) {
          //   const previousMonthId = monthObjects[1]._id;
          //   const prevData = await getMemberDataApi(previousMonthId);
          //   setPreviousMonthData(prevData);
          // } else {
          //   setPreviousMonthData([]);
          // }

          setHasDataLoaded(true);
        } else {
          setMonths([]);
          setSelectedMonth("");
          setMemberData([]);
          setFilteredMemberData([]);
          setHasDataLoaded(true);
          showSuccessToast(
            "Welcome to your new mandal! Start by adding your first member."
          );
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

  const calculations = useMemo(() => {
    const totalInstallments = memberData.reduce(
      (sum, row) => sum + (row.paidInstallment || 0),
      0
    );
    const totalAmount = memberData.reduce(
      (sum, row) => sum + row.paidWithdrawal,
      0
    );
    const totalInterest = memberData.reduce(
      (sum, row) => sum + row.interest,
      0
    );
    const totalFines = memberData.reduce((sum, row) => sum + row.fine, 0);
    const totalWithdrawals = memberData.reduce(
      (sum, row) => sum + row.paidWithdrawal,
      0
    );
    const totalNewWithdrawals = memberData.reduce(
      (sum, row) => sum + row.newWithdrawal,
      0
    );
    const totalMembers = memberData.length;
    const totalName = memberData.reduce((sum, row) => {
      const paidInstallment = row.paidInstallment || 0;
      const interestToAdd = paidInstallment > 0 ? row.interest || 0 : 0;
      return sum + paidInstallment + interestToAdd + (row.paidWithdrawal || 0);
    }, 0);

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
    };
  }, [memberData]);

  const calculateCarriedForwardAmount = (memberId: string) => {
    const currentIndex = months.findIndex((m) => m.month === selectedMonth);
    if (currentIndex === -1 || currentIndex === months.length - 1) return 0;

    const previousMonthId = months[currentIndex + 1]._id;
    const previousData = previousMonthData.find(
      (data) => data.subUser._id === memberId
    );
    if (!previousData) return 0;

    return (
      previousData.withdrawal +
      previousData.newWithdrawal -
      previousData.paidWithdrawal
    );
  };

  const getFilteredErrors = () => {
    const allErrors = validateNewMemberForm(newMemberData);
    const filtered: ValidationErrors = {};
    if (touched.subUserName && allErrors.subUserName)
      filtered.subUserName = allErrors.subUserName;
    if (touched.phoneNumber && allErrors.phoneNumber)
      filtered.phoneNumber = allErrors.phoneNumber;
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
        showErrorToast("This phone number is already registered");
        return;
      }

      const monthId = getSelectedMonthObjectId();
      if (!monthId) {
        showErrorToast("Month not found. Please reselect month.");
        return;
      }

      await createMandalSubUserApi({
        subUserName: newMemberData.subUserName,
        phoneNumber: cleanPhoneNumber,
        monthId,
      });

      showSuccessToast("Member created successfully!");

      const users = await getMandalSubUsersApi();
      setSubUsers(users);

      // ✅ ID પાસ કરીને ડેટા refresh કરો
      const monthIdForRefresh = getSelectedMonthObjectId();
      if (monthIdForRefresh) {
        const updatedData = await getMemberDataApi(monthIdForRefresh);
        setMemberData(updatedData);
        setFilteredMemberData(updatedData);
      }

      setNewMemberData({ subUserName: "", phoneNumber: "" });
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      console.error("Error creating member:", error);
      showErrorToast("Failed to create member");
    } finally {
      setIsAddingMember(false);
      setIsTableDataLoading(false);
    }
  };

  const handleAddData = async () => {
    if (!formData.subUserId) {
      showErrorToast("Please select a member");
      return;
    }

    const monthId = getSelectedMonthObjectId();
    if (!monthId) {
      showErrorToast("Please select a month");
      return;
    }

    try {
      setUpdatingMemberId(formData.subUserId);

      const totalPaid = parseFloat(formData.installment) || 0;

      const currentMemberRecord = memberData.find(
        (item) => item.subUser._id === formData.subUserId
      );

      if (!currentMemberRecord) {
        showErrorToast("Member data not found for update");
        return;
      }

      const payload = {
        _id: currentMemberRecord._id,
        paidInstallment: totalPaid,
        paidWithdrawal: parseFloat(formData.paidWithdrawal) || 0,
        newWithdrawal: parseFloat(formData.newWithdrawal) || 0,
        fine: parseFloat(formData.fine) || 0,
      };

      await createMemberDataApi(payload);

      showSuccessToast("Member data updated successfully!");

      const updatedData = await getMemberDataApi(monthId);
      setMemberData(updatedData);
      setFilteredMemberData(updatedData);

      setFormData({
        subUserId: "",
        installment: "",
        withdrawal: "",
        interest: "",
        fine: "",
        paidWithdrawal: "",
        newWithdrawal: "",
        pendingInstallment: "",
        paidInstallment: "",
        paidInterest: "",
      });

      setSelectedMemberName("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error updating member data:", error);
      showErrorToast("Failed to update member data");
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleSetHapto = async () => {
    try {
      const monthId = getSelectedMonthObjectId();
      if (!monthId) {
        showErrorToast("Month not found");
        return;
      }

      if (!haptoValue || Number(haptoValue) <= 0) {
        showErrorToast("Please enter valid hapto value");
        return;
      }

      setIsMonthLoading(true);

      // 🔥 MAIN API CALL
      await setNewInstallmentApi(monthId, Number(haptoValue));

      showSuccessToast("Hapto set successfully!");

      // 🔁 Mandal monthly installment update
      setMandalMonthlyInstallment(Number(haptoValue));
      setIsHaptoSet(true);

      // 🔁 TABLE REFRESH
      const updatedData = await getMemberDataApi(monthId);
      setMemberData(updatedData);
      setFilteredMemberData(updatedData);

      // cleanup
      setHaptoValue("");
      setIsHaptoDialogOpen(false);
    } catch (error) {
      console.error("Error setting hapto:", error);
      showErrorToast("Failed to set hapto");
    } finally {
      setIsMonthLoading(false);
    }
  };

  const handleAddNewMonth = async () => {
    let newMonth: string;
    if (months.length === 0 && establishedDate) {
      const [year, month] = establishedDate.slice(0, 7).split("-").map(Number);
      newMonth = `${year}-${month.toString().padStart(2, "0")}`;
    } else if (months.length > 0) {
      const latestMonth = months[0];
      const [year, month] = latestMonth.month.split("-").map(Number);
      let nextMonth = month + 1;
      let nextYear = year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = year + 1;
      }
      newMonth = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`;
    } else {
      newMonth = getCurrentMonth();
    }

    setNewMonthName(newMonth);
    setIsAddMonthDialogOpen(true);
  };

  const confirmAddNewMonth = async () => {
    try {
      setIsAddingMonth(true);
      setIsTableLoading(true);

      await addNewMonthApi();

      const monthResponse = await getMonthApi();

      const monthObjects = Array.isArray(monthResponse)
        ? monthResponse
            .filter((m) => m && m._id && m.month)
            .sort((a, b) => {
              const da = new Date(a.month + "-01");
              const db = new Date(b.month + "-01");
              return db.getTime() - da.getTime();
            })
        : [];

      if (monthObjects.length === 0) {
        showErrorToast("Month creation failed");
        return;
      }

      const latestMonthName = monthObjects[0].month;
      setMonths(monthObjects);
      setSelectedMonth(latestMonthName);

      const latestMonthId = monthObjects[0]._id;

      const data = await getMemberDataApi(latestMonthId);
      setMemberData(data);
      setFilteredMemberData(data);

      showSuccessToast(`મહિનો ${latestMonthName} બનાવાયો!`);
      setIsAddMonthDialogOpen(false);
    } catch (error: unknown) {
  console.error("Error creating new month:", error);

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response
      ?.data?.error === "string"
  ) {
    showErrorToast(
      (error as { response: { data: { error: string } } }).response.data.error
    );
  } else if (error instanceof Error) {
    showErrorToast(error.message);
  } else {
    showErrorToast("નવો મહિનો બનાવવામાં ત્રુટિ");
  }
}
finally {
      setIsAddingMonth(false);
      setIsTableLoading(false);
    }
  };

  const cancelAddNewMonth = () => {
    setIsAddMonthDialogOpen(false);
    setNewMonthName("");
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
    const regularInstallment =
      row.installment === 0 && mandalMonthlyInstallment > 0
        ? mandalMonthlyInstallment
        : row.installment;

    const totalInstallmentToShow =
      regularInstallment + (row.pendingInstallment || 0);

    setFormData({
      subUserId: row.subUser._id,
      installment: totalInstallmentToShow.toString(),
      withdrawal: row.withdrawal?.toString() ?? "0",
      interest: row.interest?.toString() ?? "0",
      fine: row.fine?.toString() ?? "0",
      paidWithdrawal: row.paidWithdrawal?.toString() ?? "0",
      newWithdrawal: row.newWithdrawal?.toString() ?? "0",
      pendingInstallment: row.pendingInstallment?.toString() ?? "0",
      paidInstallment: row.paidInstallment?.toString() ?? "0",
      paidInterest: row.paidInterest?.toString() ?? "0",
    });

    setSelectedMemberName(row.subUser?.subUserName || "");
    setIsAddDialogOpen(true);
  };

  const handleInputBlur = (field: keyof Omit<FormData, "subUserId">) => {
    if (formData[field] === "") {
      if (field === "installment") {
        return;
      }
      setFormData({
        ...formData,
        [field]: "0",
      });
    }
  };

  const handleInputFocus = (field: keyof Omit<FormData, "subUserId">) => {
    if (formData[field] === "0") {
      setFormData({
        ...formData,
        [field]: "",
      });
    }
  };

  if (isDashboardLoading && !hasDataLoaded) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-48 md:w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-72 md:w-96 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-28 md:w-32 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-10 w-40 md:w-48 bg-gray-200 rounded animate-pulse" />
          <SkeletonTable rows={5} cols={11} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-white">
        <PageHeader
          title="Monthly Ledger"
          description="View your monthly ledger, withdrawals, and interest earnings in one place."
        >
          <div
            className="
 hidden
    md:flex md:flex-row md:flex-wrap md:items-center md:gap-3
    lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-3
    w-full
  "
          >
            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[180px] shrink-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m._id} value={m.month}>
                      {new Date(m.month + "-01").toLocaleString("default", {
                        month: "short",
                        year: "numeric",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="">
              <Button
                variant="default"
                onClick={handleAddNewMonth}
                className="w-full sm:w-auto lg:w-auto shrink-0"
                disabled={isAddingMonth || subUsers.length === 0}
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
                <span className="ml-2">
                  {isAddingMonth ? "Adding..." : "Add New Month"}
                </span>
              </Button>
            </div>
            <div className="">
              <div className="sm:ml-auto">
                <Dialog
                  open={isAddMemberDialogOpen}
                  onOpenChange={handleDialogClose}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      className="w-full sm:w-auto lg:w-auto shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="ml-2">Add Member</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-[95vw] sm:max-w-md p-4 sm:p-6"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">
                        Add New Member
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                      <div className="space-y-2">
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
                      <div className="space-y-2">
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
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleDialogClose(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddMember}
                        disabled={
                          Object.keys(validateNewMemberForm(newMemberData))
                            .length > 0 || isAddingMember
                        }
                        className="w-full sm:w-auto"
                      >
                        {isAddingMember ? (
                          <div className="flex items-center justify-center gap-2">
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
            <div className="">
              <div className="flex items-center gap-2">
                <Dialog
                  open={isHaptoDialogOpen}
                  onOpenChange={setIsHaptoDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      className="w-full sm:w-auto lg:w-auto shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="ml-2">
                        {isHaptoSet ? "Update Hapto" : "Set Hapto"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-[95vw] sm:max-w-md p-4 sm:p-6"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">
                        {isHaptoSet ? "Update Hapto Value" : "Set Hapto Value"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 py-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="haptoValue"
                          className="text-sm sm:text-base"
                        >
                          હપ્તો (Installment)
                        </Label>
                        <Input
                          id="haptoValue"
                          type="number"
                          value={haptoValue}
                          onChange={(e) => setHaptoValue(e.target.value)}
                          placeholder={
                            isHaptoSet
                              ? `Update hapto value (Current: ₹${mandalMonthlyInstallment})`
                              : "Enter hapto value (e.g., 1000)"
                          }
                          className="text-base"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setIsHaptoDialogOpen(false);
                          setHaptoValue("");
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        type="button"
                        className="w-full sm:w-auto"
                        disabled={!haptoValue || isMonthLoading}
                        onClick={handleSetHapto} // ✅ ADD THIS
                      >
                        {isMonthLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader
                              size="sm"
                              variant="white"
                              type="dots"
                              className="!gap-0"
                              show
                            />
                            {isHaptoSet ? "Updating..." : "Setting..."}
                          </div>
                        ) : isHaptoSet ? (
                          "Update Hapto"
                        ) : (
                          "Set Hapto"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </PageHeader>

        {/* MOBILE: Sticky Search + Current Month */}
        <div className="md:hidden sticky top-0 z-30 bg-white px-4 py-2 flex items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          {/* Current Month Label - With Loading */}
          {isMonthLoading ? (
            <div className="px-3 py-2 bg-gray-100 rounded-md border text-xs font-medium text-gray-600 whitespace-nowrap animate-pulse">
              <div className="h- w-16 bg-gray-300 rounded"></div>
            </div>
          ) : (
            <div className="px-3 py-2 bg-yellow-50 rounded-md border text-xs font-medium text-gray-600 whitespace-nowrap">
              {selectedMonth
                ? new Date(selectedMonth + "-01").toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </div>
          )}
        </div>
      </div>

      <div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent
            className="
    max-w-[95vw] sm:max-w-2xl
    p-4 sm:p-6
    max-h-[90vh] /* limit height on small devices */
    overflow-y-auto "
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Update Member Data
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="memberName" className="text-sm sm:text-base">
                  સભ્યનું નામ (Member Name)
                </Label>
                <Input
                  id="memberName"
                  value={selectedMemberName}
                  readOnly
                  className="w-full text-base"
                  placeholder="Selected member name"
                />
                <input type="hidden" value={formData.subUserId} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment" className="text-sm sm:text-base">
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
                  onFocus={() => handleInputFocus("installment")}
                  onBlur={() => handleInputBlur("installment")}
                  placeholder="Enter installment"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal" className="text-sm sm:text-base">
                  આ નો ઉ. (Amount)
                </Label>
                <Input
                  id="withdrawal"
                  type="number"
                  value={formData.withdrawal}
                  onChange={(e) =>
                    setFormData({ ...formData, withdrawal: e.target.value })
                  }
                  onFocus={() => handleInputFocus("withdrawal")}
                  onBlur={() => handleInputBlur("withdrawal")}
                  placeholder="Enter withdrawal"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
              <div className="space-y-2">
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
                  onFocus={() => handleInputFocus("interest")}
                  onBlur={() => handleInputBlur("interest")}
                  placeholder="Enter interest"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
              <div className="space-y-2">
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
                  onFocus={() => handleInputFocus("fine")}
                  onBlur={() => handleInputBlur("fine")}
                  placeholder="Enter fine"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="paidwithdrawal"
                  className="text-sm sm:text-base"
                >
                  ઉપાડ જમા (Withdrawal)
                </Label>
                <Input
                  id="paidwithdrawal"
                  type="number"
                  value={formData.paidWithdrawal}
                  onChange={(e) =>
                    setFormData({ ...formData, paidWithdrawal: e.target.value })
                  }
                  onFocus={() => handleInputFocus("paidWithdrawal")}
                  onBlur={() => handleInputBlur("paidWithdrawal")}
                  placeholder="Enter paidwithdrawal"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newWithdrawal" className="text-sm sm:text-base">
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
                  onFocus={() => handleInputFocus("newWithdrawal")}
                  onBlur={() => handleInputBlur("newWithdrawal")}
                  placeholder="Enter new paidwithdrawal"
                  className="text-base"
                  disabled={updatingMemberId !== null}
                />
              </div>
              <div className="space-y-2 sm:col-span-2 flex items-center gap-3 ">
                <Checkbox
                  id="installmentPaid"
                  checked={isInstallmentPaid}
                  onCheckedChange={(checked) =>
                    setIsInstallmentPaid(checked as boolean)
                  }
                  className={`
      border-2
      ${
        isInstallmentPaid
          ? "border-green-600 data-[state=checked]:bg-green-600"
          : formData.pendingInstallment &&
            parseInt(formData.pendingInstallment) > 0
          ? "border-red-600"
          : "border-gray-400"
      }
    `}
                />
                <Label
                  htmlFor="installmentPaid"
                  className="text-sm sm:text-base font-medium"
                >
                  હપ્તો ચૂકવાયો (વર્તમાન + બાકી હપ્તો બંને)
                  {formData.pendingInstallment &&
                    parseInt(formData.pendingInstallment) > 0 && (
                      <span className="text-red-600 text-xs ml-2">
                        (બાકી: ₹{formData.pendingInstallment})
                      </span>
                    )}
                </Label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setFormData({
                    subUserId: "",
                    installment: "",
                    withdrawal: "",
                    interest: "",
                    fine: "",
                    paidWithdrawal: "",
                    newWithdrawal: "",
                    // outerCheckbox: false,
                    // innerCheckbox: false,
                    pendingInstallment: "",
                    paidInstallment: "",
                    paidInterest: "",
                  });
                  setIsInstallmentPaid(true);
                  setSelectedMemberName("");
                  setUpdatingMemberId(null);
                  setIsAddDialogOpen(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAddData}
                className="w-full sm:w-auto"
                disabled={!selectedMemberName || updatingMemberId !== null}
              >
                {updatingMemberId ? (
                  <div className="flex items-center justify-center gap-2">
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

      <Dialog
        open={isAddMonthDialogOpen}
        onOpenChange={setIsAddMonthDialogOpen}
      >
        <DialogContent
          className="max-w-[95vw] sm:max-w-md p-4 sm:p-6"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirm New Month
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-md">
              <div className="flex items-center justify-between">
                {/* Current Month */}
                <div className="flex flex-col items-start">
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {selectedMonth || "No month selected"}
                  </p>
                </div>
                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="h-0.5 w-10 bg-gray-300"></div>
                  <span className="mx-2 text-2xl font-bold text-gray-500">
                    →
                  </span>
                  <div className="h-0.5 w-10 bg-gray-300"></div>
                </div>
                {/* New Month */}
                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-500">New Month</p>
                  <p className="text-lg font-semibold text-green-700">
                    {newMonthName || "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={cancelAddNewMonth}
              className="w-full sm:w-auto"
            >
              Cancel (રદ કરો)
            </Button>
            <Button
              type="button"
              onClick={confirmAddNewMonth}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              disabled={isAddingMonth}
            >
              {isAddingMonth ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader
                    size="sm"
                    variant="white"
                    type="dots"
                    className="!gap-0"
                    show
                  />
                  Creating...
                </div>
              ) : (
                "Confirm (ખાતરી કરો)"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="hidden md:block lg:block">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl font-bold text-red-600">
                {mandalName}
              </CardTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline">
                  {calculations.totalMembers} Members
                </Badge>
                <Badge variant="outline">
                  {selectedMonth
                    ? new Date(selectedMonth + "-01").toLocaleDateString(
                        "en-GB",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "No Month Selected"}
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {isHaptoSet
                    ? `Monthly: ₹${mandalMonthlyInstallment}`
                    : "Monthly: Not Set"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  {months.length} Months
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <div className="max-h-[420px] overflow-y-auto">
              <Table className="min-w-[1000px] w-full">
                <TableHeader className="sticky top-0 z-20 bg-white">
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky top-0 bg-white z-30 text-center"></TableHead>
                    <TableHead className="sticky top-0 bg-white z-30 text-center">
                      ક્રમ નં.
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-30">
                      સભ્યનું નામ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-30 text-center">
                      હપ્તો
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-30 text-center">
                      આ.નો ઉ.
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      વ્યાજ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      દંડ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      ઉપાડ જમા
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      નવો ઉપાડ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
                      હપ્તો + વ્યાજ
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white z-20 text-center">
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
                          <div className="h-5 w-32 md:w-40 bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-20 md:w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-20 md:w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-20 md:w-24 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-5 w-24 md:w-28 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="h-8 w-16 md:w-20 mx-auto bg-gray-200/60 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredMemberData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <HiOutlineUserGroup className="h-10 w-10 md:h-12 md:w-12 mb-3 md:mb-4 opacity-50" />
                          <p className="text-base md:text-lg font-medium mb-1 md:mb-2">
                            {searchQuery
                              ? "No members found"
                              : "No members added yet"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMemberData.map((row, index) => {
                      const carriedForwardAmount =
                        calculateCarriedForwardAmount(row?.subUser?._id);

                      const installmentInfo = getDisplayInstallmentValue(row);
                      const requiredInstallment = installmentInfo.value;

                      const isFullyPaid =
                        (row.paidInstallment || 0) >= requiredInstallment;

                      return (
                        <TableRow key={row._id}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isFullyPaid}
                              disabled={true}
                              className="border border-gray-600 h-5 w-5 rounded-sm
                                data-[state=checked]:bg-green-600
                                data-[state=checked]:border-green-600"
                            />
                          </TableCell>
                          <TableCell className="text-center font-medium text-xs md:text-sm">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-xs md:text-sm">
                            <div className="flex items-center">
                              {row.subUser?.subUserName}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            <div className="flex flex-col items-center">
                              {(() => {
                                const installmentInfo =
                                  getDisplayInstallmentValue(row);

                                return (
                                  <div className="flex flex-col items-center">
                                    <span>
                                      ₹{installmentInfo.value.toLocaleString()}
                                    </span>

                                    {installmentInfo.hasPending && (
                                      <span className="text-[10px] text-red-600 mt-0.5 font-medium">
                                        (empty installment :{" "}
                                        {installmentInfo.pendingAmount})
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </TableCell>

                          <TableCell className="text-center text-xs md:text-sm font-semibold">
                            {carriedForwardAmount > 0 ? (
                              <div className="flex flex-col items-center">
                                <span>
                                  ₹{carriedForwardAmount.toLocaleString()}
                                </span>
                                {row.withdrawal > 0 &&
                                  row.withdrawal !== carriedForwardAmount && (
                                    <span className="text-[10px] text-gray-500">
                                      (Updated: ₹
                                      {row.withdrawal?.toLocaleString()})
                                    </span>
                                  )}
                              </div>
                            ) : row.withdrawal > 0 ? (
                              `₹${row.withdrawal?.toLocaleString()}`
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.interest > 0 ? `₹${row?.interest}` : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.fine > 0 ? `₹${row?.fine}` : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.paidWithdrawal > 0
                              ? `₹${row?.paidWithdrawal.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {row?.newWithdrawal > 0
                              ? `₹${row?.newWithdrawal.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center font-medium text-xs md:text-sm">
                            {(row.installment + row.interest).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRowAction(row)}
                              disabled={updatingMemberId === row?.subUser?._id}
                              className="text-xs h-8 px-2 md:text-sm md:h-9 md:px-3"
                            >
                              {updatingMemberId === row?.subUser?._id ? (
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MOBILE 2-COLUMN CARD GRID */}
      <div
        className="md:block lg:block overflow-y-auto px-4"
        style={{ maxHeight: "calc(100vh - 140px)", paddingBottom: "80px" }}
      >
        <div className="md:hidden grid grid-cols-2 gap-2 mt-3">
          {isMonthLoading || isTableDataLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`mobile-skeleton-${index}`}
                className="bg-gray-100 border border-gray-200 rounded-md p-2 flex flex-col gap-2 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded ml-2 flex-1"></div>
                  <div className="h-4 w-6 bg-gray-300 rounded ml-1"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-8 bg-gray-300 rounded"></div>
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-8 bg-gray-300 rounded"></div>
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                  <div className="h-3 w-12 bg-gray-300 rounded"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-300 rounded"></div>
                  <div className="h-3 w-16 bg-gray-300 rounded"></div>
                </div>

                <div className="mt-2 w-full h-8 bg-gray-300 rounded"></div>
              </div>
            ))
          ) : filteredMemberData.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center text-gray-500 py-8">
              <HiOutlineUserGroup className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-base font-medium mb-2">
                {searchQuery ? "No members found" : "No members added yet"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMemberDialogOpen(true)}
                className="mt-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add First Member
              </Button>
            </div>
          ) : (
            filteredMemberData.map((row, index) => {
              const carriedForwardAmount = calculateCarriedForwardAmount(
                row?.subUser?._id
              );

              const installmentInfo = getDisplayInstallmentValue(row);
              const requiredInstallment = installmentInfo.value;

              const isFullyPaid =
                (row.paidInstallment || 0) >= requiredInstallment;

              return (
                <div
                  key={row._id}
                  className="bg-white border border-b-emerald-500 shadow-sm rounded-md p-2 flex flex-col gap-1"
                >
                  {/* TOP: Checkbox + Name + Index */}
                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={isFullyPaid}
                      disabled={true}
                      className="
                  h-4 w-4 border border-gray-600
                  data-[state=checked]:bg-green-600
                  data-[state=checked]:border-green-600
                "
                    />
                    <p className="font-semibold text-[11px] text-gray-500 truncate flex-1 ml-2">
                      {row?.subUser?.subUserName}
                    </p>
                    <span className="text-[10px] text-green-700 ml-1">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">હપ્તો</span>
                    <div className="flex flex-col items-end">
                      {(() => {
                        const installmentInfo = getDisplayInstallmentValue(row);

                        return (
                          <div className="flex flex-col items-center">
                            <span>
                              ₹{installmentInfo.value.toLocaleString()}
                            </span>

                            {installmentInfo.hasPending && (
                              <span className="text-[10px] text-red-600 mt-0.5 font-medium">
                                (empty installment :{" "}
                                {installmentInfo.pendingAmount})
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">આ.નો ઉ.</span>
                    <span className="font-semibold text-green-700">
                      {carriedForwardAmount > 0 ? (
                        <div className="flex flex-col items-center">
                          {row.withdrawal > 0 &&
                            row.withdrawal !== carriedForwardAmount && (
                              <span className="text-[10px] text-gray-500">
                                (Updated: ₹{row.withdrawal?.toLocaleString()})
                              </span>
                            )}
                        </div>
                      ) : row.withdrawal > 0 ? (
                        `₹${row.withdrawal?.toLocaleString()}`
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">વ્યાજ</span>
                    <span className="font-semibold text-green-700">
                      {row?.interest > 0 ? `₹${row?.interest}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">દંડ</span>
                    <span className="font-semibold text-green-700">
                      {row.fine > 0 ? `₹${row.fine}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">ઉપાડ જમા</span>
                    <span className="font-semibold text-green-700">
                      {row?.paidWithdrawal > 0
                        ? `₹${row?.paidWithdrawal.toLocaleString()}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">નવો ઉપાડ</span>
                    <span className="font-semibold text-green-700">
                      {row?.newWithdrawal > 0
                        ? `₹${row?.newWithdrawal.toLocaleString()}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-600">કુલ (હપ્તો+વ્યાજ)</span>
                    <span className="font-semibold text-green-700">
                      {(row.installment + row.interest).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRowAction(row)}
                    disabled={updatingMemberId === row?.subUser?._id}
                    className="mt-2 w-full py-1
                rounded text-[10px] active:scale-95"
                  >
                    {updatingMemberId === row?.subUser?._id ? (
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
                </div>
              );
            })
          )}
        </div>

        {/* Summary Calculations Section - Mobile Skeleton */}
        {isMonthLoading || isTableDataLoading ? (
          <div className="mt-6">
            <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`calc-skeleton-${index}`}
                  className="bg-gray-100 border border-gray-200 rounded-md p-3 animate-pulse"
                >
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          memberData.length > 0 && (
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Summary Calculations (Month)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          કુલ હપ્તા
                        </p>
                        <p className="text-lg font-bold text-blue-800">
                          ₹{calculations.totalInstallments.toLocaleString()}
                        </p>
                      </div>
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-blue-600"
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
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-600">
                          કુલ બ્યાજ
                        </p>
                        <p className="text-lg font-bold text-green-800">
                          ₹{calculations.totalInterest.toLocaleString()}
                        </p>
                      </div>
                      <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-green-600"
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
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-600">
                          કુલ ઉપાડ જમા
                        </p>
                        <p className="text-lg font-bold text-orange-800">
                          ₹{calculations.totalWithdrawals.toLocaleString()}
                        </p>
                      </div>
                      <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-orange-600"
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
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-purple-600">
                          કુલ રકમ
                        </p>
                        <p className="text-lg font-bold text-purple-800">
                          ₹{calculations.totalName.toLocaleString()}
                        </p>
                      </div>
                      <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-purple-600"
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
            </div>
          )
        )}
      </div>

      <MobileFooter>
        <div
          className="
      fixed bottom-0 left-0 right-0
      bg-white border-t shadow-md
      p-2
      flex flex-row items-center justify-between
      gap-1
      sm:hidden
      z-30
    "
        >
          <div className="relative">
            <button
              id="mobile-month-btn"
              onClick={() =>
                document.getElementById("mobile-month-trigger")?.click()
              }
              className="flex flex-col items-center mx-0.5 px-3"
              disabled={isMonthLoading}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-[10px]">Month</span>
            </button>
            {/* Hidden Select Trigger */}
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              disabled={isMonthLoading}
            >
              <SelectTrigger
                id="mobile-month-trigger"
                className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
              >
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="center"
                className="z-[9999]"
              >
                {months?.map((monthObj) => (
                  <SelectItem key={monthObj._id} value={monthObj.month}>
                    {new Date(monthObj.month + "-01").toLocaleString(
                      "default",
                      {
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 2) Add Month */}
          <button
            onClick={handleAddNewMonth}
            className="flex flex-col text-center items-center text-xs mx-0.5 px-3"
            disabled={isMonthLoading}
          >
            {isAddingMonth ? (
              <>
                <div className="h-5 w-6 flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse"></div>
                </div>
                <span className="text-[10px]">Adding...</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-6" />
                <span className="text-[10px]">Add month</span>
              </>
            )}
          </button>
          {/* 3) Add Member Dialog */}
          <button
            onClick={() => setIsAddMemberDialogOpen(true)}
            className="flex flex-col items-center text-xs"
            disabled={isMonthLoading}
          >
            <IoPersonAdd className="h-5 w-5 gap-1.5" />
            <span className="text-[10px]">Add Member</span>
          </button>
          {/* 4) Hapto Dialog */}
          <button
            onClick={() => setIsHaptoDialogOpen(true)}
            className="flex flex-col items-center text-xs px-3"
            disabled={isMonthLoading}
          >
            <TbTransactionRupee className="h-5 w-5" />
            <span className="text-[10px]">Hapto</span>
          </button>
        </div>
      </MobileFooter>
    </>
  );
}
