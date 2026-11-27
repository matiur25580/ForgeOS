import test from "node:test";
import assert from "node:assert/strict";
import {addMemberSchema,loginSchema,registerSchema} from "./auth.schemas.js";

test("registration requires a strong password and valid organization identity",()=>{
 const valid={email:"plant.admin@example.com",password:"correct-horse-battery",firstName:"Plant",lastName:"Admin",organizationName:"Northstar Manufacturing",organizationSlug:"northstar-manufacturing"};
 assert.equal(registerSchema.safeParse(valid).success,true);
 assert.equal(registerSchema.safeParse({...valid,password:"short"}).success,false);
 assert.equal(registerSchema.safeParse({...valid,organizationSlug:"bad slug"}).success,false);
});
test("login accepts an optional organization selector for multi-tenant accounts",()=>{
 assert.equal(loginSchema.safeParse({email:"plant.admin@example.com",password:"secret"}).success,true);
 assert.equal(loginSchema.safeParse({email:"plant.admin@example.com",password:"secret",organizationSlug:"northstar"}).success,true);
 assert.equal(loginSchema.safeParse({email:"not-an-email",password:"secret"}).success,false);
});
test("membership creation rejects unsupported privilege escalation roles",()=>{
 assert.equal(addMemberSchema.safeParse({email:"operator@example.com",role:"operator"}).success,true);
 assert.equal(addMemberSchema.safeParse({email:"operator@example.com",role:"super_admin"}).success,false);
});
