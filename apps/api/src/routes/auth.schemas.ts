import {z} from "zod";
const email=z.string().trim().email().max(254).transform(v=>v.toLowerCase());
export const registerSchema=z.object({
 email,password:z.string().min(12).max(128),firstName:z.string().trim().min(1).max(80),
 lastName:z.string().trim().min(1).max(80),organizationName:z.string().trim().min(2).max(120),
 organizationSlug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(63).optional()
}).strict();
export const loginSchema=z.object({email,password:z.string().min(1).max(128),organizationSlug:z.string().trim().min(3).max(63).optional()}).strict();
export const createOrganizationSchema=z.object({name:z.string().trim().min(2).max(120),slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(63).optional()}).strict();
export const addMemberSchema=z.object({email,role:z.enum(["admin","plant_manager","production_supervisor","maintenance_manager","maintenance_technician","quality_manager","quality_inspector","operator","auditor","viewer","owner"])}).strict();
