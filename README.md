# FORA SOFT ADMISSION TEST

Hey!
This is my JS eval task.
It is a JS-based, WebRTC-powered video chat. 

## FEATURES
1. Dynamic chat rooms with sharable links. If you copy and send the room URL ( http://DOMAIN.ZONE/*somethingsomething* ), recipient will be able to log in by that particular link.
2. Storable and restorable chat history: once you log in to the room, you see the whole long story of discussion there.
3. WebRTC video conferencing within every room.
4. And screen sharing.
5. And sturdy dual-websocket setup, fully separating WebRTC signalling from chat events.
6. And stupid, ugly, lame design.
### UNDER THE HOOD - BRIEF

The chat is decoupled into three different services:
[core] handles webSocket communication with chats, provides authentication and data.
[webcient] delivers front end page
[mongodb] is, well, mongoDB. It stores credentials, chat logs and room descriptions.

WebRTC video chat is done the simplest way: it only uses core to dispatch signalling messages, all of the calls are established peer-to-peer.

### INSTALLATION AND RUNNING
Quick way:
A. Install and start mongoDB
1. docker pull mongo
2. docker run --rm -d  -p 27017:27017/tcp mongo:latest
B. Install dependencies and start core
1. cd core
2. npm i && npm start
C. Install dependencies and start web client
1. cd webclient
2. npm i && npm start

Smart way:
A. Install and start mongoDB
1. docker pull mongo
2. docker run --rm -d  -p 27017:27017/tcp mongo:latest
B. Build and run docker images for core and webclient.
Be advised: ** --net host ** is mandatory for core.

OR: lazy and smart way.
1. docker-compose -f docker-compose.yml up --force-recreate --build

### API

The REST API is _very_ simple.
It uses two routes:
/api/auth is used to sign up. It accepts a JSON with desired username and room name, and responds with either a token or success:false, if the name is already busy for that room.
/api/validate accepts a token within JSON and responds with success: true if a token is valid for a room, or success: false otherwise


Query to /api/auth is a stringified JSON object, that contains:
**for new user**
1. *user*: _String_ -- username
2. *room*: _String_ -- room name


### WebSocket API
All communication within a chat session is done through websocket connections.
*/chat* namespace: messaging, user list updates  
*/signalling* namespace: WebRTC signalling + partial user data for independence from chat socket


**Chat events**

1. On connection:
*New user* -- receives "welcome" type message: message log and user roster within a JSON object
welcome:
{
    users: {name, token, signalling and chat socket id's}
    messages: {text, sender name, timestamp}
}

*Other users* -- receive "join" type message: user details:
user: {name, token, signalling and chat socket id's}

2. On incoming message:
type "chat": {name: author username, sender: author socketId, value: text, timestamp}

3. While sending a message, user does not iclude a timestamp within an object. Timestamps are generated on the backend.
type "chat": {name: author username, sender: author socketId, value: text}

2. On leave:
type "leave": {name: username}

**Signalling events**
1. On connection:
a "join" message is emitted to all users except the joining one.

payload:
type "join" {name: author username, signallingSocket: socketId, chatSocket: socketId}.


2. On "join"
Receiving a join message on a Signalling socket, all users emit RTCPeerconnection offers towards the newcomer.
In addition to WebRTC payload, this kind of messages contains auxiliary data.
type "offer":
{
    to: recipient's signalling socket Id
    re: sender's signalling socket Id
    name: user's name
    payload: RTC offer
}

Further down the RTC handshake flow, other party's signalling socket Id is used as a call identifier.

3. On "offer"
For each offer, newcoming user generates an RTC answer and ships it back in the same manner:
type "answer":
{
    to: recipient's signalling socket Id
    re: sender's signalling socket Id
    payload: RTC answer
}

4. On "answer" and "icecandidate" -- same flow:
{
    to: recipient's signalling socket Id
    re: sender's signalling socket Id
    payload: RTC signalling payload
}

5. On "leave", a message with an id of signalling socket to be closed is emitted:
type "leav"{string signallingSocket.id}


** DB structure **
The system relies on MongoDB for data storage. 
Data is organized into three collections:
rooms: {String name, ObjectId users [contains references to users signed up to a room] , ObjectId chat [contains references to related messages])
Room document is created on first request for it, and is never deleted.

users: {String name, String unique token, String chatSocket, String signallingSocket, ObjectId room [refers to a doc on "rooms" collection], Boolean isActive] 
User document is created on successful sign-up and updated on log-on, log-out events with actual chatSocket, signallingSocket ids. isActive is updated to true once chatSocket id is present for a user, and to false once it is unset.
*name* is unique within a chatroom, token is unique systemwide. 

 
messages: {String value, String name, ObjectId senderId [refers to a doc on "users" collection], ObjectId room [refers to a doc on "rooms" collection], Date timestamp].
only chat messages are stored [while neither "user joined"\"left" nor signalling socket messages are]. Timestamp is set automatically via a pre-save middleware. 
