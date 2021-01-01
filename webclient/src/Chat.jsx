import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import ChatList from './ChatList';
import { AppBar, Box,Button,Container,List, ListItem, Toolbar, Tooltip, Typography } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    spacing: 32,
    justify: "center"
  },
  paper: {
    height: 960,
    width: 540,
  },
  members: {
      height: 960,
      width: 180
  },
  control: {
    padding: theme.spacing(2),
  },
  toolBar: {
    backgroundColor: "#efea01"
  },
  inputField: {
      variant:"outlined",
      width: '80%'
  },
  inputForm: {
      position:'relative',
      bottom:0
  },
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    }
  },
  ChatList:{
    backroundColor: '#afe'
  },
  boxed: {
      height:'85%',
      padding: 'inherit'
  }
}));

const Chat = () => {
  const classes = useStyles();

//   const handleChange = (event) => {
//     setSpacing(Number(event.target.value));
//   };

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={12}>
            <Grid item>
              <Paper className={classes.paper}>
                  <Toolbar className={classes.toolBar}>
                      <Typography>
                        asdasd  
                      </Typography>
                  </Toolbar>
                  <Container className={classes.boxed}>
                  <List>
                    <ListItem>
                    </ListItem>
                    <ListItem>
                        asdasd
                    </ListItem>
                    <ListItem>
                        asdasd
                    </ListItem>
                    <ListItem>
                        asdasd
                    </ListItem>
                    </List>
                    </Container>
                    <Box className={classes.inputForm}>
                  <TextField variant="outlined" className={classes.inputField}></TextField>
                  <Button variant="outlined">Submit</Button>
              </Box>
              </Paper>
            </Grid>
            <Grid>
              <Paper className={classes.members}>
                  <Toolbar className={classes.toolBar}>
                      <Typography>
                        Members  
                      </Typography>
                  </Toolbar>
              <List classname={classes.lol}>
                  <ListItem>
                      asdasd
                  </ListItem>
                  <ListItem>
                      asdasd
                  </ListItem>
                  <ListItem>
                      asdasd
                  </ListItem>
                  <ListItem>
                      asdasd
                  </ListItem>
                  
              </List>

              </Paper>
            </Grid>
        </Grid>
      </Grid>
    </Grid>

  );
}

export default Chat