export interface MandalFormData {
  mandalName: string
  mandalNameGujarati: string
  mandalUserName: string
  mandalUserPhone: string
  mandalUserPassword: string
  confirmPassword: string
  establishedDate: string
  isActive: boolean
}

export interface ValidationErrors {
  mandalName: string
  mandalNameGujarati: string
  mandalUserName: string
  mandalUserPhone: string
  mandalUserPassword: string
  confirmPassword: string
  establishedDate: string
}

export const validateField = (field: keyof ValidationErrors, value: string, formData?: MandalFormData): string => {
  switch (field) {
    case 'mandalName':
      return !value ? "Mandal name is required" : ""
    
    case 'mandalNameGujarati':
      return !value ? "મંડળનું નામ આવશ્યક છે" : ""
    
    case 'mandalUserName':
      return !value ? "User name is required" : ""
    
    case 'mandalUserPhone':
      if (!value) return "Phone number is required"
      if (!/^\d+$/.test(value)) return "Phone number must contain only digits"
      if (value.length !== 10) return "Phone number must be exactly 10 digits"
      return ""
    
    case 'mandalUserPassword':
      if (!value) return "Password is required"
      if (value.length < 6) return "Password must be at least 6 characters"
      if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter"
      if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter"
      if (!/\d/.test(value)) return "Password must contain at least one number"
      return ""
    
    case 'confirmPassword':
      if (!value) return "Please confirm your password"
      if (formData && value !== formData.mandalUserPassword) return "Passwords do not match"
      return ""
    
    case 'establishedDate':
      return !value ? "Established date is required" : ""
    
    default:
      return ""
  }
}

export const validateForm = (formData: MandalFormData): { errors: ValidationErrors; isValid: boolean } => {
  const errors: ValidationErrors = {
    mandalName: validateField('mandalName', formData.mandalName),
    mandalNameGujarati: validateField('mandalNameGujarati', formData.mandalNameGujarati),
    mandalUserName: validateField('mandalUserName', formData.mandalUserName),
    mandalUserPhone: validateField('mandalUserPhone', formData.mandalUserPhone),
    mandalUserPassword: validateField('mandalUserPassword', formData.mandalUserPassword),
    confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData),
    establishedDate: validateField('establishedDate', formData.establishedDate),
  }

  const isValid = !Object.values(errors).some(error => error !== "")
  
  return { errors, isValid }
}