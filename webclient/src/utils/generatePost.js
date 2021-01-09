import appSettings from "../conf/vars";

function generatePostRequest(postBodyJSON){
    let body = JSON.stringify(postBodyJSON);
    let request = {
        method: appSettings.api.method,
        body: body,
        headers: appSettings.api.headers
    }
    return request;
}

export default generatePostRequest