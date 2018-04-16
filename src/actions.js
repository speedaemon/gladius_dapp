export const INIT_APP = "INIT_APP";
export const PUBLIC_DATA_RECEIVED = "PUBLIC_DATA_RECEIVED";
export const ENCRYPTED_DATA_RECEIVED = "ENCRYPTED_DATA_RECEIVED";
export const SUBMIT_APP = "SUBMIT_APP";

export const initApp = () => {
    return {
        type: INIT_APP
    }
};

export const publicDataReceived = (publicData) => {
    return {
        type: PUBLIC_DATA_RECEIVED,
        payload: publicData
    };  
};

export const encryptedDataReceived = (encryptedData) => {
    return {
        type: ENCRYPTED_DATA_RECEIVED,
        payload: encryptedData
    };  
};

export const submitApp = (values) => {
    return {
        type: SUBMIT_APP,
        payload: values
    };
};
