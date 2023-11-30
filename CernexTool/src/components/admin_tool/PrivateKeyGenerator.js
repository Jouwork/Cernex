import React, { Component } from 'react';
import logo from '../img/logo.png';
import Web3 from 'web3';
import smart_contract from '../../abis/RolexToken.json'
import Swal from 'sweetalert2';
import './admin_tool_css/style_hash_generator.css';
import {Link} from "react-router-dom";



class PrivateKeyGenerator extends Component {

    async componentDidMount() {
		// 1. Carga de Web3
		await this.loadWeb3()
		// 2. Carga de datos de la Blockchain
		await this.loadBlockchainData()
	  }
	
	  // 1. Carga de Web3
	  async loadWeb3() {
		
		if (window.ethereum) {
			try {
				window.web3 = new Web3(window.ethereum)
				const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
			
			} catch(err){
				window.alert("You must connect a wallet, check metamask or other wallet providers")
				window.location.href = "/"
		    }
		}
		else if (window.web3) {
		  window.web3 = new Web3(window.web3.currentProvider)
		}
		else {
		  window.alert('You may consider using metamask')
		  window.location.href = "/"
		}
	  }
	
	  // 2. Carga de datos de la Blockchain
	  async loadBlockchainData() {

		const web3 = window.web3
		
		const accounts = await web3.eth.getAccounts()
	
		this.setState({ account: accounts[0] })
		window.ethereum.on('accountsChanged', function (accounts) {
			// Time to reload your interface with accounts[0]!
			window.alert("account changed")
			const account = accounts[0]
			location.reload()
		  })
		// Ganache -> 5777, Rinkeby -> 4, BSC -> 97
		const networkId = await web3.eth.net.getId() 
		const networkData = smart_contract.networks[networkId]
		console.log('NetworkData:', networkData)
		
		if (networkData) {
			const abi = smart_contract.abi
			console.log('abi', abi)
			const address = networkData.address
			console.log('address:', address)
			const contract = new web3.eth.Contract(abi, address)
			this.setState({ contract })
			this.setState({loading: false})
            const contractOwner =  await contract.methods.infoSmartContract().call({ from: this.state.account })
            this.setState({contractOwner: contractOwner[1]})

			this.setState({loading: false})
            if(this.state.account != contractOwner[1]){
                Swal.fire('Logged wallet not contract owner', '', 'error')
            }
		} else {
		  window.alert('¡El Smart Contract no se ha desplegado en la red!')
		}
		
		
	   }


       _checkIfInfoCorrect = async (nombre, apellido1, apellido2, email, numSerie, ownerAddress) => {
        if(nombre != ""  && apellido1 != "" && apellido2 != "" && email != "" && numSerie != "" && ownerAddress != "" ) {
                Swal.fire({
                    icon: 'question',
                    title: 'Everything OK?',
                    showDenyButton: true,
                    html:
                        '<table><tbody>' +
                        '<tr><td>Customer name:</td>' + ' <td>' +  `${nombre}` +'</td></tr> ' + 
                        '<tr><td>Customer first surname:</td>' + ' <td>' + `${apellido1}` +'</td> </tr> ' + 
                        '<tr><td>Customer second surname:</td>' + ' <td>' +  `${apellido2}` +'</td></tr> ' + 
                        '<tr><td>Customer email:</td>' + ' <td>' + `${email}` +'</td> </tr> ' + 
                        '<tr><td>Serial Number:</td>' + ' <td>' +  `${numSerie}` +'</td> </tr> ' +
                        '<tr><td>OwnerAddress:</td>' + ' <td>' + `${ownerAddress}` +'</td> </tr> ' + 
                        '</tbody></table>',
                    confirmButtonText: 'Generate Primary Key',
                    denyButtonText: `Change Input Data`,
                    }).then((result) => {
                        /* Read more about isConfirmed, isDenied below */
                        if (result.isConfirmed) {
                            this._createPrivateKey(nombre, apellido1, apellido2, email, numSerie, ownerAddress)
                            
                        } else if (result.isDenied) {
                        Swal.fire('Changes are not saved', '', 'info')
                        }
            })
            }else {
               Swal.fire('Missing Fields', '', 'error')
             }

       }


