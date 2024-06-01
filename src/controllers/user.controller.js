import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js"
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiRespone } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
 //get details from frontend
 //validation-not empty
 //check if user already exists:username and email
 //cehck images , check for avatr(as it is required set)
 //upload to cloudinary,check avatr
 //create user object- create entry in db
 //remove password and refreshtoken field from response
 //check for user creation
 //return response else error
  const {fullName,email,userName,password}=req.body
  console.log("email: ",email)
  //validation
  if(
    [fullName,email,userName,password].some((field)=>
            field?.trim()==="")
    )//or we can also write if for all explicitly
  
  {
        throw new ApiError(400,"All fields are requires")

  }
const existedUser=User.findOne({
    $or:[{userName}, {email}] //find either of them
})
if(existedUser){
    throw new ApiError(409,"User already exists")
}

const avatarLocalPath=req.files?.avatar[0]?.path;
const coverImageLocalPath=req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar is required")
}


//upload on cloud
const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage= await uploadOnCloudinary(coverImageLocalPath)
if (!avatar) {
    throw new ApiError(400,"Avatar is required")

}

const user=await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url||"", //as this is optional so if it is then upload else empty
    email,
    password,
    userName: userName.toLowerCase()

})
//to check if user is created and uploaded succesfully
const createdUser= await User.findById(user._id).select(
    "-password -refreshToken" //this things not needed so .select and - name
)

if (!createdUser) {
    throw new ApiError(500,"error while registering user")
}


//sendind response
return res.status(201).json(
    new ApiRespone(200,createdUser,"user registered successfully")
)


})

export { registerUser, }
