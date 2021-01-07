import Cookies from "universal-cookie";
import Chat from "../chat";
import appSettings from "../conf/vars";

function GetChatWithId(location){
  const cookies = new Cookies();
  let currentLocation = location;
  let cookieLabel = appSettings.api.cookieLabel+location;
  let userId  = cookies.get(cookieLabel).user;
  let token = cookies.get(cookieLabel).token;
  console.log(token);
    return <Chat chatId={currentLocation} userId={userId} token={token}/>;
}

export default GetChatWithId