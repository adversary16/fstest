import React, { Component } from 'react'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import openSocket from 'socket.io-client';
import UserEntry from './UserEntry';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ChatList from './ChatList';
import UserList from './UserList';
import { Grid, Paper } from '@material-ui/core';
import Logon from './Logon';


const chatURL = ':3081/chat';
const signallingURL = ':3081/signalling';

class Chat extends Component {
  state = {
    name: 'Bob',
    messages: [],
    users: {}
  }

  chatSocket = openSocket(chatURL,{transports:['websocket'],query:{"room":"asdasd","name":this.state.name},forceNew:true});
  signallingSocket = openSocket(signallingURL,{transports:['websocket'],query:{"room":"asdasd","name":this.state.name},forceNew:true});
  componentDidMount() {
    this.chatSocket.on('open',() => {
      console.log('connected')
    });

    this.chatSocket.on('chat message',(evt) => {
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
            // console.log(evt.users[user]);
            this.addUser(evt.users[user])
        };
        // evt.users.map((user)=>{this.updateUsers(user)});
        evt.chats.map((msg) => {this.addMessage(msg); return true });
    })

    this.chatSocket.on('leave',(evt)=>{
        console.log(this.state.users);
    });
    

    this.chatSocket.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
    }
  }

  removeUser = user => 
    delete this.state.users[user.value];

  addUser = user => 
    {
        console.log(this.state.users)
    this.setState(state=>( state.users[user.value] = user))};

  addMessage = message =>{
    this.setState(state => ({ messages: [message, ...state.messages] }))};

  submitMessage = messageString => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    // let timestamp = new Date();
    const message = { name: this.state.name, sender: this.chatSocket.id, value: messageString};
    this.chatSocket.emit("chat message",message);
    // this.addMessage(message)
  }

  render() {
    return (
    <Grid container className="main" justify="center" padding={20}>
        <Logon></Logon>
        <Paper padding="20">
      <UserList 
            users = { this.state.users }
      />
      </Paper>
      <Paper>
        <ChatList
            messages = { this.state.messages }
        />
        <ChatInput
          ws={this.ws}
          onSubmitMessage={messageString => this.submitMessage(messageString)}
        />
        <label htmlFor="name">
          Name:&nbsp;
          <input
            type="text"
            id={'name'}
            placeholder={'Enter your name...'}
            value={this.state.name}
            onChange={(e) => {this.setState({ name: e.target.value })}}
          />
        </label>
        </Paper>
        </Grid>
    )
  }
}

export default Chat