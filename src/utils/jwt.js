const jwt = require("jsonwebtoken");
const sign = function(data){
    const sec =process.env.SECRETE || "this is sample";
    return jwt.sign(data,sec);
}
const decode = function(token){
    const sec =process.env.SECRETE || "this is sample";
    return jwt.decode(token,sec);
}
module.exports = {sign,decode}