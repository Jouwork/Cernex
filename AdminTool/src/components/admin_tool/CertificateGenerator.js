
import React, { Component } from 'react';
import logo from '../img/logo.png';
import Web3 from 'web3';
import smart_contract from '../../abis/RolexToken.json'
import Swal from 'sweetalert2';
import './admin_tool_css/certificate_generator.css';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from "axios";


class CertificateGenerator extends Component {

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

        const urlInfo = window.location.pathname.split("/")
        this.setState({privateKey: urlInfo[2]})
        this.setState({numSerie: urlInfo[3]})
        this.setState({ownerAddress: urlInfo[4]})
	
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

      handleSubmit(event) {
        event.preventDefault();
        alert(
          `Selected file - ${this.fileInput.current.files[0].name}`
        );
      }

      _checkIfInfoCorrect = async (primaryKey, numPedido, descripcion, modelo, numeroSerie, ownerAddress, saleDate) => {
        if(primaryKey != ""  && numPedido != "" && descripcion != "" && modelo != "" && numeroSerie != "" && ownerAddress != "" && saleDate != "" ) {
            Swal.fire({
                icon: 'question',
                title: 'Everything OK?',
                imageUrl: `${this.state.fileInput}`,
                showDenyButton: true,
                html:
                    '<table><tbody>' +
                    '<tr><td>Primary Key:</td>' + ' <td>' +  `${primaryKey}` +'</td></tr> ' + 
                    '<tr><td>Order number:</td>' + ' <td>' + `${numPedido}` +'</td> </tr> ' + 
                    '<tr><td>Serial Number:</td>' + ' <td>' +  `${numeroSerie}` +'</td> </tr> ' +
                    '<tr><td>Brand and Model:</td>' + ' <td>' +  `${modelo}` +'</td></tr> ' + 
                    '<tr><td>Description:</td>' + ' <td>' + `${descripcion}` +'</td> </tr> ' + 
                    '<tr><td>Owner Address:</td>' + ' <td>' +  `${ownerAddress}` +'</td> </tr> ' +
                    '<tr><td>Sale Date:</td>' + ' <td>' + `${new Date(saleDate * 1000).toDateString()}` +'</td> </tr> ' + 
                    '</tbody></table>',
                confirmButtonText: 'Generate Certificate',
                denyButtonText: `Change Input Data`,
                }).then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        this._createCertificate(primaryKey, numPedido, descripcion, modelo, numeroSerie, ownerAddress, saleDate)
                        
                    } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                    }
        })}else{
            Swal.fire('Missing Fields', '', 'error')
        }
    }    
      _createCertificate = async (primaryKey, numPedido, descripcion, modelo, numeroSerie, ownerAddress, saleDate) => {
        
        try {  
               const productDataCreation = await this.state.contract.methods.createProductData(primaryKey, numPedido, descripcion, modelo, numeroSerie, ownerAddress, this.state.imageUrl, saleDate).send({
                from: this.state.account
        })
        console.log(productDataCreation)
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Go to admin tool'
          }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/administrationTool"
            }
          })
       
    } catch (err) {
        this.setState({ errorMessage: err })
    } finally {
        this.setState({ loading: false })
    }
      }


      _sendFileToIPFS = async () => {

       
            try {

                const formData = new FormData();
                formData.append("file", this.state.fileInput);

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        'pinata_api_key': 'e85486ed129edba74d23', 
                        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkMDMzZWVmOC0yZTcwLTRjZDctYjM1Yy1hZDVmYjg0YzUzZTUiLCJlbWFpbCI6ImF5ZW5zYTg1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlODU0ODZlZDEyOWVkYmE3NGQyMyIsInNjb3BlZEtleVNlY3JldCI6IjU5M2MwZTQ4NTczZTM3NTQwMjYyYTk0OWFlZGQyZDM5MzYxYjdhYWViYTI2MTIzMGU1OWJmOTJjMjk0ZTQwNGYiLCJpYXQiOjE2OTY3ODI0NjN9.-6uhQEzbJVBdlC-bhfcu5VcnmdpTqrJV7Ca9JHSsVLY",
                        "Content-Type": "multipart/form-data"
                    },
                })
            
                const imageUrl = `https://rose-parental-galliform-245.mypinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                this.setState({imageUrl})
//Take a look at your Pinata Pinned section, you will see a new file added to you list.   



            } catch (error) {
                console.log("Error sending File to IPFS: ")
                console.log(error)
            }
        
    }

    constructor(props) {
		super(props)
		this.state = {
          account: "0x0",
		  privateKey: null,
          contract: null,
          saleDate: null,
          fileInput: null,
          imageUrl: null,
          contractOwner: null,
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
        <h1 className="title">CERTIFICATE GENERATOR</h1>
    </div>

    <form onSubmit={(event) => {
         event.preventDefault()
         const primaryKey = this.primaryKey.value
         const numPedido = this.numPedido.value
         const garantia = this.description.value
         const modelo = this.modelo.value
         const numeroSerie = this.numeroSerie.value
         const ownerAddress = this.ownerAddress.value
         const saleDate = this.state.saleDate.getTime() / 1000
        
         this._sendFileToIPFS(this.state.fileInput)
         
 
      this._checkIfInfoCorrect(primaryKey, numPedido, garantia, modelo, numeroSerie, ownerAddress, saleDate)
    }} >
    <div className="input-text-box">
        <div className="input-container">
            <label className="input-label-hash">Customer Private Key</label>
            <input type="string" className="input-field"
                         placeholder="Customer Private Key" value={this.state.privateKey}
                         ref={(primaryKey) => this.primaryKey = primaryKey} />
        </div>
    </div>
    <div className="input-section">
        <div className="column">
            <div className="input-group">
                <label className="input-label">Order Number</label>
                <div className="input-container">
                <input type="string" className="input-field"
                         placeholder="Order Number"
                         ref={(numPedido) => this.numPedido = numPedido} />
                </div>
            </div>
            <div className="input-group">
                <label className="input-label">Product Description</label>
                <div className="input-container">
                <input type="string" className="input-field"
                         placeholder="Product Description"
                         ref={(description) => this.description = description} />
                </div>
            </div>
        </div>
        <div className="column">
            <div className="input-group">
                <label className="input-label">Brand and Model</label>
                <div className="input-container">
                <input type="string" className="input-field"
                         placeholder="Brand and Model"
                         ref={(modelo) => this.modelo = modelo} />
                </div>
            </div>
            <div className="input-group">
                <label className="input-label">Serial Number</label>
                <div className="input-container">
                <input type="string" className="input-field"
                         placeholder="Serial Number" value={this.state.numSerie}
                         ref={(numeroSerie) => this.numeroSerie = numeroSerie} />
                </div>
            </div>
        </div>
    </div>


    <div className="input-section">
        <div className="column">
            <div className="input-group">
                <label className="input-label">Date of Purchase</label>
                <div className="input-container">
                <DatePicker className="input-field" selected={this.state.saleDate} onChange={(saleDate) => this.setState({saleDate})} />
                </div>
            </div>
        </div>
        <div className="column">
            <div className="input-group">
                <label className="input-label">Owner Address</label>
                <div className="input-container">
                <input type="string" className="input-field"
                         placeholder="Owner Address" value={this.state.ownerAddress}
                         ref={(ownerAddress) => this.ownerAddress = ownerAddress} />
                </div>
            </div>
        </div>
        </div>
        <div className="input-section">
        <div className="column">
            <div className="input-group">
                <label className="input-label">Image Uri</label>
                <div className="input-container">
                <input type="file" className="input-field"
                         onChange={(e) => this.setState({fileInput: e.target.files[0]})} required />
                </div>
            </div>
        </div>
       
        </div>
        <div className="random-number-section">
            <button id="generate-button" className="custom-button" type="submit">Generate</button>
            <button href="index.html" className="back-button"  onClick={(event) => {
                                window.location.href ="/privateKeyGenerator" }}>Back</button>
        </div>
    </form>

    

    </>
    );
    }
}

export default CertificateGenerator;