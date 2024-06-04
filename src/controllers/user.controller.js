import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js"
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiRespone } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
// const registerUser = asyncHandler(async (req, res) => {
//  //get details from frontend
//  //validation-not empty
//  //check if user already exists:username and email
//  //cehck images , check for avatr(as it is required set)
//  //upload to cloudinary,check avatr
//  //create user object- create entry in db
//  //remove password and refreshtoken field from response
//  //check for user creation
//  //return response else error
//   const {fullName,email,userName,password}=req.body
//   console.log("email: ",email)
//   //validation
//   if(
//     [fullName,email,userName,password].some((field)=>
//             field?.trim()==="")
//     )//or we can also write if for all explicitly
  
//   {
//         throw new ApiError(400,"All fields are requires")

//   }
// const existedUser=await User.findOne({
//     $or:[{userName}, {email}] //find either of them
// })
// if(existedUser){
//     throw new ApiError(409,"User already exists")
// }

// const avatarLocalPath=req.files?.avatar[0]?.path;
// const coverImageLocalPath=req.files?.coverImage[0]?.path;

// if (!avatarLocalPath) {
//     throw new ApiError(400,"Avatar is required")
// }


// //upload on cloud
// const avatar=await uploadOnCloudinary(avatarLocalPath)
// const coverImage= await uploadOnCloudinary(coverImageLocalPath)
// if (!avatar) {
//     throw new ApiError(400,"Avatar is required")

// }

// const user=await User.create({
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url||"", //as this is optional so if it is then upload else empty
//     email,
//     password,
//     userName: userName.toLowerCase()

// })
// //to check if user is created and uploaded succesfully
// const createdUser= await User.findById(user._id).select(
//     "-password -refreshToken" //this things not needed so .select and - name
// )

// if (!createdUser) {
//     throw new ApiError(500,"error while registering user")
// }


// //sendind response
// return res.status(201).json(
//     new ApiRespone(200,createdUser,"user registered successfully")
// )


// })

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        // username: username.toLowerCase()
        username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiRespone(200, createdUser, "User registered Successfully")
    )

} )

const loginUser= asyncHandler(async (req,res)=>{
//req.body0> to get data
//usernmae/email
//find user
//password chcek
//access and refesh token
//send cookies 
const {email,username,password}=req.body
if (!email&&!username) {
    throw new ApiError(400,"username or email is requires")
    
}
const user= await User.findOne({
    $or:[{email},{username}]
})
if (!user) {
    throw new ApiError(404,"user doesn't exist")
    
}
//password check
const isPasswordValid=await user.isPasswordCorrect(password)
if (!isPasswordValid) {
    throw new ApiError(401,"incorrect password")
    
}

const generateAccessAndRefreshTokens= async (userId)=>{
    try {
    const user= await User.findById(userId)
   const accessToken= user.generateAccessToken()
   const refreshToken= user.generateRefreshToken()


   user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false}) //while saving we need all fields but passwrod is not there so validation false to avoid it


   return {accessToken,refreshToken}
    }
     catch (error) {
        throw new ApiError(500,"somethong went wrong")
    }
}
const { accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

// console.log("Access Token:", accessToken);
// console.log("Refresh Token:", refreshToken);
const loggedInUser= await User.findById(user._id).select("-password -refreshToken") //unwanted fields that we dont want to send, when we has user it had all fields so removing these

//sending cookies

const options={
    httpOnly: true,
    // secure:true
}//can only be modified by server not by frontend
return res
.status(200)
.cookie("accessToken",accessToken,options)
 //key value pair for cookies
.cookie("refreshtoken",refreshToken,options)
.json(
    new ApiRespone(
        200,
        {
            user:loggedInUser,accessToken,refreshToken

        },
        "user loggedd in successfully"
    )
)

})


const logoutUser=asyncHandler( async (req,res)=>{
    //we have access to the req.user as the middleware executed before this in the router sets the eq.user jwt for logout so we have this
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
            {
                new: true
            }
        
    )
    const options={
        httpOnly: true,
        // secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiRespone(200,{},"user loggedout successfully"))

    
} )

//access token are sfo short timespan so when expired instead of again re login of user, we can match the refreshtoken with db and get new pair of access and refresh tokens
//here building that endpoint when acccesstoken expires
const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingrefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingrefreshToken){
        throw new ApiError(401,"unauth request")
    }
