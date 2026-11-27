import type {Request,Response,NextFunction} from "express";
import {Membership} from "../models/membership.model.js";
import {Organization} from "../models/organization.model.js";
import {Session} from "../models/session.model.js";
import {User} from "../models/user.model.js";
import {verifyAccessToken,type AccessClaims} from "../security/tokens.js";
export interface AuthContext{userId:string;organizationId:string;role:string;sessionId:string}
declare global{namespace Express{interface Request{auth?:AuthContext}}}
export async function authenticate(req:Request,res:Response,next:NextFunction):Promise<void>{
 const header=req.header("authorization");const token=header?.startsWith("Bearer ")?header.slice(7):"";
 if(!token){res.status(401).json({success:false,error:{code:"AUTHENTICATION_REQUIRED",message:"A valid access token is required."}});return;}
 let p:AccessClaims;try{p=verifyAccessToken(token);}catch{res.status(401).json({success:false,error:{code:"INVALID_ACCESS_TOKEN",message:"The access token is invalid or expired."}});return;}
 try{
  const [u,o,m,s]=await Promise.all([
   User.findById(p.sub).select("_id status"),Organization.findById(p.org).select("_id status"),
   Membership.findOne({userId:p.sub,organizationId:p.org,status:"active"}).select("_id role"),
   Session.findOne({_id:p.sid,userId:p.sub,organizationId:p.org,revokedAt:null,expiresAt:{$gt:new Date()}}).select("_id")
  ]);
  if(!u||u.status!=="active"||!o||o.status!=="active"||!m||!s){res.status(401).json({success:false,error:{code:"SESSION_INVALID",message:"Your session is no longer valid. Please sign in again."}});return;}
  req.auth={userId:p.sub,organizationId:p.org,role:m.role,sessionId:p.sid};next();
 }catch{res.status(401).json({success:false,error:{code:"INVALID_ACCESS_TOKEN",message:"The access token is invalid or expired."}});}
}
export function requireRoles(...roles:string[]){return(req:Request,res:Response,next:NextFunction)=>{if(!req.auth){res.status(401).json({success:false,error:{code:"AUTHENTICATION_REQUIRED",message:"Sign in is required."}});return;}if(!roles.includes(req.auth.role)){res.status(403).json({success:false,error:{code:"INSUFFICIENT_PERMISSIONS",message:"You do not have permission to perform this action."}});return;}next();};}
