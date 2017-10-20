import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "./contextmenu2";
import {Navbar,Nav,NavItem,Popover,Tooltip,OverlayTrigger} from "react-bootstrap";
import "./react-contextmenu.css"
var io = require("socket.io-client");
var socket=io('http://localhost:8000');
var ss = require('socket.io-stream');
class File extends React.Component {
    glyphClass=()=>{
        var className = "glyphicon ";
        className += this.props.isdir ? "glyphicon-folder-open" : "glyphicon-file";
        return className;
    }
    remove=()=> {
        socket.emit("remove",{path:this.props.path},()=>{
            this.props.browser.reloadFilesFromServer();
        });
    }
    rename=(updatedName)=> {
        socket.emit("rename",{path:this.props.path,name:updatedName},()=>{
            this.props.browser.reloadFilesFromServer();
        });
    }

    onRemove=(e,data)=>{
        console.log("onRemove");
        var type = this.props.isdir ? "folder" : "file";
        var remove =window.confirm("Remove "+type +" '"+ this.props.path +"' ?");
        if (remove)
                this.remove();
    }

    onRename=(e,data)=>{
        console.log("onRename");
        var type = this.props.isdir ? "folder" : "file";
        var updatedName = prompt("Enter new name for "+type +" "+this.props.name);
        if (updatedName != null)
                this.rename(updatedName);
    }

    renderList=()=>{
        var dateString =  new Date(this.props.time).toLocaleString();//toGMTString()
        //var glyphClass = this.glyphClass();
        return (<tr id={this.props.id} ref={this.props.path}>
                        <td>
                        <ContextMenuTrigger id={""+this.props.id}>
                        <a onClick={this.props.onClick}>
                        {//<span style={{fontSize:"1.5em", paddingRight:"10px"}} className={glyphClass}/>
                        }
                        {this.props.name}</a>
                        </ContextMenuTrigger>
                        <ContextMenu id={""+this.props.id}>
                            <MenuItem data={{a:1}} onClick={this.onRemove}>删除</MenuItem>
                            <MenuItem data={{a:2}} onClick={this.onRename}>重命名</MenuItem>
                        </ContextMenu>
                        </td>
                        <td>{File.sizeString(this.props.size,this.props.isdir)}</td>
                        <td>{dateString}</td>
                        </tr>);
    }
    renderGrid=()=>{
        //var glyphClass = this.glyphClass();
        let style1;
        if (this.props.isdir){
            console.log("isdir");
            style1={display:"inline-block",marginLeft: "20px",backgroundColor:"#ccc"}
        }
        else{
            style1={display:"inline-block",marginLeft: "20px"}   
        }
        return (
            <div style={style1}  ref={this.props.path} >
                <ContextMenuTrigger id={""+this.props.id+"2"}>
                    <a  id={this.props.id} onClick={this.props.onClick}>
                   {
                    //<span style={{fontSize:"3.5em"}} className={glyphClass}/>
                    }
                    {this.props.name}</a>
                </ContextMenuTrigger>
                <ContextMenu id={""+this.props.id+"2"}>
                    <MenuItem data={{a:1}} onClick={this.onRemove}>remove</MenuItem>
                    <MenuItem data={{a:2}} onClick={this.onRename}>rename</MenuItem>
                </ContextMenu>
            </div>);
    }

    render=()=>{
            return this.props.gridView ? this.renderGrid() : this.renderList();
    }
    static id = ()=>{return (Math.pow(2,31) * Math.random())|0; }

    static timeSort =(left, right)=>{return left.time - right.time;}

    static sizeSort = (left, right)=>{return left.size - right.size;}

    static pathSort = (left, right)=>{return left.path.localeCompare(right.path);}

    static sizes = [{count : 1, unit:"bytes"}, {count : 1024, unit: "kB"}, {count: 1048576 , unit : "MB"}, {count: 1073741824, unit:"GB" } ]

    static sizeString = (sizeBytes,isdir)=>{
        if (isdir){
            return null;
        }
        var iUnit=0;
        var count=0;
        for (iUnit=0; iUnit < File.sizes.length;iUnit++) {
                count = sizeBytes / File.sizes[iUnit].count;
                if (count < 1024)
                        break;
        }
        return "" + (count|0) +" "+ File.sizes[iUnit].unit;
    }
};
class  Browser extends React.Component {
     state= {
              paths : ["."],
              files: [],
              sort: File.pathSort,
              gridView: true,
              current_path:"",
              displayUpload:"none",
          }

