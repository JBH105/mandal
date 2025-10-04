"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Plus,Calendar, DollarSign, TrendingUp, Minus, User,} from "lucide-react";
import { getMandals, getMandalSubUsersApi, createMandalSubUserApi, createMemberDataApi, getMemberDataApi, getAllMonthsApi, MemberData, } from "@/auth/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BiDollar } from "react-icons/bi";
import { HiArrowTrendingUp,HiArrowTrendingDown  } from "react-icons/hi2";

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

interface NewMemberForm {
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
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState<boolean>(false);
  const [newMemberData, setNewMemberData] = useState<NewMemberForm>({
    subUserName: "",
    phoneNumber: "",
  });

  // Fetch Mandal data to get mandal ID and details
  useEffect(() => {
    const fetchMandal = async () => {
      try {
        const mandals = await getMandals();
        if (mandals.length > 0) {
          setMandalName(mandals[0].nameGu);
          setEstablishedDate(mandals[0].establishedDate);
          setMandalId(mandals[0]._id);
        } else {
          setMandalName("No Mandal Found");
        }
      } catch (error) {
        console.error("Error fetching mandal:", error);
        setMandalName("Error Loading Mandal");
      }
    };
    fetchMandal();
  }, []);

  // Fetch sub-users filtered by mandal ID
  useEffect(() => {
    const fetchSubUsers = async () => {
      if (!mandalId) return;
      try {
        const users = await getMandalSubUsersApi();
        const filteredUsers = users.filter((user: SubUser) => user.mandal === mandalId);
        setSubUsers(filteredUsers);
      } catch (error) {
        console.log("🚀 ~ fetchSubUsers ~ error:", error)
        showErrorToast("Error fetching sub-users:");
        setSubUsers([]);
      }
    };
    fetchSubUsers();
  }, [mandalId]);

  // Fetch all months on component mount
  useEffect(() => {
    const fetchAllMonths = async () => {
      try {
        let allMonths = await getAllMonthsApi();
        // Ensure allMonths is an array
        if (!Array.isArray(allMonths)) {
          console.warn("getAllMonthsApi did not return an array:", allMonths);
          allMonths = [];
        }
        if (allMonths.length === 0 && establishedDate) {
          const defaultMonth = `${establishedDate.slice(0, 7)}`;
          allMonths = [defaultMonth];
        }
        setMonths(allMonths);
        if (allMonths.length > 0 && !selectedMonth) {
          setSelectedMonth(allMonths[0]);
        }
      } catch (error) {
        showErrorToast("Error fetching all months:");
        console.error(error);
        setMonths([]); // Fallback to empty array on error
      }
    };
    fetchAllMonths();
  }, [establishedDate, selectedMonth]);

  // Fetch member data when selectedMonth changes
  useEffect(() => {
    if (!selectedMonth) return;
    const fetchMemberData = async () => {
      try {
        const data: MemberData[] = await getMemberDataApi(selectedMonth);
        setMemberData(data);
      } catch (error) {
        console.log("🚀 ~ fetchMemberData ~ error:", error)
        showErrorToast("Error fetching member data:");
      }
    };
    fetchMemberData();
  }, [selectedMonth]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  };

  const calculations: Calculations = {
    totalInstallments: memberData.reduce((sum, row) => sum + row.installment, 0),
    totalAmount: memberData.reduce((sum, row) => sum + row.amount, 0),
    totalInterest: memberData.reduce((sum, row) => sum + row.interest, 0),
    totalFines: memberData.reduce((sum, row) => sum + row.fine, 0),
    totalWithdrawals: memberData.reduce((sum, row) => sum + row.withdrawal, 0),
    totalNewWithdrawals: memberData.reduce((sum, row) => sum + row.newWithdrawal, 0),
    grandTotal: 0,
    totalMembers: memberData.length,
    totalName: 0,
    bandSilak: 0,
    Mandalcash: 0,
    interestPerPerson: 0,
    perPerson: 0,
  };

