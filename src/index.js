import React from 'react';
import ReactDOM from 'react-dom';
import Browser from './Browser.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import {Button,Overlay,Tooltip,Navbar,Nav,NavItem,Popover,OverlayTrigger} from "react-bootstrap";
class  Example extends  React.Component{
  state={ show: false }

  // toggle=()=>{
  //   this.setState({ show: !this.state.show });
  // }
  // handleMouseDown=(event)=>{
  // 	console.log("d");
  // }
  handleContextMenu = (event) => {
        this.handleContextClick(event);
        //callIfExists(this.props.attributes.onContextMenu, event);
  }
  handleContextClick=(event)=>{
  	event.preventDefault();
    event.stopPropagation();
	this.setState({show:true});

  }
  rename=()=>{
    	console.log("rename")
    	this.setState({show:false});
    }
    remove=()=>{
    	console.log("remove")
    	this.setState({show:false});
    }
  render=()=>{
    return (
      <div >
        <span ref="target" onMouseDown={this.handleMouseDown}
            onContextMenu={this.handleContextMenu}
            onMouseUp={this.handleMouseUp}
            onTouchStart={this.handleTouchstart}
            onTouchEnd={this.handleTouchEnd}
            onMouseOut={this.handleMouseOut}>
          Click me!
        </span>
        <Overlay target={() => ReactDOM.findDOMNode(this.refs.target)} 
        container={this} show={this.state.show}  placement="right">
        	<div style={{position:"relative"}} >
	        	<div onClick={this.rename}>rename</div>
	        	<div onClick={this.remove}>remove</div>
        	</div>
        </Overlay>
      </div>
    );
  }
}
ReactDOM.render(<Example />, document.getElementById('root'));
