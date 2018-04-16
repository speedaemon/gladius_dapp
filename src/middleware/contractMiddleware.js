import * as Actions from '../actions';
import Web3 from 'web3';
import * as kbpgp from 'kbpgp';

let myWeb3;

const myEthAddr = '0x0F1b7A5085Aa593675BA83a70d235f8abDd90548';
const gladContractABI = [{"constant":true,"inputs":[],"name":"getPublicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getApplicants","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_applicationData","type":"string"}],"name":"submitApplication","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getEncryptedData","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_applicant","type":"address"}],"name":"getApplication","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPublicData","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_publicKey","type":"string"},{"name":"_publicData","type":"string"},{"name":"_encryptedData","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
let contract;

// Handles for the PGP key managers
let contractIdentity;
let myIdentity;

// A handle for the PGP key ring
let keyRing;

// Initialize web3 library
window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined') {
        myWeb3 = new Web3(window.web3.currentProvider);
        myWeb3.eth.defaultAccount = window.web3.eth.defaultAccount;
    } else {
        myWeb3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/iojKNoC6QvyOiK828vDD"));
    }

    // Setup access to the contract
    contract = new myWeb3.eth.Contract(gladContractABI, '0x5Bd4bB7Be6b37Cf253ed7564432A43d4A8426A1A');
});







export const actionHandler = store => next => action => {

    const state = store.getState();

    switch(action.type) {
        case Actions.INIT_APP: {
            setupPGP(state.home.privateKey);
            // pull down unencrypted and encrypted contract specs
            contract.methods.getPublicData().call({from: myEthAddr}, (error, result) => {
                error ? console.log(error) : store.dispatch(Actions.publicDataReceived(result));
            });
            contract.methods.getEncryptedData().call({from: myEthAddr}, (error, result) => {
                error ? console.log(error) : store.dispatch(Actions.encryptedDataReceived(result));
            });
        
            break;
        }
        case Actions.SUBMIT_APP: {
            // encrypt submission data
            kbpgp.box({ msg: JSON.stringify(action.payload), encrypt_for: contractIdentity}, (err, result_string, result_buffer) => {
                // send it!
                contract.methods.submitApplication(result_string).send({ from: myEthAddr}, (error, result) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(result);
                        alert("Application Submitted!");
                    }
                });
            });

            break;
        }
    }
    next(action);
};

const setupPGP = (privKey) => {
    keyRing = new kbpgp.keyring.KeyRing;

    // Ask the contract for its public key and load it
    contract.methods.getPublicKey().call({from: myEthAddr}, (error, result) => {
        kbpgp.KeyManager.import_from_armored_pgp({
            armored: result
        }, (err, keyManager) => {
            if (err) {
                console.log(err);
            } else {
                contractIdentity = keyManager;
                keyRing.add_key_manager(keyManager);
            }
        });
    });

    // Load keypair we already have
    kbpgp.KeyManager.import_from_armored_pgp({
        armored: privKey
    }, (err, keyManager) => {
        if (err) {
            console.log(err);
        } else {
            if (keyManager.is_pgp_locked()) {
                keyManager.unlock_pgp({
                    passphrase: 'password'
                }, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        keyRing.add_key_manager(keyManager);
                        myIdentity = keyManager;
                    }
                });
            } else {
                keyRing.add_key_manager(keyManager);
                myIdentity = keyManager; 
            }
        }
    });
};
