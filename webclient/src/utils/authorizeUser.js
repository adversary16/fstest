import Cookies from "universal-cookie";
import CAPTIONS from "../captions";
import appSettings from "../conf/vars";
import generatePostRequest from "./generatePost";

const cookies = new Cookies();

async function authorizeUser(query,cb){
    let isAuthorized = false;
    let cookieLabel = appSettings.api.cookieLabel;
    let authCookie = cookies.get(cookieLabel+query.room);
    let authToken =  authCookie ? authCookie.token : false;
    let authQuery = query;

    if (authToken) { authQuery = {...{token:authToken}, ...authQuery }};
    let authUrl = appSettings.api.basePath+appSettings.api.auth;

    let authParams = generatePostRequest(authQuery); 
    const authRequest = await fetch (authUrl, authParams);

    let authResponse = await authRequest.json ();
    if (authResponse.success){
        console.log(authResponse);
        let cookieToSet = { values:
            {
            user: authResponse.name,
            room: authResponse.room,
            token: authResponse.token
             },
            path: {path: "/"+authResponse.room}
         }
        cookies.set(cookieLabel+query.room, cookieToSet.values,cookieToSet.path);
        isAuthorized = true;
    } else {
        alert (CAPTIONS.LOGON.LOGON_FAILED);
    }
    if (cb && typeof(cb)=== "function"){
       await cb()
    } else {
        return isAuthorized;
    }
}

export default authorizeUser