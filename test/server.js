var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io'); // 加入 Socket.IO
var mysql = require("mysql");
var express = require('express');
var app=express()
var server = require('http').Server(app);

var con = mysql.createConnection({
    host: "140.125.32.126",
    user: "yunbot",
    password: "yunbot",
    database: "yunbot",
    port:3306
});

con.connect(function(err) {
  if (err) {
      console.log('connecting error');
      return;
  }
  console.log('connecting success');
});
app.use(express.static('public/')); 
var server = http.createServer(function(request, response) {
  console.log('Connection');
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('Hello, World.');
      response.end();
      break;
    case '/socket.html':
      fs.readFile(__dirname + path, function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/master.html':
      fs.readFile(__dirname + path, function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    default:
      response.writeHead(404);
      response.write("opps this doesn't exist - 404");
      response.end();
      break;
  }
});

server.listen(8001);

var serv_io = io.listen(server);

serv_io.sockets.on('connection', function(socket) {
  setInterval(function() {
    con.query("select * from data ",function (err,rs) {
      if (err) throw err;
      console.log(rs);
      for (var i = 0; i < rs.length; i++){
      socket.emit('uid', {'uid': rs[i].uid});
    }
    console.log(rs.length)
  });
    },5000)

  socket.on('client_data', function(data) {
    
    console.log(data.uid)

  });
});
