import React, { Component } from 'react';
import AdminToolRolexIndex from './admin_tool_rolex/Admin_tool_Rolex_index.js';
import {BrowserRouter, Route,  Routes, Link} from "react-router-dom";
import PrivateKeyGenerator from './admin_tool_rolex/PrivateKeyGenerator';
import CertificateGenerator from './admin_tool_rolex/CertificateGenerator';
import EnterprisesList from './Enterprises_list';




class App extends Component {
	
  render() {
    return (
        <BrowserRouter>
                    <Routes>
                    <Route path="/" element={<EnterprisesList />} />
                        <Route path="/rolexToolIndex" element={<AdminToolRolexIndex />} />
                         <Route path='/privateKeyGenerator' element={<PrivateKeyGenerator/>} />
                         <Route exact path='/certificateGenerator/:privateKey/:numSerie/:ownerAddress' element={<CertificateGenerator/>} />
                    </Routes>
        </BrowserRouter>
    );
  }
}
export default App;