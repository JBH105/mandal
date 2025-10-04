import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Phone, Lock, Loader2 } from "lucide-react";
import { login } from "@/auth/auth";
import { showErrorToast } from "@/lib/toast";

export function EnhancedLoginForm() {
  const router = useRouter();
  const [mobile, setMobile] = useState("+91");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    mobile: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    mobile: false,
    password: false
  });

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (!value.startsWith("+91")) {
      value = "+91" + value.replace(/^\+91/, "").replace(/[^0-9]/g, "");
    }
    
    value = "+91" + value.slice(3).replace(/[^0-9]/g, "");
    
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    
    setMobile(value);
    
    // Clear mobile validation error when user types
    if (validationErrors.mobile) {
      setValidationErrors(prev => ({ ...prev, mobile: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear password validation error when user types
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleBlur = (field: 'mobile' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: 'mobile' | 'password') => {
    if (field === 'mobile') {
      const formattedMobile = mobile.replace(/^\+91/, '').replace(/[^0-9]/g, '');
      if (!formattedMobile) {
        setValidationErrors(prev => ({ ...prev, mobile: "Mobile number is required" }));
      } else if (formattedMobile.length !== 10) {
        setValidationErrors(prev => ({ ...prev, mobile: "Please enter a valid 10-digit mobile number" }));
      } else {
        setValidationErrors(prev => ({ ...prev, mobile: "" }));
      }
    } else if (field === 'password') {
      if (!password) {
        setValidationErrors(prev => ({ ...prev, password: "Password is required" }));
      } else {
        setValidationErrors(prev => ({ ...prev, password: "" }));
      }
    }
  };

  const validateForm = () => {
    const errors = {
      mobile: "",
      password: ""
    };

    const formattedMobile = mobile.replace(/^\+91/, '').replace(/[^0-9]/g, '');
    
    if (!formattedMobile) {
      errors.mobile = "Mobile number is required";
    } else if (formattedMobile.length !== 10) {
      errors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    setTouched({ mobile: true, password: true });

    return !errors.mobile && !errors.password;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhoneNumber = mobile.replace(/^\+91/, '').replace(/[^0-9]/g, '');
      const data = await login(formattedPhoneNumber, password);

      if (data.error) {
        showErrorToast(data.error || "Login failed");
      } else {
        if (rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }

        const user = JSON.parse(atob(data.token.split(".")[1]));
        if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/mandal/analytics");
        }
      }
    } catch (err) {
      console.log("🚀 ~ handleLogin ~ err:", err)
      showErrorToast("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isMobileInvalid = touched.mobile && validationErrors.mobile;
  const isPasswordInvalid = touched.password && validationErrors.password;

  return (
    <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Log In</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your mobile number and password
          </p>
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
                onChange={handleMobileChange}
                onBlur={() => handleBlur('mobile')}
                className={`pl-10 h-11 ${isMobileInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            </div>
            {isMobileInvalid && (
              <p className="text-destructive text-sm mt-1">{validationErrors.mobile}</p>
            )}
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
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                className={`pl-10 pr-10 h-11 ${isPasswordInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {isPasswordInvalid && (
              <p className="text-destructive text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
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
                Log in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default EnhancedLoginForm;