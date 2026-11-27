import {Schema,model} from "mongoose";
const organizationSchema=new Schema({
 name:{type:String,required:true,trim:true,maxlength:120},
 slug:{type:String,required:true,lowercase:true,trim:true,minlength:3,maxlength:63},
 status:{type:String,enum:["active","suspended"],default:"active",required:true},
 plan:{type:String,enum:["starter","growth","enterprise"],default:"starter",required:true}
},{timestamps:true});
organizationSchema.index({slug:1},{unique:true});
export const Organization=model("Organization",organizationSchema);
