const { executeSQL } = require("../utils/db");
const bcrypt = require("bcrypt");
const { sign } = require("../utils/jwt");
const { sockSrv } = require("../utils/socket.srvice");
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const createAccount = async function (req, res, next) {
  const data = req.body;
  if (data.Name && data.Number && data.Password) {
    let users = await getUser(data.Number);
    if(users.success&&users.data.length>0){
      return res.Bad({},"User already exist with same phone number.");
    }
    let query = 'INSERT INTO `account` (`name`,`profile`,`mobile_number`,`password`) VALUES ?';
    data.Password = bcrypt.hashSync(data.Password, 10);
    let d = [[data.Name, data.Profile, data.Number, data.Password]];
    const result = await executeSQL(query, [d]);
    if (result.success == true) {
      users = await getUser(data.Number);
      if (users.success == true) {
        const token = sign({ id: users.data[0]["id"], name: users.data[0]["name"], name: users.data[0]["mobile_number"] });
        users.data[0]["token"] = token;
        return res.Ok(users.data[0],"Account created successfully.");
      }
    }
    return res.Bad({});
  } else {
    res.Bad(req.body, "Provide all fields");
  }
}
const getUser = async function (number) {
  const user = await executeSQL(`select Id,Name,Profile,mobile_number Number,Password from account where mobile_number = ?`, [number]);
  if(user.success&&user.data.length>0){
    //return user;
  }else{
    user.success =false;
  }
  return user;
}
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const login = async function (req, res, next) {
  const data = req.body;
  if (data.Number && data.Password) {
    const users = await getUser(data.Number);
    if (users.success == true) {
      const matched = bcrypt.compareSync(data.Password, users.data[0]["Password"])
      if (matched) {
        const token = sign({ id: users.data[0]["Id"], name: users.data[0]["Name"], name: users.data[0]["Number"] });
        users.data[0]["Token"] = token;
        return res.Ok(users.data[0],"Logged in successfully.");
      }

    }
    return res.Bad({},"Invalid phone number or password.");
  } else {
    res.Bad(req.body, "Provide all fields");
  }
}


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const createMessage = async function (req, res, next) {
  try {
    const data = req.body;
    const sender = req.authUser.id;
    const type = req.query.type == "group"? req.query.type :"single";
    if (data.Message && data.Reciever) {
      let query = "insert into message(message,sender,reciever,is_sent,type) values ?";
      let d = [[data.Message, sender, data.Reciever, true,type]];
      const result = await executeSQL(query, [d]);
      if (result.success == true) {
        data["Sender"] = sender;
        data["Type"] = type;
        sockSrv.sendMessageNotification(data);
        return res.Ok({}, "Message sent")
      }
    }
    res.Bad({});
  } catch (error) {
    res.ISE(error);
  }
}
/**
* 
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const createGroup = async function (req, res, next) {
  try {
    const data = req.body;
    const creator = req.authUser.id;
    if (data.Title) {
      let query = "INSERT INTO `group`(`title`,`created_by`) VALUES";
      let d = [[data.Title, creator]];
      const result = await executeSQL(query, [d]);
      if (result.success == true) {
        return res.Ok({}, "Group created")
      }
    }
    res.Bad({});
  } catch (error) {
    res.ISE(error);
  }
}
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const addMemberToGroup = async function (req, res, next) {
  
}
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const getChat = async function (req, res, next) {
  try {
    const type = req.query.type?req.query.type:"single";
    const sender = req.authUser.id;
    const reciever = req.params.id;
    let query ="";
    let d = [];
    if(type=="single"){
      query = "select * from message where (sender=? and reciever = ?) or (sender=? and reciever = ?);";
      d = [sender,reciever,reciever,sender];
    }else if(type=="group"){
      query = "select * from message m join `group` g on m.reciever = g.id where g.id = ?";
      d =[[id]]
    }
    const result = await executeSQL(query,d);
    if(result.success == true){
      
      res.Ok(result.data);
    }else{
      res.Bad({});
    }
  } catch (error) {
    res.ISE(error);
  }
}
module.exports = { createAccount, login, createMessage, createGroup, addMemberToGroup, getChat }