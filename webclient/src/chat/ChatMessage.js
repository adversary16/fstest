import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
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
    marginTop: 2,
    borderRadius: 8,
    width: '60%',
    minWidth: 480*0.7,
    marginLeft: '30%'
  },
  othersMessage:{
    backgroundColor: "#EEE",
    marginTop: 2,
    borderRadius: 8,
    width: '60%',
    minWidth: 480*0.7,
    marginRight: '30%'
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