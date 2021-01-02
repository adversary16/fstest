import moment from 'moment';
import React from 'react';


const { List, Toolbar, makeStyles, Container } = require("@material-ui/core");
const { default: ChatMessage } = require("./ChatMessage");
// const { default: useStyles } = require("./styles");

const useStyles = makeStyles({
    root: 
    {
        display: "flex",
        flexDirection: "column-reverse",
        height: "100%",
        width:"80%",
        minWidth: 480,
        maxWidth: 960,
        minHeight: 480,
        maxHeight: 720,
        overflowY: "scroll"
    },
    header: {
        backgroundColor:"teal"
    },
    ownMessage: {
        backgroundColor: "green",
    },
    message: {
        backgroundColor: "gray"
    }
})

function IsOwn (sendername, ownname){
return (sendername==ownname)
}

export default function ChatList({messages, name}){
const classes = useStyles();
return (
    <Container>
    <List className = {classes.root}>
    {/* <Toolbar>Messages</Toolbar> */}
    {messages.map((message, index) =>
    <ChatMessage
        isOwn = {IsOwn(name,message.name)}
        key={index}
        message={message.value}
        name={message.name}
        timestamp = { moment(message.timestamp).format("LTS, MMMM Do")}
    />,
)}
</List>
</Container>)
}