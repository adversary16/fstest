import React, { Component } from 'react'
import ChatInput from './ChatInput'
import openSocket from 'socket.io-client';
import ChatList from './ChatList';
import UserList from './UserList';
import { Grid, makeStyles, Paper, Toolbar } from '@material-ui/core';
import LocalVideo from './LocalVideo';
import uuidv4 from './utils/uuid';


// const parsedCookie = cookies.get('token');

const chatURL = ':3081/chat';
const signallingURL = ':3081/signalling';

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
      },
      videoChatTab:{
        width: 200
      }
    });
    return styles;
}




  getOwnUserName = () => {
    // let ownName = cookies.get('token');
    // this.setState(state=>{state.name=ownName.user});
  }

  chatSocket = openSocket(chatURL,{transports:['websocket'],query:{room:this.props.chatId,user:this.props.userId,token:this.props.token},forceNew:true});
  signallingSocket = openSocket(signallingURL,{transports:['websocket'],query:{"room":this.props.chatId,"user":this.props.userId,token:this.props.token},forceNew:true});
  componentDidMount() {
    this.chatSocket.on('connect',() => {
      console.log(this.props.userId);
      // this.getOwnUserName();

      this.chatSocket.emit('hello',{user: this.props.userId, token: this.state.token})
    });

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
        // evt.users.map((user)=>{this.updateUsers(user)});
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
        <Paper padding="20" className="test">
        <Toolbar>
        Users
    </Toolbar>
      <UserList 
            users = { this.state.users }
            me = {this.props.userId}
      />
      </Paper>
      <Paper>
      <Toolbar>Messages</Toolbar>
        <ChatList
            messages = { this.state.messages }
            name = { this.props.userId }
        className = { this.state.classes.chatTab }/>
        <ChatInput
          ws={this.ws}
          onSubmitMessage={messageString => this.submitMessage(messageString)}
        />
        </Paper>
        <Paper className={ this.state.classes.videoChatTab }>
        <Toolbar>
          VideoChat
         </Toolbar>
          <LocalVideo signallingSocket = { this.signallingSocket } name = {this.props.userId} key={uuidv4}/>
        </Paper>
        </Grid>
    )
  }
}

export default Chat