var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require("mysql");
let uiduser=null
var con = mysql.createConnection({
    host: "140.125.32.128",
    user: "root",
    password: "",
    database: "yunbot",
    port:3306,
});

var sessionStore = mysql.createConnection({
  host: '140.125.32.128',
  port: 3306,
  user: 'root',
  password: '',
  database: 'session',
  useConnectionPooling: true
});

sessionStore.connect(function(err) {
  if (err) {
      console.log('connecting error');
      return;
  }
  console.log('connecting success');
});

function connect(){
con.connect(function(err) {
  if (err) {
      console.log('connecting error');
      return;
  }
  console.log('connecting success');
});
}
connect()

app.use('/', express.static(__dirname  + '/www'));



io.on('connection', function(socket){ // 使用者連線時觸發
  
        con.query("select * from data where uidstatus=0",function (err,rs) {
          if (err) throw err;
          console.log(rs);
          if(rs == ""){
            console.log("BOT已滿")
          }
          else{
            socket.emit('uid', {'uid': rs[0].uid});
            uiduser=rs[0].uid 
             
          }
      });
    //   process.on('uncaughtException', function(err) {
    //     console.log(err.stack);
    //     console.log('NOT exit...');
    // });

      setTimeout(function() {
    con.query('update data set uidstatus = 1 where uid=?',[uiduser], (err, rs) => {                        //查詢資料庫設定值
        if (err) console.log(err);
        console.log(rs)
      });
    },1000)
  
        setInterval(function() {
          var dt = new Date();
          console.log(dt)
      con.query('select * from data where uidstatus = 1 AND status = 1', (err, rs) => {                        //查詢資料庫設定值
        if (err){
          if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connect();
          } else {
            console.error(err.stack || err);
          } 
        
        }
        else{
        console.log(rs)
        if( rs != ""){
        //io.emit('status', {'status': results[0].status});
        io.emit(rs[0].uid, {'data': rs[0].location});
         con.query('update data set status = 0 where uid=?',[rs[0].uid], (err, rs1) => {                        //查詢資料庫設定值
        if (err) console.log(err);
        console.log(rs1)
      });
    }
  }
      });
    },2000)

socket.on('uidstatus_no_use', function(data){
  con.query('update data set uidstatus = 0 where uid=?',[data.uidstatus_no_use], (err, rs) => {                        //查詢資料庫設定值
    if (err) console.log(err);
    console.log(rs)
  });
});

})
http.listen(3000, function(){
console.log('listening on *:3000');
});