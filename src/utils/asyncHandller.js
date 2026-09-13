// const asyncHandller = () =>{}
// const asyncHandller = (func) =>{}
// const asyncHandller = (func) =>async (req,res,next)=>{}  



// Old Implementation:
// const asyncHandler = (requestHandller) =>{
// (req,res,next)=>{
//     Promise.resolve(requestHandller(req,res,next))
//     .catch((err)=>next(err))
// }
// }

const asyncHandller = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandller}    


/*
const asyncHandller = (func) =>async(req,res,next)=>{
    try{
        await func(req,res,next);
    }
    catch{
        res.status(err.statusCode || 500).json({
            success:false,
            message:err.message
        })
    }
}*/
