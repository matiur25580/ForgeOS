import {Router,type Request} from "express";
import {env} from "../config/env.js";
import {authenticate} from "../middleware/auth.middleware.js";
import {AuthError,login,register,revokeSession,rotateSession} from "../services/auth.service.js";
import {loginSchema,registerSchema} from "./auth.schemas.js";
export const authRouter=Router();
const cookieName="forgeos_refresh";
const cookieOptions={httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax" as const,path:`${env.API_PREFIX}/auth`,maxAge:env.REFRESH_TOKEN_TTL_DAYS*86400000};
function meta(req:Request){return {ipAddress:req.ip,userAgent:req.get("user-agent")??""};}
function setRefreshCookie(res:import("express").Response,token:string){res.cookie(cookieName,token,cookieOptions);}
function clearRefreshCookie(res:import("express").Response){res.clearCookie(cookieName,{httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax",path:`${env.API_PREFIX}/auth`});}
function sendAuthError(error:unknown,next:(error:unknown)=>void){next(error instanceof AuthError?error:error);}
authRouter.post("/register",async(req,res,next)=>{try{const data=await register(registerSchema.parse(req.body),meta(req));setRefreshCookie(res,String(data.refreshToken));res.status(201).json({success:true,data:{user:data.user,organization:data.organization,role:data.role,accessToken:data.accessToken,tokenType:"Bearer",expiresIn:data.expiresIn}});}catch(error){sendAuthError(error,next);}});
authRouter.post("/login",async(req,res,next)=>{try{const data=await login(loginSchema.parse(req.body),meta(req));setRefreshCookie(res,String(data.refreshToken));res.json({success:true,data:{user:data.user,organization:data.organization,role:data.role,accessToken:data.accessToken,tokenType:"Bearer",expiresIn:data.expiresIn}});}catch(error){sendAuthError(error,next);}});
authRouter.post("/refresh",async(req,res,next)=>{try{const token=req.cookies?.[cookieName];if(typeof token!=="string"||!token)throw new AuthError(401,"REFRESH_TOKEN_REQUIRED","A refresh session cookie is required.");const data=await rotateSession(token,meta(req));setRefreshCookie(res,String(data.refreshToken));res.json({success:true,data:{user:data.user,organization:data.organization,role:data.role,accessToken:data.accessToken,tokenType:"Bearer",expiresIn:data.expiresIn}});}catch(error){clearRefreshCookie(res);sendAuthError(error,next);}});
authRouter.post("/logout",authenticate,async(req,res,next)=>{try{await revokeSession(req.auth!.sessionId,req.auth!.userId,req.auth!.organizationId);clearRefreshCookie(res);res.status(204).end();}catch(error){next(error);}});
authRouter.get("/me",authenticate,async(req,res,next)=>{try{const [user,organization]=await Promise.all([import("../models/user.model.js").then(m=>m.User.findById(req.auth!.userId).select("email firstName lastName")),import("../models/organization.model.js").then(m=>m.Organization.findById(req.auth!.organizationId).select("name slug"))]);if(!user||!organization)throw new AuthError(401,"SESSION_INVALID","The active account or organization no longer exists.");res.json({success:true,data:{user:{id:String(user._id),email:user.email,firstName:user.firstName,lastName:user.lastName},organization:{id:String(organization._id),name:organization.name,slug:organization.slug},role:req.auth!.role}});}catch(error){next(error);}});