  calculations.totalName = calculations.totalInstallments + calculations.totalInterest + calculations.totalWithdrawals;
  calculations.bandSilak = calculations.totalName - calculations.totalNewWithdrawals;
  calculations.Mandalcash = calculations.grandTotal + calculations.bandSilak;
  calculations.interestPerPerson = calculations.totalMembers > 0 ? calculations.totalInterest / calculations.totalMembers : 0;
  calculations.perPerson = calculations.totalMembers > 0 ? calculations.bandSilak / calculations.totalMembers : 0;

  const handleAddMember = async () => {
    if (!newMemberData?.subUserName || !newMemberData?.phoneNumber) {
      showErrorToast("Please fill all fields");
      return;
    }

    try {
      const response = await createMandalSubUserApi({
        subUserName: newMemberData?.subUserName,
        phoneNumber: newMemberData?.phoneNumber,
      });

      showSuccessToast(response.message || "Sub-user created successfully");
      // Add new sub-user to the list if it matches the mandalId
      if (response.mandal === mandalId) {
        setSubUsers([...subUsers, { _id: response._id, mandal: response.mandal, ...newMemberData }]);
      }
      setNewMemberData({ subUserName: "", phoneNumber: "" });
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      console.log("🚀 ~ handleAddMember ~ error:", error)
      showErrorToast("Failed to create sub-user");
    }
  };

  const handleAddData = async () => {
    if (!formData.subUserId || !selectedMonth) {
      showErrorToast("Please select a member and month");
      return;
    }

    try {
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
      showSuccessToast(response.message || "Member data added successfully");

      // Refresh member data
      const updatedData = await getMemberDataApi(selectedMonth);
      setMemberData(updatedData);

      // Reset form
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
      console.log("🚀 ~ handleAddData ~ error:", error)
      showErrorToast("Failed to add member data");
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
      let prevData: MemberData[] = [];
      if (months.length > 0) {
        const latestMonth = months[0];
        prevData = await getMemberDataApi(latestMonth);
      }

      for (const subUser of subUsers) {
        const prev = prevData.find(p => p.subUser._id === subUser._id);
        const data = {
          subUserId: subUser._id,
          month: newMonth,
          installment: prev ? prev.installment : 0,
          amount: prev ? prev.amount : 0,
          interest: prev ? prev.interest : 0,
          fine: prev ? prev.fine : 0,
          withdrawal: prev ? prev.withdrawal : 0,
          newWithdrawal: prev ? prev.newWithdrawal : 0,
        };
        await createMemberDataApi(data);
      }

      // Refetch all months to include the new one
      const allMonths = await getAllMonthsApi();
      // Ensure allMonths is an array
      const validMonths = Array.isArray(allMonths) ? allMonths : [];
      setMonths(validMonths);

      // Set the new month as selected and fetch its data
      setSelectedMonth(newMonth);
      const data = await getMemberDataApi(newMonth);
      setMemberData(data);

      showSuccessToast(`Month ${newMonth} initialized successfully`);
    } catch (error) {
      showErrorToast("Error initializing new month data:");
      console.error(error);
    }
  };

