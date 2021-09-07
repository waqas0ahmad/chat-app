/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
 const resExt = function(req,res,next){
    res.Ok = function(data,message="Success"){
        res.status(200).send(
            {
                Status:200,
                Message : message,
                Data:data
            }
            );
    }
    res.Bad = function(data,message ="Bad request"){
        res.status(200).send({
            Status:400,
            Message : message,
            Data:data
        });
    }
    res.ISE = function(data,message = "Internal Server Error",status = 500){
        res.status(200).send({
            Status:status,
            Message : message,
            Data:data
        });
    }
    next();
}

module.exports = {resExt}