    loadFilesFromServer=(path)=>{
        var self=this;
            socket.emit("list",{path:path},(data)=>{
                    var files = data.children.sort(self.state.sort);
                    var paths = self.state.paths;
                    if (paths[paths.length-1] !== path)
                    paths = paths.concat([path])
                    self.setState(
                            {files: files,
                                    paths: paths,
                            sort: self.state.sort,
                            gridView: self.state.gridView});
                    self.updateNavbarPath(self.currentPath());
            });
    }
    updateNavbarPath=(path)=>{
         // var elem  = document.getElementById("pathSpan");
        // elem.innerHTML = '<span class="glyphicon glyphicon-chevron-right"/>' +path;
        this.setState({current_path:path});

    }
    reloadFilesFromServer=()=> {
        this.loadFilesFromServer(this.currentPath())
    }

    currentPath =()=>{
        if (this.state.paths.length>0)
            return this.state.paths[this.state.paths.length-1]
        else
            return this.state.paths[0]
    }

    onBack =()=>{
            if (this.state.paths.length <2) {
                    alert("Cannot go back from "+ this.currentPath());
                    return;
            }
            var paths2=this.state.paths.slice(0,-1);
            this.setState({paths:paths2});
            this.loadFilesFromServer(paths2[paths2.length-1])
    }

    onUpload=()=>{
            this.setState({displayUpload:""});
    }

    onParent=()=>{
        console.log("onParent");
        var data={path:this.currentPath()};
        console.log(data);
        socket.emit("parent",data,(res)=>{
            var parentPath = res.path;
            this.updatePath(parentPath);
        });
    }

    alternateView=()=>{
            var updatedView = !  this.state.gridView;

            this.setState(
              {
                    gridView: updatedView
              });
    }
    uploadFile=(evt)=>{
        console.log(evt);
        var path = this.currentPath();
        const file = evt.target.files[0];
        var stream = ss.createStream();
        // upload a file to the server.
        var app=this;
        ss(socket).emit('upload', stream, {path:path,name:file.name,size: file.size},(res)=>{
           console.log(res);
           this.reloadFilesFromServer();
           this.setState({displayUpload:"none"});
        });
        ss.createBlobReadStream(file).pipe(stream);
    }
    componentDidMount=()=>{
        console.log("mount======");
        console.log(this.props.initpath);
        if (this.props.initpath)
            this.state.paths.push(this.props.initpath);
        var path = this.currentPath();
        this.loadFilesFromServer(path);
    }

    updateSort=(sort)=>{
            var files  = this.state.files
                    var lastSort = this.state.sort;
            if  (lastSort === sort)
                    files = files.reverse();
            else
                    files = files.sort(sort);

            this.setState({files: files, sort: sort,  paths: this.state.paths, gridView: this.state.gridView});
    }

