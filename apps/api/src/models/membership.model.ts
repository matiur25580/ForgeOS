import {Schema,model} from "mongoose";
export const ORGANIZATION_ROLES=["owner","admin","plant_manager","production_supervisor","maintenance_manager","maintenance_technician","quality_manager","quality_inspector","operator","auditor","viewer"] as const;
const membershipSchema=new Schema({
 userId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
 organizationId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 role:{type:String,enum:ORGANIZATION_ROLES,required:true,default:"viewer"},
 status:{type:String,enum:["active","suspended","revoked"],default:"active",required:true}
},{timestamps:true});
membershipSchema.index({userId:1,organizationId:1},{unique:true});
membershipSchema.index({organizationId:1,status:1,role:1});
export const Membership=model("Membership",membershipSchema);
