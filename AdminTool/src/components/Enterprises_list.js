import React, { Component } from 'react';
import {Link} from "react-router-dom";
import PerfectScrollbar from 'react-perfect-scrollbar'

import logo from './admin_tool_rolex/img/logo.png';


class EnterprisesList extends Component {
	
	
  render() {

    return (
		<>
		  <div className="">
        <img className="logo" src={logo} alt="cernex_logo"/>
        <h1 className="title">ENTERPRISES ADMINISTRATION TOOL</h1>
    </div>

      <div className="button-container">
        <table>
            <tr><td>
                <Link as={Link} to = "/rolexToolIndex" > Rolex Admin App</Link>
            </td></tr>
        </table>
    </div>
		</>
    );
  }
}

export default EnterprisesList;