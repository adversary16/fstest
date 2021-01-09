import { List } from "@material-ui/core";
import UserEntry from "./UserEntry";

function isMe(ownUserId,userIdToMatch){
  return (ownUserId===userIdToMatch)
}

export default ({ users, me }) => (
<List>
{ (Object.keys(users).map((user) =>
  <UserEntry
    token = { users[user].socketId }
    key = { users[user].socketId }
    name = { users[user].name }
    isMe = { isMe(me, users[user].name) }
  />
))}
</List>
)