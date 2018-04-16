import * as Actions from '../actions';
import Web3 from 'web3';
import * as kbpgp from 'kbpgp';

// Initialize web3 library
let web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/iojKNoC6QvyOiK828vDD"));
}

const myEthAddr = '0x0F1b7A5085Aa593675BA83a70d235f8abDd90548';

// Setup access to the contract
const gladContractABI = [{"constant":true,"inputs":[],"name":"getPublicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getApplicants","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_applicationData","type":"string"}],"name":"submitApplication","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getEncryptedData","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_applicant","type":"address"}],"name":"getApplication","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPublicData","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_publicKey","type":"string"},{"name":"_publicData","type":"string"},{"name":"_encryptedData","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const contract = new web3.eth.Contract(gladContractABI, '0x5Bd4bB7Be6b37Cf253ed7564432A43d4A8426A1A');

// Handles for the PGP key managers
let contractIdentity;
let myIdentity;

// A handle for the PGP key ring
let keyRing;

export const actionHandler = store => next => action => {

    const state = store.getState();

    // Setup key managers if we need to
    if (!contractIdentity || !myIdentity) setupPGP(state.home.privateKey);

    switch(action.type) {
        case Actions.INIT_APP: {
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
                console.log(err, result_string, result_buffer);
                // send it!
                contract.methods.submitApplication(result_string).send({ from: myEthAddr}, (error, result) => {
                    if (error) {
                        console.log(error);
                    } else {
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
