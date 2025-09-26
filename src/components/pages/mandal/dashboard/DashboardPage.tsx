
export default function DashboardPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">DashboardPage</h1>
                <p className="text-muted-foreground">View your Mandal Dashboard and insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
                    <p className="text-2xl font-bold text-foreground">12,345</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground">Conversions</h3>
                    <p className="text-2xl font-bold text-foreground">1,234</p>
                    <p className="text-xs text-green-600">+8% from last month</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
                    <p className="text-2xl font-bold text-foreground">$45,678</p>
                    <p className="text-xs text-green-600">+15% from last month</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground">Users</h3>
                    <p className="text-2xl font-bold text-foreground">8,901</p>
                    <p className="text-xs text-red-600">-2% from last month</p>
                </div>
            </div>
        </div>

    )
}