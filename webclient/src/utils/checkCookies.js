import Cookies from "universal-cookie";
import CAPTIONS from "../captions";
import appSettings from "../conf/vars";
import authorizeUser from "./authorizeUser";
import generatePostRequest from "./generatePost";

const cookies = new Cookies();

async function validateToken(token,roomOptional){
  const validationUrl = appSettings.api.basePath+appSettings.api.validation;
  let validationQuery = generatePostRequest(token );
  let validationRequest = await fetch(validationUrl,validationQuery);
  let validationResponse = await validationRequest.json();
  let isTokenValid = (validationResponse.success);
  return isTokenValid;
}

async function CheckCookies(location){
    let authCookie = cookies.get(appSettings.api.cookieLabel+location);

    if (typeof(authCookie)=='undefined'){
      return false;
    }
    else {

      const isUserAuthorized = await validateToken(authCookie);
      return (!!isUserAuthorized);
    };
  }

export default CheckCookies