const express = require('express')
var ss = require('socket.io-stream');
var path=require('path')
var fs=require('fs')
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
console.log(path.resolve(__dirname))
//console.log(path)
var app_root=path.resolve(".")
//var  app_root=path.normalize(".")
//console.log(app_root)
function path_isdir(p){
    var stat=fs.statSync(p);
    if(stat.isDirectory()){
      return true
    }
    return false;
}
function toPath(p){
    var stat=fs.statSync(p);
    if(stat.isDirectory()){
      return {"path": path.relative(app_root,p),
            "name": path.basename(p),
            "time": stat.mtimeMs,
            "isdir": true,
            "size":Number.MAX_VALUE};
      }
    else{
      return {"path": path.relative(app_root,p),
            "name": path.basename(p),
            "time": stat.mtimeMs,
            "isdir": false,
            "size":stat.size};
      }
}
//console.log(toPath("run.bat"))
//console.log(toPath("static"))
function toLocalPath(path1){
    var fsPath = path.resolve(app_root, path1)
    console.log(fsPath);
    //if(os.path.commonprefix([app_root, fsPath]) != app_root){
    //    raise Exception("Unsafe path "+ fsPath+" is not a  sub-path  of root "+ app_root)
    //}
    return fsPath
}
//toLocalPath("abc")
function toWebPath(path){
     return "/static/"+path
}
function children(path1){
    console.info(path1)
    var p = toLocalPath(path1)
    if (fs.existsSync(p)){

    }
    else{
        p= toLocalPath(".")
    }
    var children = fs.readdirSync(p)
    var children_stats=children.map((one, idx) =>{
        var p1=p+"/"+one;
        return toPath(p1);
    });
    dic={"path": p,"children": children_stats}
    return dic
}
//console.info(children("."))
function parent(path1){
    let parent1
  if(path1 === app_root){
      parent1 = path1
    }
  else{
      parent1 = path.dirname(path1)
    }
  var dic=toPath(parent1)
  return dic
}
function remove(path1){
    var p = toLocalPath(path1)
    if (path_isdir(p)){
        fs.rmdirSync(p);
    }
    else{
        fs.unlinkSync(p)
    }
    return {status:"success"};
}
function rename(path1,name){
  var p = toLocalPath(path1)
  var parent = path.dirname(p)
  var updated = path.join(parent, name)
  fs.renameSync(p, updated)
  return {status:"success"};
}
function content(path1){
  var p = toLocalPath(path1)
  var r=fs.readFileSync(p);
  return decoder.write(r);
}

function mkdir(path1,foldername){
  var p = toLocalPath(path1)
  fs.mkdirSync(path.join(p, foldername))
  return {status:"success"}
}
function DateStr(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var s_month=""+month;
    if (s_month.length<2) s_month="0"+s_month;
    var day = date.getDate();
    var s_day=""+day;
    if (s_day.length<2) s_day="0"+s_day;
    return year + "-" + s_month + "-" + s_day ;
}
const port =8000;// parseInt(process.env.PORT, 10) || 8000
const dev = process.env.NODE_ENV !== 'production'
const server = express()
// server.get('/fonts/glyphicons-halflings-regular.woff2', (req, res) => {
//   res.redirect('/static/fonts/glyphicons-halflings-regular.woff2')
// })

// server.get('/fonts/glyphicons-halflings-regular.woff', (req, res) => {
//   res.redirect('/static/fonts/glyphicons-halflings-regular.woff')
// })
// ///fonts/glyphicons-halflings-regular.ttf
// server.get('/fonts/glyphicons-halflings-regular.ttf', (req, res) => {
//   res.redirect('/static/fonts/glyphicons-halflings-regular.ttf')
// })
server.use(express.static('public'));
var s=server.listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
const io = require('socket.io')(s);
io.sockets.on('connection', function( socket ) {
  console.log('connection');
  socket.on('list', function( data, callback ) {       
    console.log("list")
    console.log(data);
    callback(children(data.path));
  });
  socket.on('parent', function( data, callback ) {       
    console.log("parent")
    console.log(data);
    callback(parent(data.path));
  });
  socket.on('mkdir', function( data, callback ) {       
    console.log("mkdir")
    console.log(data);
    callback(mkdir(data.path,data.name));
  });
  socket.on('rename', function( data, callback ) {       
    console.log("rename")
    console.log(data);
    callback(rename(data.path,data.name));
  });
  socket.on('remove', function( data, callback ) {       
    console.log("remove")
    console.log(data);
    callback(remove(data.path));
  });
  socket.on('content', function( data, callback ) {       
    console.log("content")
    console.log(data);
    callback(content(data.path));
  });  
  ss(socket).on('upload', function(stream, data,callback) {
    var p = toLocalPath(data.path);
    var filename=path.join(p,data.name);
    stream.pipe(fs.createWriteStream(filename));
    // var buffers = [];
    // stream.on('data', function(data) { buffers.push(data); });
    stream.on('end', function() {
         callback({success:true});
    });
  });    
  ss(socket).on('file', function(stream, data,callback) {
    var buffers = [];
    stream.on('data', function(data) { buffers.push(data); });
    stream.on('end', function() {
        var buffer = Buffer.concat(buffers);
        readStandardFile(buffer,data.name,callback)
    });
  });    
  socket.on('/folder', function( data, callback ) {
    console.log("/folder");
    console.log(data);
    var p=path.join(__dirname, 'media');
    var cmdStr = "start "+p; 
    //cmdStr = 'curl -u "username:password" https://prefix_link/PR4478847'
    exec(cmdStr, function(err,stdout,stderr){
        if(err) {
            callback({
          success:false,
          message: "open folder fail"
      });
        } else {
            callback({
          success:true,
          message: "open folder ok"
        });
        }
    });
  });    
  socket.on('/post/standard', function( data, callback ) {
    console.log("/post/standard");
    console.log(data);
    callback({
      success:true,
      data:[],
      message: "delete Contact ok"
    });
  }); 
});
