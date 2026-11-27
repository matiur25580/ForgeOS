import {Schema,model} from "mongoose";
const sessionSchema=new Schema({
 userId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
 organizationId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
 refreshTokenHash:{type:String,required:true,unique:true,select:false},
 tokenFamily:{type:String,required:true,index:true},
 expiresAt:{type:Date,required:true},
 revokedAt:{type:Date,default:null},
 replacedBySessionId:{type:Schema.Types.ObjectId,ref:"Session",default:null},
 lastUsedAt:{type:Date,default:Date.now},
 ipAddress:{type:String,maxlength:64,default:""},
 userAgent:{type:String,maxlength:300,default:""}
},{timestamps:true});
sessionSchema.index({expiresAt:1},{expireAfterSeconds:0});
sessionSchema.index({userId:1,organizationId:1,revokedAt:1});
export const Session=model("Session",sessionSchema);
