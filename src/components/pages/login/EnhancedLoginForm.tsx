import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Phone, Lock, Loader2 } from "lucide-react"

export function EnhancedLoginForm() {
    const router = useRouter()
    const [mobile, setMobile] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: mobile, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Login failed")
            } else {
                if (rememberMe) {
                    localStorage.setItem("token", data.token)
                } else {
                    sessionStorage.setItem("token", data.token)
                    sessionStorage.setItem("role", data.role)
                }

                const user = JSON.parse(atob(data.token.split(".")[1]))
                if (user.role === "admin") {
                    router.push("/admin/dashboard")
                } else {
                    router.push("/mandal/dashboard")
                }
            }
        } catch (err) {
            console.log("🚀 ~ handleLogin ~ err:", err)
            setError("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">Sign In</h2>
                    <p className="text-sm text-muted-foreground mt-2">Enter your mobile number and password</p>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium">
                            Mobile Number
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="pl-10 h-11"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                                Remember me
                            </Label>
                        </div>
                        <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
                            Forgot password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                {/* <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button className="text-primary hover:text-primary/80 font-medium transition-colors">Sign up</button>
          </p>
        </div> */}
            </CardContent>
        </Card>
    )
}

export default EnhancedLoginForm;