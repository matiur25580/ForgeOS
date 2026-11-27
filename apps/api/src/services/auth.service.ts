import {createHash,randomBytes,randomUUID} from "node:crypto";
import mongoose,{Types} from "mongoose";
import {env} from "../config/env.js";
import {Membership} from "../models/membership.model.js";
import {Organization} from "../models/organization.model.js";
import {Session} from "../models/session.model.js";
import {User} from "../models/user.model.js";
import {hashPassword,verifyPassword} from "../security/password.js";
import {createAccessToken} from "../security/tokens.js";

export class AuthError extends Error{
 constructor(public status:number,public code:string,message:string){super(message);this.name="AuthError";}
}
function fail(status:number,code:string,message:string):never{throw new AuthError(status,code,message);}
const digest=(token:string)=>createHash("sha256").update(token).digest("hex");
const slugify=(value:string)=>value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,63);
type RequestMeta={ipAddress?:string | undefined;userAgent?:string | undefined};
type Issued={accessToken:string;refreshToken:string;expiresIn:number;sessionId:string};
type AuthResult=Issued & {user:{id:string;email:string;firstName:string;lastName:string};organization:{id:string;name:string;slug:string};role:string};
async function issueSession(userId:Types.ObjectId,organizationId:Types.ObjectId,meta:RequestMeta,session:mongoose.ClientSession,tokenFamily:string=randomUUID()):Promise<Issued>{
 const refreshToken=randomBytes(48).toString("base64url");
 const sessionId=new Types.ObjectId();
 const expiresAt=new Date(Date.now()+env.REFRESH_TOKEN_TTL_DAYS*86400000);
 await Session.create([{_id:sessionId,userId,organizationId,refreshTokenHash:digest(refreshToken),tokenFamily,expiresAt,ipAddress:meta.ipAddress??"",userAgent:(meta.userAgent??"").slice(0,300)}],{session});
 return {accessToken:createAccessToken({sub:String(userId),org:String(organizationId),sid:String(sessionId)}),refreshToken,expiresIn:900,sessionId:String(sessionId)};
}
export async function register(input:{email:string;password:string;firstName:string;lastName:string;organizationName:string;organizationSlug?:string | undefined},meta:RequestMeta):Promise<AuthResult>{
 const passwordHash=await hashPassword(input.password);
 const slug=input.organizationSlug?.trim().toLowerCase()||slugify(input.organizationName);
 if(slug.length<3)fail(400,"INVALID_ORGANIZATION_SLUG","Organization name must produce a slug of at least three characters.");
 const db=await mongoose.startSession();let result:AuthResult|undefined;
 try{await db.withTransaction(async()=>{
  const [user]=await User.create([{email:input.email.toLowerCase(),passwordHash,firstName:input.firstName,lastName:input.lastName}],{session:db});
  if(!user)fail(500,"REGISTRATION_FAILED","The account could not be created.");
  const [organization]=await Organization.create([{name:input.organizationName,slug}],{session:db});
  if(!organization)fail(500,"REGISTRATION_FAILED","The organization could not be created.");
  await Membership.create([{userId:user._id,organizationId:organization._id,role:"owner",status:"active"}],{session:db});
  const issued=await issueSession(user._id,organization._id,meta,db);
  result={user:{id:String(user._id),email:user.email,firstName:user.firstName,lastName:user.lastName},organization:{id:String(organization._id),name:organization.name,slug:organization.slug},role:"owner",...issued};
 });}finally{await db.endSession();}
 if(!result)fail(500,"REGISTRATION_FAILED","The account could not be created.");
 return result;
}
export async function login(input:{email:string;password:string;organizationSlug?:string | undefined},meta:RequestMeta):Promise<AuthResult>{
 const user=await User.findOne({email:input.email.toLowerCase()}).select("+passwordHash");
 if(!user||user.status!=="active"||!(await verifyPassword(input.password,user.passwordHash)))fail(401,"INVALID_CREDENTIALS","Email or password is incorrect.");
 const memberships=await Membership.find({userId:user._id,status:"active"}).populate({path:"organizationId",match:{status:"active"}});
 const available=memberships.filter(m=>m.organizationId);
 let membership=available.find(m=>(m.organizationId as unknown as {slug:string}).slug===input.organizationSlug);
 if(input.organizationSlug&&!membership)fail(403,"ORGANIZATION_ACCESS_DENIED","You do not have an active membership in that organization.");
 if(!input.organizationSlug){
  if(available.length>1)fail(409,"ORGANIZATION_SELECTION_REQUIRED","This account belongs to multiple organizations. Supply an organization slug to choose a workspace.");
  membership=available[0];
 }
 if(!membership)fail(403,"NO_ACTIVE_MEMBERSHIP","No active organization membership is available for this account.");
 const organization=membership.organizationId as unknown as {_id:Types.ObjectId;name:string;slug:string};
 const db=await mongoose.startSession();let issued:Issued|undefined;
 try{await db.withTransaction(async()=>{issued=await issueSession(user._id,organization._id,meta,db);});}finally{await db.endSession();}
 if(!issued)fail(500,"LOGIN_FAILED","A secure session could not be created.");
 return {user:{id:String(user._id),email:user.email,firstName:user.firstName,lastName:user.lastName},organization:{id:String(organization._id),name:organization.name,slug:organization.slug},role:membership.role,...issued};
}
export async function rotateSession(refreshToken:string,meta:RequestMeta):Promise<AuthResult>{
 const old=await Session.findOne({refreshTokenHash:digest(refreshToken)}).select("+refreshTokenHash");
 if(!old)fail(401,"SESSION_INVALID","The refresh session is invalid. Sign in again.");
 if(old.revokedAt){await Session.updateMany({tokenFamily:old.tokenFamily,revokedAt:null},{$set:{revokedAt:new Date()}});fail(401,"REFRESH_TOKEN_REUSE","A previously rotated refresh token was reused. The session family was revoked.");}
 if(old.expiresAt<=new Date()){old.revokedAt=new Date();await old.save();fail(401,"SESSION_EXPIRED","The refresh session has expired. Sign in again.");}
 const [user,organization,membership]=await Promise.all([
  User.findOne({_id:old.userId,status:"active"}).select("_id email firstName lastName"),
  Organization.findOne({_id:old.organizationId,status:"active"}).select("_id name slug"),
  Membership.findOne({userId:old.userId,organizationId:old.organizationId,status:"active"})
 ]);
 if(!user||!organization||!membership){await Session.updateMany({tokenFamily:old.tokenFamily,revokedAt:null},{$set:{revokedAt:new Date()}});fail(401,"MEMBERSHIP_REVOKED","The account or organization membership is no longer active.");}
 const db=await mongoose.startSession();let issued:Issued|undefined;
 try{await db.withTransaction(async()=>{
  const revoked=await Session.findOneAndUpdate({_id:old._id,revokedAt:null,expiresAt:{$gt:new Date()}},{$set:{revokedAt:new Date(),lastUsedAt:new Date()}},{new:true,session:db});
  if(!revoked)fail(401,"SESSION_ROTATION_CONFLICT","The refresh token has already been used.");
  issued=await issueSession(user._id,organization._id,meta,db,old.tokenFamily);
  revoked.replacedBySessionId=new Types.ObjectId(issued.sessionId);await revoked.save({session:db});
 });}finally{await db.endSession();}
 if(!issued)fail(500,"SESSION_ROTATION_FAILED","The session could not be refreshed.");
 return {user:{id:String(user._id),email:user.email,firstName:user.firstName,lastName:user.lastName},organization:{id:String(organization._id),name:organization.name,slug:organization.slug},role:membership.role,...issued};
}
export async function revokeSession(sessionId:string,userId:string,organizationId:string){
 await Session.updateOne({_id:sessionId,userId,organizationId,revokedAt:null},{$set:{revokedAt:new Date()}});
}
export async function listOrganizations(userId:string){
 const memberships=await Membership.find({userId,status:"active"}).populate({path:"organizationId",match:{status:"active"}});
 return memberships.filter(m=>m.organizationId).map(m=>({organization:m.organizationId,role:m.role}));
}
export async function createOrganization(userId:string,name:string,slugInput:string|undefined){
 const slug=slugInput?.trim().toLowerCase()||slugify(name);
 if(slug.length<3)fail(400,"INVALID_ORGANIZATION_SLUG","Organization slug must contain at least three characters.");
 const db=await mongoose.startSession();let organization:unknown;
 try{await db.withTransaction(async()=>{const [org]=await Organization.create([{name,slug}],{session:db});if(!org)fail(500,"ORGANIZATION_CREATE_FAILED","Organization could not be created.");await Membership.create([{userId,organizationId:org._id,role:"owner",status:"active"}],{session:db});organization=org;});}finally{await db.endSession();}
 return organization;
}
export async function addOrganizationMember(organizationId:string,actorRole:string,email:string,role:string){
 if(actorRole!=="owner"&&actorRole!=="admin")fail(403,"MEMBERSHIP_ADMIN_REQUIRED","Only organization owners and admins can add members.");
 if(role==="owner"&&actorRole!=="owner")fail(403,"OWNER_ASSIGNMENT_RESTRICTED","Only an existing owner can grant the owner role.");
 const user=await User.findOne({email:email.toLowerCase(),status:"active"}).select("_id email firstName lastName");
 if(!user)fail(404,"USER_NOT_FOUND","Create the user account before adding them to this organization.");
 return Membership.create({userId:user._id,organizationId,role,status:"active"});
}

export async function revokeRefreshToken(refreshToken:string|undefined){
 if(!refreshToken)return;
 await Session.updateOne({refreshTokenHash:digest(refreshToken),revokedAt:null},{$set:{revokedAt:new Date()}});
}
