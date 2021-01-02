import { FixedSizeList } from 'react-window';
import moment from 'moment';
import PropTypes from 'prop-types';
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
        minWidth: 720,
        maxWidth: 960,
        minHeight: 640,
        maxHeight: 720,
        overflowY: "scroll"
    },
    header: {
        backgroundColor:"teal"
    }
})

export default function ChatList({messages}){
const classes = useStyles();
return (
    <Container>
    <List className = {classes.root}>
    {/* <Toolbar>Messages</Toolbar> */}
    {messages.map((message, index) =>
    <ChatMessage
        key={index}
        message={message.value}
        name={message.name}
        timestamp = { moment(message.timestamp).format("LTS, MMMM Do")}
    />,
)}
</List>
</Container>)
}