import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';


const msg = ['ahb','cde','asdasf','[eir'];
const EntryList = msg.map((entry)=>{
    return (<ListItem button>
    <ListItemText primary={ entry } />
    </ListItem>)
});
const BufferList = () => (
  <React.Fragment>
    <List
      dense
      subheader={<ListSubheader>WeeChat</ListSubheader>}
      style={{ padding: 0 }}
    >
      {/* { Entry({value:'asasd'}) } */}
      { EntryList }
    </List>
  </React.Fragment>
);

export default BufferList;