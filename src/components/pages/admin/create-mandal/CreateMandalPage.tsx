"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Users, Shield, Calendar } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

interface MandalFormData {
  mandalName: string
  mandalNameGujarati: string
  description: string
  adminName: string
  adminEmail: string
  adminPhone: string
  adminPassword: string
  confirmPassword: string
  establishedDate: string
  isActive: boolean
}

export default function CreateMandalPage() {
  const [formData, setFormData] = useState<MandalFormData>({
    mandalName: "",
    mandalNameGujarati: "",
    description: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    confirmPassword: "",
    establishedDate: "",
    isActive: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof MandalFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate passwords match
    if (formData.adminPassword !== formData.confirmPassword) {
      alert("Passwords do not match!")
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Mandal created:", formData)
    alert("મંડળ સફળતાપૂર્વક બનાવવામાં આવ્યું! (Mandal created successfully!)")
    setIsSubmitting(false)
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mandalNameGujarati">મંડળનું નામ (Gujarati)</Label>
                <Input
                  id="mandalNameGujarati"
                  placeholder="મંડળનું નામ ગુજરાતીમાં લખો"
                  value={formData.mandalNameGujarati}
                  onChange={(e) => handleInputChange("mandalNameGujarati", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter mandal description and purpose"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Credentials
            </CardTitle>
            <CardDescription>એડમિન લોગિન માટેની માહિતી (Admin login information)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  placeholder="Enter admin full name"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange("adminName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Admin Phone</Label>
              <Input
                id="adminPhone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.adminPhone}
                onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter strong password"
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                    required
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
                    required
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
                required
              />
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
                <p className="text-sm text-muted-foreground">{formData.adminName || "Not specified"}</p>
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
          <Button type="button" variant="outline">
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
