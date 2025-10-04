import { useState } from "react"
import { MandalFormData, ValidationErrors, validateField, validateForm } from "@/lib/validation/mandalSchema"

export const useMandalForm = (initialData?: Partial<MandalFormData>) => {
  const [formData, setFormData] = useState<MandalFormData>({
    mandalName: "",
    mandalNameGujarati: "",
    mandalUserName: "",
    mandalUserPhone: "",
    mandalUserPassword: "",
    confirmPassword: "",
    establishedDate: "",
    isActive: true,
    ...initialData,
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    mandalName: "",
    mandalNameGujarati: "",
    mandalUserName: "",
    mandalUserPhone: "",
    mandalUserPassword: "",
    confirmPassword: "",
    establishedDate: "",
  })

  const [touched, setTouched] = useState({
    mandalName: false,
    mandalNameGujarati: false,
    mandalUserName: false,
    mandalUserPhone: false,
    mandalUserPassword: false,
    confirmPassword: false,
    establishedDate: false,
  })

  const handleInputChange = (field: keyof MandalFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user types
    if (typeof value === 'string' && validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    const value = field === 'mandalUserPhone' 
      ? formData.mandalUserPhone.replace(/^\+91\s*/, '') 
      : formData[field as keyof MandalFormData] as string
    const error = validateField(field, value, formData)
    setValidationErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateAllFields = () => {
    const cleanedFormData = {
      ...formData,
      mandalUserPhone: formData.mandalUserPhone.replace(/^\+91\s*/, '')
    }
    const { errors, isValid } = validateForm(cleanedFormData)
    setValidationErrors(errors)
    setTouched({
      mandalName: true,
      mandalNameGujarati: true,
      mandalUserName: true,
      mandalUserPhone: true,
      mandalUserPassword: true,
      confirmPassword: true,
      establishedDate: true,
    })
    return isValid
  }

  const resetForm = () => {
    setFormData({
      mandalName: "",
      mandalNameGujarati: "",
      mandalUserName: "",
      mandalUserPhone: "",
      mandalUserPassword: "",
      confirmPassword: "",
      establishedDate: "",
      isActive: true,
    })
    setValidationErrors({
      mandalName: "",
      mandalNameGujarati: "",
      mandalUserName: "",
      mandalUserPhone: "",
      mandalUserPassword: "",
      confirmPassword: "",
      establishedDate: "",
    })
    setTouched({
      mandalName: false,
      mandalNameGujarati: false,
      mandalUserName: false,
      mandalUserPhone: false,
      mandalUserPassword: false,
      confirmPassword: false,
      establishedDate: false,
    })
  }

  const isFieldInvalid = (field: keyof typeof touched) => 
    touched[field] && validationErrors[field as keyof ValidationErrors]

  return {
    formData,
    validationErrors,
    touched,
    handleInputChange,
    handleBlur,
    validateAllFields,
    resetForm,
    isFieldInvalid,
    setFormData,
    setValidationErrors,
    setTouched,
  }
}