import { NewMemberForm } from "./AnalyticsPage";


export interface ValidationErrors {
  subUserName?: string;
  phoneNumber?: string;
}

export function validateNewMemberForm(formData: NewMemberForm): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate subUserName
  if (!formData.subUserName.trim()) {
    errors.subUserName = "Member Name is required";
  }

  // Validate phoneNumber (remove +91 and spaces for validation)
  const cleanPhoneNumber = formData.phoneNumber.replace(/^\+91\s*/, "").replace(/\s/g, "").trim();
  
  if (!cleanPhoneNumber) {
    errors.phoneNumber = "Phone Number is required";
  } else if (!/^\d{10}$/.test(cleanPhoneNumber)) {
    errors.phoneNumber = "Phone Number must be exactly 10 digits and contain no letters";
  }

  return errors;
}

export function cleanPhoneNumberForPayload(phoneNumber: string): string {
  return phoneNumber.replace(/^\+91\s*/, "").replace(/\s/g, "").trim();
}

export function formatPhoneNumber(digits: string): string {
  const cleanDigits = digits.replace(/\D/g, "").slice(0, 10);
  if (!cleanDigits) return "+91 ";
  // Format as +91 XXXXX XXXXX
  const formatted = cleanDigits.length > 5 
    ? cleanDigits.slice(0, 5) + " " + cleanDigits.slice(5)
    : cleanDigits;
  return "+91 " + formatted;
}