  return (
    <>
      <PageHeader
        title="Monthly Ledger"
        description="View your monthly ledger, withdrawals, and interest earnings in one place."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] sm:w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
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
          </Select>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" disabled={!selectedMonth}>
                <Plus className="h-4 w-4" />
                Update Member Data
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
                      const existing = memberData.find(m => m.subUser?._id === value);
                      if (existing) {
                        setFormData({
                          subUserId: value,
                          installment: existing.installment.toString(),
                          amount: existing.amount.toString(),
                          interest: existing.interest.toString(),
                          fine: existing.fine.toString(),
                          withdrawal: existing.withdrawal.toString(),
                          newWithdrawal: existing.newWithdrawal.toString(),
                        });
                      } else {
                        setFormData({
                          subUserId: value,
                          installment: "",
                          amount: "",
                          interest: "",
                          fine: "",
                          withdrawal: "",
                          newWithdrawal: "",
                        });
                      }
                    }}
                    disabled={subUsers?.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          subUsers?.length === 0
                            ? "No member added"
                            : "Select member"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subUsers?.map((user) => (
                        <SelectItem key={user?._id} value={user?._id}>
                          {user?.subUserName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="installment" className="text-sm sm:text-base">
                    હપ્તો (Installment)
                  </Label>
                  <Input
                    id="installment"
                    type="number"
                    value={formData?.installment}
                    onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                    placeholder="1000"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-sm sm:text-base">
                    આ નો ઉ. (Amount)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData?.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="interest" className="text-sm sm:text-base">
                    બ્યાજ (Interest)
                  </Label>
                  <Input
                    id="interest"
                    type="number"
                    value={formData?.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    placeholder="0"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fine" className="text-sm sm:text-base">
                    દંડ (Fine)
                  </Label>
                  <Input
                    id="fine"
                    type="number"
                    value={formData?.fine}
                    onChange={(e) => setFormData({ ...formData, fine: e.target.value })}
                    placeholder="0"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="withdrawal" className="text-sm sm:text-base">
                    ઉપાડ જમા (Withdrawal)
                  </Label>
                  <Input
                    id="withdrawal"
                    type="number"
                    value={formData?.withdrawal}
                    onChange={(e) => setFormData({ ...formData, withdrawal: e.target.value })}
                    placeholder="0"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newWithdrawal" className="text-sm sm:text-base">
                    નવો ઉપાડ (New Withdrawal)
                  </Label>
                  <Input
                    id="newWithdrawal"
                    type="number"
                    value={formData?.newWithdrawal}
                    onChange={(e) => setFormData({ ...formData, newWithdrawal: e.target.value })}
                    placeholder="0"
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddData}
                  className="text-sm sm:text-base"
                  disabled={subUsers?.length === 0}
                >
                  Add Data
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Member
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
                  <Label htmlFor="subUserName" className="text-sm sm:text-base">
                    Member Name
                  </Label>
                  <Input
                    id="subUserName"
                    value={newMemberData?.subUserName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, subUserName: e.target.value })}
                    placeholder="Enter member name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-sm sm:text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={newMemberData?.phoneNumber}
                    onChange={(e) => setNewMemberData({ ...newMemberData, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleAddNewMonth} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add New Month
          </Button>

          {/* <Button variant="outline" className="w-full sm:w-auto">
            Export Report
          </Button> */}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <HiOutlineUserGroup />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculations?.totalMembers}</div>
            <p className="text-xs text-green-600">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <BiDollar />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{calculations?.totalInstallments.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Total amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
            <HiArrowTrendingUp />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{calculations?.totalInterest.toLocaleString()}
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
              ₹{calculations?.totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-red-600">Total withdrawals</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hidden lg:block">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-red-600">{mandalName}</CardTitle>
              <div className="flex gap-4 mt-2">
                <Badge variant="outline">{calculations?.totalMembers}</Badge>
                <Badge variant="outline">
                  {selectedMonth
                    ? new Date(selectedMonth + "-01").toLocaleDateString("en-GB")
                    : "No Month Selected"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm">
                Print
              </Button> */}
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center font-semibold">ક્રમ નં.</TableHead>
                  <TableHead className="min-w-[200px] font-semibold">સભ્યનું નામ</TableHead>
                  <TableHead className="text-center font-semibold">હપ્તો</TableHead>
                  <TableHead className="text-center font-semibold">આ.નો ઉ.</TableHead>
                  <TableHead className="text-center font-semibold">વ્યાજ</TableHead>
                  <TableHead className="text-center font-semibold">દંડ</TableHead>
                  <TableHead className="text-center font-semibold">ઉપાડ જમા</TableHead>
                  <TableHead className="text-center font-semibold">નવો ઉપાડ</TableHead>
                  <TableHead className="text-center font-semibold">હપ્તો + વ્યાજ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberData.map((row, index) => (
                  <TableRow key={row._id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{row.subUser?.subUserName}</TableCell>
                    <TableCell className="text-center">₹{row.installment?.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      {row?.amount > 0 ? `₹${row?.amount.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {row?.interest > 0 ? `₹${row?.interest}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {row?.fine > 0 ? `₹${row?.fine}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {row?.withdrawal > 0 ? `₹${row?.withdrawal.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {row?.newWithdrawal > 0 ? `₹${row?.newWithdrawal.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      ₹{row.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-red-600">{mandalName}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{calculations?.totalMembers} Members</Badge>
              <Badge variant="outline" className="text-xs">
                {selectedMonth
                  ? new Date(selectedMonth + "-01").toLocaleDateString("en-GB")
                  : "No Month Selected"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="text-xs px-2 bg-transparent">
              Print
            </Button>
            <Button variant="outline" size="sm" className="text-xs px-2 bg-transparent">
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {memberData?.map((row, index) => (
            <Card key={row._id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    </div>
                    <h4 className="font-semibold text-base text-gray-900">{row?.subUser?.subUserName}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₹{row?.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-gray-600">હપ્તો</p>
                      <p className="font-medium">₹{row?.installment.toLocaleString()}</p>
                    </div>
                  </div>

                  {row?.amount > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-gray-600">આ નો ઉ.</p>
                        <p className="font-medium">₹{row?.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {row?.interest > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-gray-600">બ્યાજ</p>
                        <p className="font-medium">₹{row?.interest}</p>
                      </div>
                    </div>
                  )}

                  {row?.withdrawal > 0 && (
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-gray-600">ઉપાડ જમા</p>
                        <p className="font-medium">₹{row?.withdrawal.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {row?.fine > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-gray-600">દંડ</p>
                        <p className="font-medium">₹{row?.fine}</p>
                      </div>
                    </div>
                  )}

                  {row?.newWithdrawal > 0 && (
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="text-gray-600">નવો ઉપાડ</p>
                        <p className="font-medium">₹{row?.newWithdrawal.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Summary Calculations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">કુલ હપ્તા</p>
                  <p className="text-2xl font-bold text-blue-800">₹{calculations.totalInstallments.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-green-600">કુલ બ્યાજ</p>
                  <p className="text-2xl font-bold text-green-800">₹{calculations.totalInterest.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-orange-600">કુલ ઉપાડ જમા</p>
                  <p className="text-2xl font-bold text-orange-800">
                    ₹{calculations.totalWithdrawals.toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
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
                  <p className="text-2xl font-bold text-purple-800">₹{calculations.totalName.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span className="font-medium">Total Members ( કુલ સભ્ય ):</span>
                  <span className="font-bold">{calculations.totalMembers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Installments ( કુલ હપ્તો ):</span>
                  <span className="font-bold">₹{calculations.totalInstallments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Interest ( કુલ વ્યાજ ):</span>
                  <span className="font-bold">₹{calculations.totalInterest.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Withdrawals Deposit ( ઉપાડ જમા ):</span>
                  <span className="font-bold">₹{calculations.totalWithdrawals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                  <span className="font-bold text-blue-800">Total ( કુલ રકમ ):</span>
                  <span className="font-bold text-xl text-blue-800">₹{calculations.totalName.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">New Withdrawals ( નવો ઉપાડ ):</span>
                  <span className="font-bold">₹{calculations.totalNewWithdrawals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200">
                  <span className="font-bold text-green-800">Band Silak ( શ્રી બંધ સિલક: )</span>
                  <span className="font-bold text-xl text-green-800">₹{calculations.bandSilak.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
                  <span className="font-bold text-blue-800">Grand Total ( કુલ ધીરાણા ):</span>
                  <span className="font-bold text-xl text-blue-800">₹ {calculations.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
                <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-2 border-red-200 mt-6">
                  <span className="font-bold text-red-800">Mandal&apos;s cash ( મંડળની રોકડ ):</span>
                  <span className="font-bold text-xl text-red-800">₹ {calculations.Mandalcash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200 mt-6">
                  <span className="font-bold text-green-800">per person ( વ્યક્તિ દીઠ ):</span>
                  <span className="font-bold text-xl text-green-800">₹ {calculations.perPerson.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-200 mt-6">
                  <span className="font-bold text-green-800">Interest per person ( વ્યક્તિ દીઠ વ્યાજ):</span>
                  <span className="font-bold text-xl text-green-800">₹ {calculations.interestPerPerson.toLocaleString()}</span>
                </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}