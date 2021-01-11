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
B. Build and run docker image for core and webclient. Be advised: ** --net host ** is mandatory for core.

OR.
1. docker-compose -f docker-compose.yml up --force-recreate --build

### API

The REST API is _very_ simple.
It uses a single route (/api/auth) to handle both new and already authenticated users.

The logon flow is as follows.
1. Upon visiting a chat room link for the first time, user is prompted to enter a username
2. Username and room name are sent to the core to check, if the name is available for that room
3. Upon success, a cookie is set, and a user is taken to the chat.
4. Upon failure, a user is propmted to enter another username. 


Query to /api/auth is a stringified JSON object, that contains:
**for new user**
1. *user*: _String_ -- username
2. *room*: _String_ -- room name

The [core] checks if a username is not being used at the moment in a room.
If a room is not present at a time, it is created.
On success:
1. Core creates generatess a UUIDv4 token and inserts it with the new entry in the *users* collection 
2. Response with *success: true, token: _String uuid* is sent to the user.
3. Token is stored in a cookie alongside with user data. *Cookie is per-chat to maintain chatroom-scope name uniqueness*

On failure:
1. Reponse JSON with *success: false* is sent to the user.
2. User is prompted to try another username.

**for a user who already has a token** the flow differs slightly.
If a cookie for a chatroom is present, its *token* value is sent to the core alongside with *user* and *room* identifiers.
In this case, the username-token token pair is checked with two different outcomes:
1. Username taken, token is the same == success (e.g., user can access write under the same name from multiple tabs within a browser)
2. Username available == success. In this case, a user's token is being stored in the database.
3. Username taken, token is different == failure


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
type "join" {name: author username, token: token, signallingSocket: socketId, chatSocket: socketId}.
_most data is redundant to ensure any issues with chat socket won't affect video conferencing_

2. On "join"
Receiving a join message on a Signalling socket, all users emit RTCPeerconnection offers towards the newcomer.
In addition to WebRTC payload, this kind of messages contains auxiliary data.
type "offer":
{
    to: recipient's signalling socket Id
    re: sender's signalling socket Id
    cid: call id \deprecated\
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
    cid: call id \deprecated\
    payload: RTC answer
}

4. On "answer" and "icecandidate" -- same flow:
{
    to: recipient's signalling socket Id
    re: sender's signalling socket Id
    cid: call id \deprecated\
    payload: RTC signalling payload
}

5. On "leave", a message with an id of signalling socket to be closed is emitted:
type "leav"{string signallingSocket.id}