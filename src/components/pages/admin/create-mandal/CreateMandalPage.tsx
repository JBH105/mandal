"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Users, Shield, Calendar } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { createMandal } from "@/auth/auth"
import { showErrorToast, showSuccessToast } from "@/middleware/lib/toast"
import { useMandalForm } from "@/hooks/useMandalForm"
import { useRouter } from "next/navigation"

export default function CreateMandalPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  
  const {
    formData,
    validationErrors,
    handleInputChange,
    handleBlur,
    validateAllFields,
    resetForm,
    isFieldInvalid,
  } = useMandalForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAllFields()) {
      showErrorToast("Please fix validation errors before submitting")
      return
    }

    if (formData.mandalUserPassword !== formData.confirmPassword) {
      showErrorToast("Passwords do not match!")
      return
    }

    setIsSubmitting(true)

    // Strip +91 from phone number for payload
    const cleanedPhoneNumber = formData.mandalUserPhone.replace(/^\+91\s*/, '')

    console.log("Payload being sent:", {
      nameEn: formData.mandalName,
      nameGu: formData.mandalNameGujarati,
      userName: formData.mandalUserName,
      phoneNumber: cleanedPhoneNumber,
      password: formData.mandalUserPassword,
      confirmPassword: formData.confirmPassword,
      establishedDate: formData.establishedDate,
      isActive: formData.isActive,
    });

    try {
      await createMandal({
        nameEn: formData.mandalName,
        nameGu: formData.mandalNameGujarati,
        userName: formData.mandalUserName,
        phoneNumber: cleanedPhoneNumber,
        password: formData.mandalUserPassword,
        confirmPassword: formData.confirmPassword,
        establishedDate: formData.establishedDate,
        isActive: formData.isActive,
      })

      showSuccessToast("મંડળ સફળતાપૂર્વક બનાવવામાં આવ્યું! (Mandal created successfully!)")
      
      // Wait 1 second to show the success message, then redirect
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1000)
      
    } catch (error) {
      console.error("Error creating mandal:", error)
      showErrorToast("Failed to create mandal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Mandal"
        subtitle="મંડળ બનાવો"
        description="Create a new mandal with admin credentials and configuration settings"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>મંડળની મૂળભૂત માહિતી (Basic mandal information)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mandalName">Mandal Name (English)</Label>
                <Input
                  id="mandalName"
                  placeholder="Enter mandal name in English"
                  value={formData.mandalName}
                  onChange={(e) => handleInputChange("mandalName", e.target.value)}
                  onBlur={() => handleBlur("mandalName")}
                  className={isFieldInvalid("mandalName") ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {isFieldInvalid("mandalName") && (
                  <p className="text-destructive text-sm mt-1">{validationErrors.mandalName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mandalNameGujarati">મંડળનું નામ (Gujarati)</Label>
                <Input
                  id="mandalNameGujarati"
                  placeholder="મંડળનું નામ ગુજરાતીમાં લખો"
                  value={formData.mandalNameGujarati}
                  onChange={(e) => handleInputChange("mandalNameGujarati", e.target.value)}
                  onBlur={() => handleBlur("mandalNameGujarati")}
                  className={isFieldInvalid("mandalNameGujarati") ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {isFieldInvalid("mandalNameGujarati") && (
                  <p className="text-destructive text-sm mt-1">{validationErrors.mandalNameGujarati}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Mandal User Credentials
            </CardTitle>
            <CardDescription>મંડળ યુઝર લોગિન માટેની માહિતી (Mandal User login information)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mandalUserName">Mandal User Name</Label>
                <Input
                  id="mandalUserName"
                  placeholder="Enter admin full name"
                  value={formData.mandalUserName}
                  onChange={(e) => handleInputChange("mandalUserName", e.target.value)}
                  onBlur={() => handleBlur("mandalUserName")}
                  className={isFieldInvalid("mandalUserName") ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {isFieldInvalid("mandalUserName") && (
                  <p className="text-destructive text-sm mt-1">{validationErrors.mandalUserName}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mandalUserPhone">User Phone</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
                <Input
                  id="mandalUserPhone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mandalUserPhone.replace(/^\+91\s*/, '')}
                  onChange={(e) => handleInputChange("mandalUserPhone", `+91 ${e.target.value.replace(/[^0-9]/g, '')}`)}
                  onBlur={() => handleBlur("mandalUserPhone")}
                  maxLength={10}
                  className={`pl-12 ${isFieldInvalid("mandalUserPhone") ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {isFieldInvalid("mandalUserPhone") && (
                <p className="text-destructive text-sm mt-1">{validationErrors.mandalUserPhone}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mandalUserPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="mandalUserPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter strong password"
                    value={formData.mandalUserPassword}
                    onChange={(e) => handleInputChange("mandalUserPassword", e.target.value)}
                    onBlur={() => handleBlur("mandalUserPassword")}
                    className={isFieldInvalid("mandalUserPassword") ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {isFieldInvalid("mandalUserPassword") && (
                  <p className="text-destructive text-sm mt-1">{validationErrors.mandalUserPassword}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={isFieldInvalid("confirmPassword") ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {isFieldInvalid("confirmPassword") && (
                  <p className="text-destructive text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuration Settings
            </CardTitle>
            <CardDescription>મંડળની સેટિંગ્સ (Mandal configuration and rules)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="establishedDate">Established Date</Label>
              <Input
                id="establishedDate"
                type="date"
                value={formData.establishedDate}
                onChange={(e) => handleInputChange("establishedDate", e.target.value)}
                onBlur={() => handleBlur("establishedDate")}
                className={isFieldInvalid("establishedDate") ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {isFieldInvalid("establishedDate") && (
                <p className="text-destructive text-sm mt-1">{validationErrors.establishedDate}</p>
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this mandal for member registration and operations
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Review mandal information before creating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Mandal Name:</p>
                <p className="text-sm text-muted-foreground">
                  {formData.mandalName || "Not specified"}
                  {formData.mandalNameGujarati && ` (${formData.mandalNameGujarati})`}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Admin:</p>
                <p className="text-sm text-muted-foreground">{formData.mandalUserName || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Established Date:</p>
                <p className="text-sm text-muted-foreground">{formData.establishedDate || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status:</p>
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Mandal..." : "Create Mandal"}
          </Button>
        </div>
      </form>
    </div>
  )
}