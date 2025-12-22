import validator from 'validator';
import { z } from 'zod';

// Phone number validation schema
const phoneNumberSchema = z.string()
  // .refine(val => validator.isMobilePhone(val, 'any', { strictMode: true }), {
  //   message: 'Invalid phone number format',
  // })
  .refine(val => val.length >= 10, {
    message: 'Phone number must be at least 10 digits',
  });

// Password validation schema
const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .refine(val => validator.isStrongPassword(val, {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  }), {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  });

// Date validation schema
const dateSchema = z.string()
  .refine(val => validator.isDate(val, { format: 'YYYY-MM-DD', strictMode: true }), {
    message: 'Invalid date format (use YYYY-MM-DD)',
  });

// Common validation function for required string fields
const requiredStringSchema = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`).trim();

// Validation function for Admin login
export const validateAdminLogin = (data: { phoneNumber: string; password: string }) => {
  const schema = z.object({
    phoneNumber: phoneNumberSchema,
    password: passwordSchema,
  });
  return schema.parse(data);
};

// Validation function for Mandal creation
export const validateMandalCreation = (data: {
  nameEn: string;
  nameGu: string;
  userName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  establishedDate: string;
  isActive:boolean;
}) => {
  const schema = z.object({
    nameEn: requiredStringSchema('Mandal name (English)'),
    nameGu: requiredStringSchema('Mandal name (Gujarati)'),
    userName: requiredStringSchema('Mandal user name'),
    phoneNumber: phoneNumberSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    establishedDate: dateSchema,
    isActive: z.boolean().optional()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
  return schema.parse(data);
};

// Validation function for MandalSubUser creation
export const validateMandalSubUserCreation = (data: { subUserName: string; phoneNumber: string }) => {
  const schema = z.object({
    subUserName: requiredStringSchema('Sub-user name'),
    phoneNumber: phoneNumberSchema,
  });
  return schema.parse(data);
};

// Validation function for MemberData creation
export const validateMemberDataCreation = (data: {
  id: string;
  installment: number;
  interest: number;
  fine: number;
  newWithdrawal: number;
  paidInstallment:number;
  paidWithdrawal:number;
}) => {
  const schema = z.object({
    id: z.string().min(1, 'ID is required'),
    installment: z.number().min(0, 'Installment must be a non-negative number'),
    interest: z.number().min(0, 'Interest must be a non-negative number'),
    fine: z.number().min(0, 'Fine must be a non-negative number'),
    newWithdrawal: z.number().min(0, 'New withdrawal must be a non-negative number'),
    paidInstallment : z.number().min(0, 'New withdrawal must be a non-negative number'),
    paidWithdrawal : z.number().min(0, 'New paidWithdrawal must be a non-negative number'),
  });
  return schema.parse(data);
};

// Validation function for initializing month data
export const validateMonthInitialization = (data: { month: string }) => {
  const schema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  });
  return schema.parse(data);
};