    _createPrivateKey = async (nombre, apellido1, apellido2, email, numSerie, ownerAddress) => {
       
            try {
                const privateKey = await this.state.contract.methods.createPrivateKey(nombre, apellido1, apellido2, email,
                    numSerie, 
                    ownerAddress).call({from: this.state.account})
                    this.setState({privateKey})
                    this.setState({numSerie})
                    this.setState({ownerAddress})
                    Swal.fire({
                        icon: 'success',
                        title: 'OK',
                        text: `${privateKey}`,
                        confirmButtonText: 'Copy Primary Key',
                        denyButtonText: `Don't Copy`,
                        }).then((result) => {
                            /* Read more about isConfirmed, isDenied below */
                            if (result.isConfirmed) {
                            navigator.clipboard.writeText(privateKey)
                            Swal.fire('Saved!', '', 'success')
                            this.setState({disabled: false})
                            } else if (result.isDenied) {
                            Swal.fire('Changes are not saved', '', 'info')
                            }
                    })
                                    
            } catch (err) {
                this.setState({ errorMessage: err })
            } finally {
                this.setState({ loading: false })
            }
        
    }  

    constructor(props) {
		super(props)
		this.state = {
          account: "0x0",
          disabled: true,
          contractOwner: null,
          privateKey: null,
          numSerie: null,
          ownerAddress: null
		}
	  }
	
	
  render() {

    return (
        <>
        <div className="title-container">
        <div className="logo-container">
        <img className="logo" src={logo} alt="cernex_logo"/>
        </div>
        <h1 className="title">Private Key Generator</h1>
    </div>
    <form onSubmit={(event) => {
         event.preventDefault()
         const nombre = this.nombre.value
         const surname1 = this.surname1.value
         const surname2 = this.surname2.value
         const email = this.email.value
         const numSerie = this.numSerie.value
         const ownerAddress = this.ownerAddress.value
 
         this._checkIfInfoCorrect(nombre, surname1, surname2, email, numSerie, ownerAddress)
    }} >

    <div className="input-section">
        <div className="column">
            <div className="input-group">
                <label className="input-label">Customer name</label>
                <div className="input-container">
                
                    <input type="string"
                        placeholder="Name"
                        ref={(nombre) => this.nombre = nombre} />
               
                </div>
            </div>
          
            <div className="input-group">
                <label className="input-label">Customer first surname</label>
                <div className="input-container">
                    <input type="string"
                        placeholder="First Surname"
                        ref={(surname1) => this.surname1 = surname1} />
           
                </div>
            </div>
            <div className="input-group">
                <label className="input-label">Product Serial Number</label>
                <div className="input-container">
                <input type="string"
                         placeholder="Serial Number"
                         ref={(numSerie) => this.numSerie = numSerie} />
                </div>
            </div>
        </div>
        <div className="column">
            <div className="input-group">
               
                <label className="input-label">Customer Second surname</label>
                
                <div className="input-container">
                
                    <input type="string"
                         placeholder="Second Surname"
                         ref={(surname2) => this.surname2 = surname2} />	
                </div>
            </div>
          
            <div className="input-group">
                <label className="input-label">Customer email</label>
                <div className="input-container">
                    <input type="string"
                         placeholder="email"
                         ref={(email) => this.email = email} />
                </div>
            </div>
            <div className="input-group">
                <label className="input-label">Wallet Address</label>
                <div className="input-container">
                <input type="string"
                         placeholder="email"
                         ref={(ownerAddress) => this.ownerAddress = ownerAddress} />
                </div>
            </div>
        </div>
    </div>

    <div className="input-section">
        <div className="column">
            
        </div>
       
    </div>

    <div className="random-number-section">
        <button className="custom-button" type = "submit">Generate Number</button>
   
        <div className="random-number-box">
            <span className="generated_number" id="generated-number"></span>
        </div>
        <button className="copy-button"  onClick={(event) => {
        if(this.state.privateKey != null){
            navigator.clipboard.writeText(this.state.privateKey)
            Swal.fire('Saved!', '', 'success')
        }else{
            Swal.fire('No private key generated to copy!', '', 'error')
        }}}>Copy</button>
    </div>
    </form>
    

    <div className="back-button-container">
   
        <button href="index.html" className="back-button"  onClick={(event) => {
                                window.location.href ="/administrationTool" }}>Back</button>

 <Link to={`/certificateGenerator/${this.state.privateKey}/${this.state.numSerie}/${this.state.ownerAddress}`} className="back-button" disabled={this.state.disabled}>Next Step</Link>
    </div>   
    </>
    );
    }
}

export default PrivateKeyGenerator;