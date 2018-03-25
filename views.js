var path=require('path');
var fs=require('fs');
console.log(path.resolve(__dirname));
//console.log(path)
var app_root=path.resolve(".");
function toPath(p){
    var stat=fs.statSync(p);
    return {"path": path.relative(app_root,p),
            "name": path.basename(p),
            "time": stat.mtime,
            "isdir": stat.isDirectory(),
            "size":stat.size};
}
//console.log(toPath("run.bat"))
//console.log(toPath("static"))
function toLocalPath(path1){
    var fsPath = path.resolve(app_root, path1);
    console.log(fsPath);
    //if(os.path.commonprefix([app_root, fsPath]) != app_root){
    //    raise Exception("Unsafe path "+ fsPath+" is not a  sub-path  of root "+ app_root)
    //}
    return fsPath;
}
//toLocalPath("abc")
function toWebPath(path){
     return "/static/"+path;
}
function children(path1){
    console.info(path1);
    var p = toLocalPath(path1);
    if (fs.existsSync(p)){

    }
    else{
        p= toLocalPath(".");
    }
    var children = fs.readdirSync(p);
    var children_stats=children.map((one, idx) =>{
        var p1=p+"/"+one;
        return toPath(p1);
    });
    dic={"path": p,"children": children_stats};
    return dic;
}
//console.info(children("."))
function parent(path1){
    let parent1;
	if(path1 === app_root){
	    parent1 = path1;
    }
	else{
	    parent1 = path.dirname(path1);
    }
	var dic=toPath(parent1);
	return dic;
}
console.log(parent("."));
// def content(request):
// 	p = toWebPath(request.GET["path"])
// 	return HttpResponseRedirect(p)
// def remove(request):
//     p = toLocalPath(request.GET["path"])
//     if os.path.isdir(p):
//         shutil.rmtree(p)
//     else:
//         os.remove(p)
//     return HttpResponse(	json.dumps({"status":"success"}, ensure_ascii=False) )
// def rename2(request):
// 	logging.info("rename==============")
// 	p = toLocalPath(request.GET["path"])
// 	name = request.GET["name"]
// 	parent = os.path.dirname(p)
// 	updated = os.path.join(parent, name)
// 	os.rename(p, updated)
// 	return HttpResponse(	json.dumps({"status":"success"}, ensure_ascii=False) ) 
// def upload(request):
//     p = toLocalPath(request.GET["path"])

//     name = request.GET["name"]
//     pweb = toWebPath(request.GET["path"])+"/"+name
//     uploaded = request.FILES[ 'file' ]
//     data=uploaded.read()
//     uploadedPath = os.path.join(p, name)
//     try:
//         f = open(uploadedPath, 'wb' ) # Writing in binary mode for windows..?
//         f.write( data )
//         f.close( )
//         res={"status":"success", "files":"./"+pweb}
//     except e:
//         res={"status":"fail", "files":str(e)}
//     return HttpResponse(	json.dumps(res, ensure_ascii=False) ) 
// def mkdir(request):
//     p = toLocalPath(request.GET["path"])
//     name = request.GET["name"]
//     os.mkdir(os.path.join(p, name))
//     return HttpResponse(	json.dumps({"status":"success"}, ensure_ascii=False) ) 