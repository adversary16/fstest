import { Button, Card, CardActionArea, CardActions, CardMedia, Container, makeStyles } from "@material-ui/core";
import { localeData } from "moment";
import { Component } from "react";
import appSettings from "./conf/vars";
import uuidv4 from "./utils/uuid";


let localstream = false;


async function start(){
    localstream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    const streamWindow = document.getElementById('localvid');
    streamWindow.srcObject = localstream;
}

async function stop(){
        localstream.getVideoTracks().forEach(track=>{
            track.stop();
        })
}


async function call(socket, rtc){
    let connection = rtc;
      try {  await connection.createOffer().then((offer)=>{
            connection.setLocalDescription(offer);
            console.log("Local description set");
            socket.emit(offer.type,offer);
            }); } catch (e) {console.log(e)}
    return connection;
};


async function acceptIncomingCall(e,rtc){
    let remoteConnection = rtc;
    try {remoteConnection.setRemoteDescription(e) } catch (e) {console.log(e)};
    try {remoteConnection.createAnswer().then((answer)=>{
        remoteConnection.setLocalDescription(answer);
    })} catch (e) {console.log(e)}
    return remoteConnection;
}

let RTCconnections = {};

class LocalVideo extends Component{
    constructor(props){
        super(props);
        this.state={
            classes: this.useStyles(),
            localstream: new Promise (async(resolve)=>{navigator.mediaDevices.getUserMedia({audio: true, video: appSettings.webrtc.constraints.video}).then((stream)=>{resolve(stream)})})
        
        }

    }

    useStyles(){
        return makeStyles({
            localVideo: {
                width: 512,
                height: 320
            }
        })
    }
 
  async  componentDidMount(){
    this.signallingSocket = this.props.signallingSocket;
    this.signallingSocket.on('join',async (msg)=>{this.initiateConnection(msg)});
    this.signallingSocket.on('offer', async (msg)=>{this.receiveConnection(msg)});
    this.signallingSocket.on('answer',async (msg)=>{this.handleAnswer(msg)});
    this.signallingSocket.on('icecandidate',async (msg)=>{this.handleIceCandidates(msg)})
    this.remoteVideo = document.getElementById('remoteVid');
        start();
    }

   async  initiateConnection(msg){
        let cid = msg.token;
        console.log('i initiate a call');
        let re = this.signallingSocket.id;
        let to = msg.signallingSocket;
        let initiatedConnection = new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics});
        await this.addTracksToRTC(initiatedConnection);
        let offer = await initiatedConnection.createOffer();
        await initiatedConnection.setLocalDescription(offer);
        this.signallingSocket.emit(offer.type,{cid:cid,re:re,to:to,payload:offer});
        initiatedConnection.addEventListener('iceconnectionstatechange',(e)=>{console.log(e)});
        initiatedConnection.addEventListener('icecandidate',(event)=>{
            this.signallingSocket.emit(event.type,{cid,to,re,payload:event.candidate});
        })
        initiatedConnection.addEventListener('track',(event)=>{
            if (this.remoteVideo.srcObject !== event.streams[0]) {
                this.remoteVideo.srcObject = event.streams[0];
                console.log('pc2 received remote stream');
              }
        })
        RTCconnections[cid] = initiatedConnection;
    }
    async receiveConnection(offer){
        let cid = offer.cid;
        console.log('i receive a call');
        let re = this.signallingSocket.id;
        let to = offer.re;
        let receivedConnection = new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics});
        try { await receivedConnection.setRemoteDescription(offer.payload)} catch (e){console.log(e)}
        try {await this.addTracksToRTC(receivedConnection)} catch (e){console.log(e)}
        let answer = await receivedConnection.createAnswer();
        try {await receivedConnection.setLocalDescription(answer)} catch (e){console.log(e)}
        this.signallingSocket.emit(answer.type,{cid:cid,to:to,re:re,payload:answer});
        receivedConnection.addEventListener('icecandidate',(event)=>{
            this.signallingSocket.emit(event.type,{cid,to,re,payload:event.candidate});
        });
        receivedConnection.addEventListener('track',(event)=>{
            if (this.remoteVideo.srcObject !== event.streams[0]) {
                this.remoteVideo.srcObject = event.streams[0];
                console.log('pc2 received remote stream');
              }
        });
        RTCconnections[cid] = receivedConnection;
        console.log(receivedConnection);
    }

    async handleAnswer(answer){
        let to = answer.re;
        let re = this.signallingSocket.id;
        let cid = answer.cid;
        try {await RTCconnections[cid].setRemoteDescription(answer.payload)} catch (e) {console.log(e)};

    }

    async handleIceCandidates(ice){
        if (ice.payload!=null){
        let to = ice.re
        let re = this.signallingSocket.id;
        let cid = ice.cid;
        try {await RTCconnections[cid].addIceCandidate(ice.payload)} catch (e){console.log(e)};
        }
    }

    async addTracksToRTC(connection){
        let stream = await this.state.localstream;
            stream.getTracks().forEach((track)=>{connection.addTrack(track,stream)});
    }

    componentWillUnmount (){
        Object.keys(RTCconnections).map((cid)=>{
            RTCconnections[cid].close();
        })
    }

    render(){
        return(
        <Container key={ uuidv4 }>
        <Card>
                <CardMedia
                    component="video"
                    autoPlay={ true }
                    muted={ true }
                    id="localvid"
                    className={this.useStyles().localVideo}
                />
            <CardActions>
            <Button onClick={()=>call(this.signallingSocket)}>CALL</Button>
                <Button onClick={ stop }>STOP</Button>
            </CardActions>
        </Card>
        <Card>
                <CardMedia
                    component="video"
                    autoPlay= { true }
                    id="remoteVid"
                    className={this.useStyles().localVideo}
                />
            <CardActions>

            </CardActions>
        </Card>
        </Container>
    )}
};

export default LocalVideo