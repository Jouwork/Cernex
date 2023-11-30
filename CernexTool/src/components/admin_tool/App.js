import React, { Component } from 'react';
import Inicio from './Inicio';
import {BrowserRouter, Route,  Routes, Link} from "react-router-dom";
import OwnerCertificatesPage from "./OwnerCertificatesPage";
import NftDisplay from './NftDisplay';
import PrivateKeyGenerator from './admin_tool/PrivateKeyGenerator';
import Admin_tool_index from './admin_tool/Admin_tool_index';
import CertificateGenerator from './admin_tool/CertificateGenerator';



class App extends Component {
	
  render() {
    return (
        <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Inicio />} />
                         <Route path='/certificatesList' element={< OwnerCertificatesPage />} /> 
                         <Route path='/certificateDisplay/:id' element={<NftDisplay/>} />
                         <Route path='/administrationTool' element={<Admin_tool_index/>} />
                         <Route path='/privateKeyGenerator' element={<PrivateKeyGenerator/>} />
                         <Route exact path='/certificateGenerator/:privateKey/:numSerie/:ownerAddress' element={<CertificateGenerator/>} />
                    </Routes>
        </BrowserRouter>
    );
  }
}

export default App;