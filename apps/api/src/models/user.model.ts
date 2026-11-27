import {Schema,model} from "mongoose";
const userSchema=new Schema({
 email:{type:String,required:true,lowercase:true,trim:true,maxlength:254},
 passwordHash:{type:String,required:true,select:false},
 firstName:{type:String,required:true,trim:true,maxlength:80},
 lastName:{type:String,required:true,trim:true,maxlength:80},
 status:{type:String,enum:["active","suspended","deactivated"],default:"active",required:true}
},{timestamps:true});
userSchema.index({email:1},{unique:true});
export const User=model("User",userSchema);