    timeSort=()=>{
            this.updateSort(File.timeSort);
    }
    pathSort=()=>{
            this.updateSort(File.pathSort);
    }
    sizeSort=()=>{
            this.updateSort(File.sizeSort);
    }
    updatePath=(path)=>{
            this.loadFilesFromServer(path);
    }
    getContent=(path)=>{
        console.log("content");
        console.log(path);
        //var url = buildGetContentUrl(path);
        //console.log(url);
        //window.open(url, url, 'height=800,width=800,resizable=yes,scrollbars=yes');
        socket.emit("content",{path:path},(data)=>{
            console.log(data);
            this.setState({value:data});
        });
    }
    mkdir=()=>{
        var newFolderName = prompt("Enter new folder name");
        if (newFolderName == null)
                return;
        socket.emit("mkdir",{path:this.currentPath(),name:newFolderName},
          this.reloadFilesFromServer
        );
    }
    onClick=(f)=>{
        console.log("onClick");
        console.log(f);
        if (f.isdir){
          this.updatePath(f.path);
        }
        else{
           this.getContent(f.path);
        }
    }
    mapfunc=(f, idx)=>{
      var id  =  File.id(f.name);
      return (<File key={idx}  id={id} gridView={this.state.gridView} onClick={()=>this.onClick(f)} 
      path={f.path} name={f.name} isdir={f.isdir} size={f.size} time={f.time} browser={this}
      />)
    }
    onChange=(newValue)=>{
      console.log('change',newValue);
      this.setState({value:newValue});
    }
    genpath=(path)=>{
        console.log("genpath=============")
        console.log(path);
        var paths=path.split("\\");
        console.log(paths);
        var r=[]
        var i=0;
        while(i<paths.length){
            var s="";
            for(var j=0;j<i+1;j++){
                s+=paths[j];
                if (j<i) s+="\\";
            }
            //console.log(paths[i])
            //console.log(s)
            r.push([s,paths[i]])
            i++;
        }
        var hs=r.map((item,idx)=>{
            return <span key={idx} style={{marginLeft:"6px"}} onClick={()=>{this.linkclick(item[0])}}>{item[1]}\</span>
        })
        return hs;
    }
    linkclick=(e)=>{
        console.log(e);
        this.updatePath(e);
    }
    rootclick=()=>{
        this.updatePath(".")
    }
    render=()=>{
        console.log(this.state.paths);
        const tooltipback = (
          <Tooltip id="tooltipback"><strong>back</strong></Tooltip>
        );
        const tooltipparent = (
          <Tooltip id="tooltipparent"><strong>parent</strong></Tooltip>
        );
        const tooltipupload = (
          <Tooltip id="tooltipparent"><strong>upload</strong></Tooltip>
        );
        const files = this.state.files.map(this.mapfunc);
        var pathshow=this.genpath(this.state.current_path);
        var gridGlyph = "glyphicon glyphicon-th-large";
        var listGlyph = "glyphicon glyphicon-list";
        var className = this.state.gridView ? listGlyph : gridGlyph;
        var toolbar=(
<div>
<Navbar inverse collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand>
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        <NavItem eventKey={1} href="#">
            <OverlayTrigger placement="bottom" overlay={tooltipback}>
                <span onClick={this.onBack} className="glyphicon glyphicon-arrow-left">
                </span>
            </OverlayTrigger>
        </NavItem>
        <NavItem eventKey={2} href="#">
            <OverlayTrigger placement="bottom" overlay={tooltipparent}>
                <span onClick={this.onParent} className="glyphicon glyphicon-arrow-up"/>
           </OverlayTrigger>
        </NavItem>
        <NavItem eventKey={3} href="#">
            <OverlayTrigger placement="bottom" overlay={tooltipupload}>
            <span  onClick={this.onUpload} className="glyphicon glyphicon-upload"/>
            </OverlayTrigger>
        </NavItem>
        <NavItem eventKey={4} href="#">
            <span onClick={this.mkdir} >
                <i style={{fontSize: 8,verticalAlign:"top"}} className="glyphicon glyphicon-plus"></i>
                <span className="glyphicon glyphicon-folder-open"/>
            </span>
        </NavItem>
        <NavItem eventKey={5} href="#">   
            <span onClick={this.alternateView} ref="altViewSpan" className={className} />
        </NavItem>
        <NavItem eventKey={6} href="#">
            <span onClick={this.rootclick} className="glyphicon glyphicon-chevron-right"/>
            {pathshow}
        </NavItem>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
<input type="file" id="uploadInput" onChange={this.uploadFile} style={{display:this.state.displayUpload}} /></div>);
            const ace=<AceEditor
                style={{width:"100%",zIndex:2,}}
                mode="javascript"
                theme="github"
                value={this.state.value}
                onChange={this.onChange}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{$blockScrolling: true}}
            />;
            if (this.state.gridView)
            {
                return (
                    <div>
                        <Popover
                          id="popover-basic"
                          placement="right"
                          positionLeft={0}
                          positionTop={0}
                        >
                         <div>rename</div>
                         <div>remove</div>
                        </Popover>
                        <div style={{width:"100%",
                                zIndex:1,
                                maxHeight:"300px",
                                overflow:"scroll"}}>
                            {toolbar}
                            <div  style={ {display : "inline"}}>
                            {files}
                            </div>
                        </div>
                        {ace}
                    </div>);

            }
            else{
              var sortGlyph = "glyphicon glyphicon-sort";
              return (
                <div> 
                         <div style={{width:"100%",
                                zIndex:2,
                                maxHeight:"300px",
                                overflow:"scroll"}}>
                            {toolbar}
                            <table className="table table-responsive table-striped table-hover">
                              <thead><tr>
                              <th><button onClick={this.pathSort} className="btn btn-default"><span className={sortGlyph}/>名称</button></th>
                              <th><button onClick={this.sizeSort} className="btn btn-default"><span className={sortGlyph}/>大小</button></th>
                              <th><button onClick={this.timeSort} className="btn btn-default"><span className={sortGlyph}/>修改日期</button></th>
                              </tr></thead>
                              <tbody>
                              {files}
                              </tbody>
                              </table>
                        </div>
                        {ace}
                </div>)
            }
    }
}

export default Browser;
