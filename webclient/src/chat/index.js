import React, { Component } from 'react'
import ChatInput from './ChatInput'
import openSocket from 'socket.io-client';
import ChatList from './ChatList';
import UserList from './UserList';
import { Grid, makeStyles, Paper, Toolbar } from '@material-ui/core';
import VideoChat from '../videochat';
import uuidv4 from '../utils/uuid';
import CAPTIONS from "../captions";
import appSettings from '../conf/vars';

class Chat extends Component {
    // parsedCookie = JSON.parse(cookies.get('token'));
    constructor (props){
      super(props);
      this.state = {
        classes: this.useStyles(),
        messages: [],
        users: {},
        chatId: this.props.chatId,
      }

    }

  useStyles(){
    let styles = makeStyles({
      userListTab:{
        width: '30%',
        minWidth:240
      }
    });
    return styles;
}




  chatSocket = openSocket(appSettings.chat.path,{transports:['websocket'],query:{room:this.props.chatId,user:this.props.userId,token:this.props.token},forceNew:true});
 
  componentDidMount() {
    this.chatSocket.on('connect',() => {});

    this.chatSocket.on('chat',(evt) => {
        const message = evt;
  
        this.addMessage(message)
    })

    this.chatSocket.on('leave',(evt)=>{
        console.log(evt);
        this.removeUser(evt)
    })

    this.chatSocket.on('join',(evt)=>{
        this.addUser(evt);
    })

    this.chatSocket.on('welcome',(evt)=>{
        for (let user in evt.users){
            this.addUser(evt.users[user])
        };

        evt.messages.map((msg) => {this.addMessage(msg); return true });
    })

    this.chatSocket.on('leave',(evt)=>{
        let userToDelete=evt.name;
        this.removeUser(userToDelete);
    });
    

    this.chatSocket.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
    }
  }

  removeUser = userName => 
  { let nextStateUserList = this.state.users;
    console.log(userName);
    delete nextStateUserList[userName];
    console.log(nextStateUserList);
   this.setState(state => ({users: nextStateUserList}))
  };

  addUser = user => 
    {
      console.log(user);
    this.setState(state=>( state.users[user.name] = user))
    }
  addMessage = message =>{
    this.setState(state => ({ messages: [message, ...state.messages] }))};

  submitMessage = messageString => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    // let timestamp = new Date();
    const message = { name: this.props.userId, sender: this.chatSocket.id, value: messageString};
    this.chatSocket.emit("chat",message);
    // this.addMessage(message)
  }

  render() {
    return (
    <Grid container className="main" justify="center" padding={20} key={ uuidv4 }>
      <Grid container id="videochat_wrapper" justify="center">
      <Paper id="videochat">
          <VideoChat token={ this.props.token } users={ this.state.users } name={ this.props.userId} room = { this.props.chatId } key={uuidv4}/>
        </Paper>
      </Grid>
      <Grid container id="chat_wrapper" justify="center">
      <Paper>
      <Toolbar>{ CAPTIONS.CHAT.CHAT_TAB }</Toolbar>
        <ChatList
            messages = { this.state.messages }
            name = { this.props.userId }
        className = { this.state.classes.chatTab }/>
        <ChatInput
          ws={this.ws}
          onSubmitMessage={messageString => this.submitMessage(messageString)}
        />
        </Paper>
        <Paper padding="20" className="user_list">
        <Toolbar>
       { CAPTIONS.CHAT.USERS_TAB }
    </Toolbar>
      <UserList 
            users = { this.state.users }
            me = {this.props.userId}
      />
      </Paper>
        </Grid>
        </Grid>
    )
  }
}

export default Chat