function removeNonAlphanumeric (inputString){
    inputString.replace(/[^A-Za-z0-9]/g, '');
    return inputString;
}

export default removeNonAlphanumeric;