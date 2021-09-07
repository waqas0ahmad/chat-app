const { createMessage, getChat, addMemberToGroup, createGroup, login, createAccount } = require("../controllers/chat.controller");
const { auth } = require("../utils/auth.middleware");

const router = require("express").Router();


router.post("/create-account",createAccount);
router.post("/login",login);
router.post("/message",auth,createMessage);
router.post("/group",auth,createGroup);
router.post("/add-member-to-group",auth,addMemberToGroup);
router.get("/chat/:id",auth,getChat);


module.exports = router;