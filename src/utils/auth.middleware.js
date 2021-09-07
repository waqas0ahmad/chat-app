const { decode } = require("./jwt");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const auth = function(req,res,next){
    try {
        if(req.headers["authorization"]){
            const user = decode(req.headers["authorization"])
            req.authUser = user;
            next()    
        }
        else{
            res.ISE({},"UNAUTHORIZED",401);
        }
    } catch (error) {
        console.log(error);
        res.ISE({},"UNAUTHORIZED",401);
    }
    
}

module.exports = {auth}