import React, { Component } from 'react';
import {Link} from "react-router-dom";

import logo from './img/logo.png';


class Admin_tool_index extends Component {
	
	
  render() {

    return (
		<>
		  <div className="">
        <img className="logo" src={logo} alt="cernex_logo"/>
        <h1 className="title">ROLEX ADMINISTRATION TOOL</h1>
    </div>

      <div className="button-container">
        <Link as={Link} to = "/privateKeyGenerator" className="custom-button"> PRIVATE KEY GENERATOR</Link>
        <Link as={Link} to = "/certificateGenerator" className="custom-button"> CERTIFICATE GENERATOR</Link>
    </div>
    <button href="index.html" className="back-button"  onClick={(event) => {
                                window.location.href = "/" }}>Back to enterprise selection</button>
		</>
    );
  }
}

export default Admin_tool_index;