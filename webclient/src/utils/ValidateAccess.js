import appSettings from "../conf/vars";
import checkCookies from "./checkCookies";
import GetChatWithId from "./GetChatWithId";
import GetLogonScreenWithId from "./GetLogonScreenWithId";
import removeNonAlphanumeric from "./removeNonAlphanumeric";

function ValidateAccess(path){
    let location = removeNonAlphanumeric (path.path);
    if (checkCookies(location) && (location.length>=appSettings.navigation.minRoomNameLength) && (location!==appSettings.navigation.logonPageDefaultPath)){
      return GetChatWithId(location)
    }
    else{
      return GetLogonScreenWithId(location);
    }
  }

export default ValidateAccess