import { List, Toolbar } from "@material-ui/core";
import UserEntry from "./UserEntry";

export default ({ users }) =>
<List>
{ (Object.keys(users).map((user) =>
  <UserEntry
    key={ users[user].value }
    name={ users[user].name }
  />
))}
</List>