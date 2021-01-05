import { List, Toolbar } from "@material-ui/core";
import UserEntry from "./UserEntry";

function isMe(ownUserId,userIdToMatch){
  return (ownUserId===userIdToMatch)
}

export default ({ users, me }) =>
<List>
{ (Object.keys(users).map((user) =>
  <UserEntry
    token = { users[user].token }
    key = { users[user].token }
    name = { users[user].name }
    isMe = { isMe(me, users[user].name) }
  />
))}
</List>