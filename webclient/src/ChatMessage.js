import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  timeStamp: 
  {
    textAlign:"right",
    fontSize:'0.3em'
  },
  userSignature:{
    textAlign: "left",
    fontSize: '0.6em'
  },
  ownMessage:{
    backgroundColor: "#90ee90",
    marginTop: 2
  },
  othersMessage:{

  }
})



export default function ChatMessage({ name, message, timestamp, isOwn }) {
  const classes = useStyles();
  return (<ListItem className={(isOwn ? classes.ownMessage : classes.othersMessage)}alignItems="flex-start"> 
    <ListItemText primary = {message}
      secondary = {
          <React.Fragment>
            <Typography className={classes.userSignature}>
              { name }
            </Typography>
            <Typography className={classes.timeStamp}>
              { timestamp }
            </Typography>
          </React.Fragment>
      }
   />
    {/* <strong>{name}</strong> <em>{message}</em> */}
  </ListItem>
)}