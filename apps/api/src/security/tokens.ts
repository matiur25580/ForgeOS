import jwt from "jsonwebtoken";
import {env} from "../config/env.js";
export type AccessClaims={sub:string;org:string;sid:string};
export function createAccessToken(input:AccessClaims):string{
 return jwt.sign({org:input.org,sid:input.sid},env.JWT_ACCESS_SECRET,{subject:input.sub,issuer:"forgeos-api",audience:"forgeos-web",expiresIn:env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"]});
}
export function verifyAccessToken(token:string):AccessClaims{
 const value=jwt.verify(token,env.JWT_ACCESS_SECRET,{issuer:"forgeos-api",audience:"forgeos-web"});
 if(typeof value==="string"||typeof value.sub!=="string"||typeof value.org!=="string"||typeof value.sid!=="string")throw new Error("Invalid access token claims.");
 return {sub:value.sub,org:value.org,sid:value.sid};
}