//get toekn via cookies

//now verify it
const decodedToken=jwt.verify(incomingrefreshToken,process.env.JWT_REFRESH_SECRET)

const user=User.findById(decodedToken?._id)
if(!user){
    throw new ApiError(401,"Invalid refresh token")
}
if(incomingrefreshToken!==user?.refreshToken){
    throw new ApiError(401,"expired token")
}
//now we have to generate new pair of access and refresh tokens
const options={
    httpOnly:true
}

const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
return res.status(200)
.cookie("accessToken",accessToken)
.cookie("refreshToken",newRefreshToken)
.json(
    new ApiRespone(
        200,
        {accessToken,refreshToken: newRefreshToken},
        "access token refreshed"
    )
)

})


const changeCurrentPassword= asyncHandler(async(req,res)=>{
     const {oldPassword,newPassword}=req.body
     const user= await User.findById(req.user?._id)
     const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

     if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
     }

     user.password=newPassword
     await user.save({validateBeforeSave:false})

     return res.status(200).json(new ApiRespone(200,{},"passsword changed successfully"))


})

const getCurrentUser= asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiRespone(200,req.user,"current user fetched successfully"))
})



const updateAccountDetails= asyncHandler(async (req,res)=>{
    const {fullName, email}=req.body
    if (!fullName||!email) {
        throw new ApiError(400,"all fields are required")
        
    }
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
$set:{
    fullName,
    email:email
}

        },
        {new:true }
    ).select("-password")
    return res.status(200)
    .json(new ApiRespone(200,user,"details updated successfully"))
})


const updateUserAvatar = asyncHandler( async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file missing")
        
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400,"error while uploading avatar")
        
    }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                    $set:{
                        avatar:avatar.url
                    }
            },
            {new:true}
        ).select("-password")

        return res.status(200).json(
            new ApiRespone(200,user,"avatarimage updated successfully")
        )

})


const updateUserCoverImage = asyncHandler( async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400,"cover file missing")
        
    }

    const avatar= await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400,"error while uploading cover")
        
    }

       const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                    $set:{
                        coverImage:coverImage.url
                    }
            },
            {new:true}
        ).select("-password")

        return res.status(200).json(
            new ApiRespone(200,user,"cover image updated successfully")
        )

})


const getUserChannelProfile= asyncHandler( async(req,res)=>{
const {username }=req.params

if (!username?.trim()) {
    throw new ApiError(400,"username is missing")
    
}

const channel=await User.aggregate([


    {
        $match:{
            username: username?.toLowerCase() //match record wirth username (filter kind of ops)
        }
    },
    {
       $lookup:{
        from: "subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
       } 
    },
    {
        $lookup:{
         from: "subscriptions",
         localField:"_id",
         foreignField:"subscriber",
         as:"subscribedTo"
        } 
     },
     {
        //count no of subscribers and subscribed to
        //for each subscribed and channel a document is created so here in this aggregation pipeline we find that and sataged
        $addFields:{
            subscribersCount:{
                $size:"$subscribers" //$because it is field

            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else: false
                }
            }
        }
     },
     {
        $project:{
            //to give selected things only
            fullName:1 ,//1 flag means true
            username:1,
            avatar:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            coverImage:1,
            email:1

        }
     }

        
    
]) //aggregation pipeline, takes array and each {} in array is stage of pipeline

if (!channel?.length ) {
    throw new ApiError(404,"channel does not exist")
    
}
return res.status(200)
.json(new ApiRespone(200, channel[0],"user channel fetched successfully")) //aggregation returns an array, we want the first elemetn of array so [0]

})

const getWatchHistory= asyncHandler( async(req,res)=>{

    const user= await User.aggregate([
        {
            $match:{
                // _id:req.user._id wrong as _id is a string 'Objectid:('id') mongoose hadnles this and gives us the id but here we hvae to manage it seperatly
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            //neted lookup as the videos itself contains reference from user
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistroy",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        //as we dont want all fields of that to select some wanted
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                //obtaining value from first index of array
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
return res.status(200)
.json(new ApiRespone(200,user[0].watchHistory,"watch history fetched successfully"))
})

export { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
 }
