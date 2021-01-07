import { Button, Grid, Paper, TextField } from '@material-ui/core';
import React, { Component } from 'react';
import CAPTIONS from "./captions";
import validateInput from './chat/validateInput';
import appSettings from './conf/vars';
import authorizeUser from './utils/authorizeUser';
import removeNonAlphanumeric from './utils/removeNonAlphanumeric';

const {  Toolbar, makeStyles } = require("@material-ui/core");


class Logon extends Component {
    constructor(props){
        super(props);
        this.reloadAfterLogon = this.reloadAfterLogon.bind(this);
    }
    chatId = this.props.path;

    componentDidMount(){
    }

    reloadAfterLogon(){
        document.location.href='/'+this.chatId;
    }

    render() {
        return(
    <Grid container justify="center" className="logon_wrapper_grid">
        <Paper className="logon_wrapper" justify="center">
            <Toolbar justify="center" id="logon_caption">
                { CAPTIONS.LOGON.FORM_LABEL }
            </Toolbar>
            <form id ="logon_form" onSubmit={async (e) => {
          e.preventDefault();
          if (e.target.length>2){
              let inputRoom = removeNonAlphanumeric(e.target[2].value);
              
            this.chatId = (inputRoom.length>=appSettings.navigation.minRoomNameLength) ? inputRoom : this.chatId;
          }
         authorizeUser({name:e.target[0].value,room:this.chatId},this.reloadAfterLogon);
        }}>
            <TextField  inputProps={{ maxLength: 20, minLength: appSettings.navigation.minUserNameLength }} onInput = { validateInput} label={"Username: min "+appSettings.navigation.minUserNameLength+" characters"} variant="outlined" name="logon" id="logon_username"/>
            { ((!this.chatId)||(this.chatId.length< appSettings.navigation.minRoomNameLength)) ?
            <TextField inputProps={{ minLength: appSettings.navigation.minRoomNameLength }} label={ "Room: min "+appSettings.navigation.minRoomNameLength+" characters"} variant="outlined" name="room" id="logon_chatroom" /> 
   : '' }
            <Button type="submit" variant="outlined" id="logon_submit"> { CAPTIONS.LOGON.SUBMIT_BUTTON } </Button>
            </form>
        </Paper>
    </Grid>)}
}

export default Logon