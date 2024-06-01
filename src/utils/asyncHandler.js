const asyncHandler=(requestHnadler)=>{
return (req,res,next)=>{
    Promise.resolve(requestHnadler(req,res,next)).catch((err)=>next(err))
}
}



// const asyncHandler=(fn)=>async (req,res,next)=>{
// try{
// await fn(req,res,next)
// }
// catch(error){
// res.status(err.code||500).json({
//     success:false,
//     message:err.message,
// })
// }
// }

export {asyncHandler}
//just a wrapper code for handling async fn, handles any error that might occur in async code and passes them to next middleware
//to avoid repetative try catch blocks, here try catch while connecting db so many times it will be run so for that we used it
//high order fn, takes fn as argument