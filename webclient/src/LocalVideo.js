import { Button, Card, CardActionArea, CardActions, CardMedia, Container, makeStyles, Toolbar } from "@material-ui/core";
import { localeData } from "moment";
import { Component } from "react";
import appSettings from "./conf/vars";
import uuidv4 from "./utils/uuid";
import RemoteVideoCard  from './RemoteVideoCard'



let RTCconnections = {};

class LocalVideo extends Component{
    constructor(props){
        super(props);
        this.state={
            classes: this.useStyles(),
            localstream: new Promise (async(resolve)=>{navigator.mediaDevices.getUserMedia({audio: true, video: appSettings.webrtc.constraints.video}).then((stream)=>{resolve(stream)})}),
            remotestreams: {}
        
        }
        this.muteCamera = this.muteCamera.bind(this);
    }

    useStyles(){
        return makeStyles({
            localVideo: {
                width: 512,
                height: 320
            }
        })
    }
 
    async start(){
        let streamWindow =  document.getElementById('localvid');
        streamWindow.srcObject = await this.state.localstream;
    }

    async muteCamera(){
        (await this.state.localstream).getVideoTracks().forEach((track)=>{
            track.stop();
        })
    }

  async  componentDidMount(){
    this.signallingSocket = this.props.signallingSocket;
    this.signallingSocket.on('join',async (msg)=>{this.initializeConnection(msg)});
    this.signallingSocket.on('offer', async (msg)=>{this.initializeConnection(msg)});
    this.signallingSocket.on('answer',async (msg)=>{this.handleAnswer(msg)});
    // this.signallingSocket.on('icerequest',async (msg)=>{this.respondWithIce(msg,false)});
    this.signallingSocket.on('icecandidate',async (msg)=>{this.handleIceCandidates(msg)})
    this.signallingSocket.on('leave', async (msg) => {this.removeDisconnectedUser(msg)});
    this.remoteVideo = document.getElementById('remoteVid');
        this.start();
    }

    async initializeConnection(msg){
        let cid = msg.token || msg.cid;
        delete RTCconnections[cid]
        let re = this.signallingSocket.id;
        let to = msg.signallingSocket || msg.re;
        let name = msg.name;
        let connection = new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics});
        connection['outputStream'] = false;
        await this.addTracksToRTC(connection);
        connection.addEventListener('icecandidate',(ev)=>{});
        connection.addEventListener('track',(track)=>{
            connection.outputStream = track.streams[0];
            this.setState((state=>( state.remotestreams[cid]={stream:track.streams[0],name})));
            console.log(connection);
        });
        connection.addEventListener('iceconnectionstatechange',(e)=>{
            console.log('Ice connection state changed to '+e.target.iceConnectionState+" "+cid);
            if (e.target.iceConnectionState==('disconnected'||'new')){
                e.target.close();
                if (!!RTCconnections[cid]){
                    delete RTCconnections[cid];
                }
                console.log(RTCconnections);
                let prevState = this.state.remotestreams;
                if (!!prevState[cid]){
                    delete RTCconnections[cid];
                };
                this.setState({remotestreams:prevState});
            }
        });
        connection.addEventListener('icegatheringstatechange',(e)=>{console.log('Ice gathering state changed to '+e.target.iceGatheringState)});
        connection.addEventListener('icecandidate',async (e)=>{
            await this.signallingSocket.emit(e.type,{cid,re,to,payload:e.candidate});
        })

        let localDescription;
        if (!!msg.token){
            localDescription = await connection.createOffer();
        } else {
            await connection.setRemoteDescription(msg.payload);
            localDescription = await connection.createAnswer();

        }
        await connection.setLocalDescription(localDescription);
        await this.signallingSocket.emit(localDescription.type,{cid,re,to,payload:localDescription});

        RTCconnections[cid] = connection;
        console.log(RTCconnections);
    }

    async handleAnswer(answer){
        let to = answer.re;
        let re = answer.to;
        let cid = answer.cid;
        try {await RTCconnections[cid].setRemoteDescription(answer.payload)} catch (e) {console.log("error"+e)};
        // this.respondWithIce(answer, true);
    }

    async handleIceCandidates(ice){
        if (ice.payload!=null){
        let to = ice.re;
        let re = ice.to;
        let cid = ice.cid;
        try {await RTCconnections[cid].addIceCandidate(ice.payload)} catch (e){console.log(e); console.log(RTCconnections)};
        }
    }

    async addTracksToRTC(connection){
        let stream = await this.state.localstream;
            stream.getTracks().forEach((track)=>{connection.addTrack(track,stream)});
    }

    async removeDisconnectedUser(callId){
        let cid = callId;
        // RTCconnections[cid].close();
        delete RTCconnections[cid];
        let prevState = this.state.remotestreams;
        delete prevState[cid];
        this.setState({remotestreams:prevState});
        console.log('user with token $callid left'+cid)
    }

    componentWillUnmount (){
        Object.keys(RTCconnections).map((cid)=>{
            RTCconnections[cid].close();
        });
        RTCconnections = {};
        this.setState({remotestreams:{}});

    }

    findUserNameBySignallingSocket(socketId){
        let sid = socketId;
        let userName = Object.keys(this.props.users).find(user=>this.props.users[user].signallingSocket === sid );
        return userName;
    }

    render(){
        return(
        <Container>
            <Toolbar> {this.props.name} </Toolbar>
        <Card key = { uuidv4+"x" }>
                <CardMedia
                    component="video"
                    autoPlay={ true }
                    muted={ true }
                    id="localvid"
                    className={this.useStyles().localVideo}
                />
            <CardActions>
                <Button onClick={ this.muteCamera }>MUTE CAM</Button>
            </CardActions>
        </Card>
        { Object.keys(this.state.remotestreams).map((cid)=>
            
        <RemoteVideoCard key = { cid } cid={cid} srcObject={ this.state.remotestreams[cid] } />
        )}
        </Container>
    )}
};

export default LocalVideo