const env =require("dotenv")
env.config();
var express = require('express');
const router = require("./src/routes");
const bodyParser = require("body-parser");
const { resExt } = require("./src/utils/res");
var app = express();
const http = require('http');
const { sockSrv } = require("./src/utils/socket.srvice");
const server = http.createServer(app);
const io = require("socket.io")(server,{cors:{
   origin:"*"
}});
const cors = require("cors");
app.use(cors({origin:"*"}))
sockSrv._io_ = io;
sockSrv.init();
app.use(resExt);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));
app.use("/api",router);
app.get('/', function (req, res) {
   res.send('Hello World');
})
const port = process.env.PORT;
var _srv = server.listen(port, function () {
   var host = _srv.address().address
   var port = _srv.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})