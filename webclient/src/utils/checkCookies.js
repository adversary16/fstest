import Cookies from "universal-cookie";
import CAPTIONS from "../captions";
import appSettings from "../conf/vars";
import authorizeUser from "./authorizeUser";

const cookies = new Cookies();

function CheckCookies(location){
    let authCookie = cookies.get(appSettings.api.cookieLabel+location);
  
    if (typeof(authCookie)=='undefined'){
      return false;
    }
    else {
      let authQuery = {
        name: authCookie.user,
        token: authCookie.token,
        room: location
      }
      const isUserAuthorized = authorizeUser(authQuery);
      console.log(isUserAuthorized);
      return (!!isUserAuthorized);
    };
  }

export default CheckCookies