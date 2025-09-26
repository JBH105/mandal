import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample latest mandals data
const latestMandals = [
  {
    id: 1,
    nameEn: "Shri Khodiyar Mandal",
    nameGu: "શ્રી ખોડિયાર મંડળ",
    adminUsername: "khodiyar_admin",
    establishedDate: "2024-01-15",
    status: "Active",
    totalMembers: 25,
  },
  {
    id: 2,
    nameEn: "Ganesh Mandal",
    nameGu: "ગણેશ મંડળ",
    adminUsername: "ganesh_admin",
    establishedDate: "2024-02-20",
    status: "Active",
    totalMembers: 30,
  },
  {
    id: 3,
    nameEn: "Durga Mata Mandal",
    nameGu: "દુર્ગા માતા મંડળ",
    adminUsername: "durga_admin",
    establishedDate: "2024-03-10",
    status: "Inactive",
    totalMembers: 18,
  },
  {
    id: 4,
    nameEn: "Hanuman Mandal",
    nameGu: "હનુમાન મંડળ",
    adminUsername: "hanuman_admin",
    establishedDate: "2024-04-05",
    status: "Active",
    totalMembers: 22,
  },
  {
    id: 5,
    nameEn: "Saraswati Mandal",
    nameGu: "સરસ્વતી મંડળ",
    adminUsername: "saraswati_admin",
    establishedDate: "2024-05-12",
    status: "Active",
    totalMembers: 35,
  },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's what's happening with your business today.">
        <Button>Export Data</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20m9-9H3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Latest Created Mandals</CardTitle>
            <CardDescription>Recently created mandals in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50">
                    <TableHead className="font-semibold text-red-800">Sr. No.</TableHead>
                    <TableHead className="font-semibold text-red-800">Mandal Name</TableHead>
                    <TableHead className="font-semibold text-red-800">મંડળ નામ</TableHead>
                    <TableHead className="font-semibold text-red-800">Admin</TableHead>
                    <TableHead className="font-semibold text-red-800">Status</TableHead>
                    <TableHead className="font-semibold text-red-800">Members</TableHead>
                    <TableHead className="font-semibold text-red-800">Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestMandals.slice(0, 5).map((mandal, index) => (
                    <TableRow key={mandal.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{mandal.nameEn}</TableCell>
                      <TableCell className="font-medium">{mandal.nameGu}</TableCell>
                      <TableCell>{mandal.adminUsername}</TableCell>
                      <TableCell>
                        <Badge
                          variant={mandal.status === "Active" ? "default" : "secondary"}
                          className={
                            mandal.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {mandal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{mandal.totalMembers}</TableCell>
                      <TableCell>{new Date(mandal.establishedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline">View All Mandals</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
