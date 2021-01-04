import { Button, Grid, Paper, TextField } from '@material-ui/core';
import React, { Component } from 'react';
import { useCookies } from "react-cookie";
import { render } from 'react-dom';
import Cookies from 'universal-cookie';

const { List, Toolbar, makeStyles, Container } = require("@material-ui/core");

// function HandleCookie(val){
//     console.log('cookie access');

//     console.log(val);
//     setCookie("user",val,{
//         path: "/"
//     })
// }
// }

const useStyles = makeStyles({
    logonBoxWrapper:{
        width:'100%',
        display: 'flex'
    },
    logonBox: {
        width: 512,
        height: 320
    }
})

const cookies = new Cookies();

async function didLogin(query){
    // let username = e.value;
    let response = await fetch("/api?action=logon&user="+query.user+"&room="+query.room);
    if (response.ok){
        let parsedResponse = await response.json();
        if (parsedResponse.success){
        cookies.set('token', {user:parsedResponse.user,token:parsedResponse.token,room:parsedResponse.room}, {path: "/"+query.room});
        window.location.reload();
        } else {
            cookies.remove('token');
            alert ('Looks like the name is taken');
        }
    }
    if (cookies.get('token')){console.log(false)}
    return true;
}

class Logon extends Component {
    state={
        classes: this.useStyles(),
    }
    chatId = this.props.chatId;

    useStyles(){
        return makeStyles({
            logonBoxWrapper:{
                width:'100%',
                display: 'flex'
            },
            logonBox: {
                width: 512,
                height: 320
            }
        })
    }

    render() {
        return(
    <Grid container justify="center" className={this.state.classes.logonBoxWrapper}>
        <Paper className={this.state.classes.logonBox} justify="center">
            <Toolbar justify="center">
                PLEASE ENTER YOUR NAME
            </Toolbar>
            <form onSubmit={e => {
          e.preventDefault();
          console.log(e.target[0].value);
          didLogin({user:e.target[0].value,room:this.chatId});
        }}>
            <TextField label="Login" variant="outlined" name="logon" id="logon"/>
            <Button type="submit" variant="outlined">Get</Button>
            </form>
        </Paper>
    </Grid>)}
}

export default Logon