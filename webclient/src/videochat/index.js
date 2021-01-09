import { Button, Card, CardActions, CardMedia, Container, makeStyles, Typography, Paper } from "@material-ui/core";
import { Component } from "react";
import appSettings from "../conf/vars";
import uuidv4 from "../utils/uuid";
import RemoteVideoCard  from './RemoteVideoCard'
import openSocket from 'socket.io-client';
///icons
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';



let RTCconnections = {};

class VideoChat extends Component{
    constructor(props){
        super(props);
        this.state={
            classes: this.useStyles(),
            localstream: new Promise (async(resolve)=>{navigator.mediaDevices.getUserMedia({audio: true, video: appSettings.webrtc.constraints.video}).then((stream)=>{resolve(stream)})}),
            remotestreams: {},
            isScreensharingOn: false,
            isCameraMuted: false,
            isMicMuted: false 
        
        }
        
        this.muteCamera = this.muteCamera.bind(this);
        this.muteMic = this.muteMic.bind(this);
        this.toggleScreensharing = this.toggleScreensharing.bind(this);
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
        this.streamWindow.srcObject = await this.state.localstream;
    }

    async muteCamera(){
        (await this.state.localstream).getVideoTracks().forEach((track)=>{
            track.enabled=!track.enabled;
            this.setState(state=>(state.isCameraMuted=!state.isCameraMuted));
            console.log(track);
        })
    }
    async muteMic(){
        (await this.state.localstream).getTracks().forEach((track)=>{
            if (track.kind==='audio'){
                track.enabled=!track.enabled;
                this.setState(state=>(state.isMicMuted=!state.isMicMuted));
            }
        })
    }

    async toggleScreensharing(){
        if (!this.state.isScreensharingOn){
        let screensharing = await navigator.mediaDevices.getDisplayMedia({video: appSettings.webrtc.constraints.video});
        let screenstream = screensharing.getVideoTracks()[0];
        Object.keys(RTCconnections).map((key)=>{
            RTCconnections[key].getSenders().map((sender)=>{
                if (sender.track.kind === screenstream.kind){
                    sender.replaceTrack(screenstream);
                    screenstream.addEventListener('ended',this.toggleScreensharing);
                    this.setState({isScreensharingOn:true})
                } 
            })
        })
        } else {
            let videoStream = (await this.state.localstream).getVideoTracks()[0];
            Object.keys(RTCconnections).map((key)=>{
                RTCconnections[key].getSenders().map((sender)=>{
                    if (sender.track.kind === videoStream.kind){
                        sender.replaceTrack(videoStream);
                        this.setState({isScreensharingOn:false})
                    } 
                })
            })
        }
    }

  async  componentDidMount(){
    this.signallingSocket = openSocket(appSettings.signalling.path,{transports:['websocket'],query:{token:this.props.token},forceNew:true});
    this.signallingSocket.on('join',async (msg)=>{this.initializeConnection(msg)});
    this.signallingSocket.on('offer', async (msg)=>{this.initializeConnection(msg)});
    this.signallingSocket.on('answer',async (msg)=>{this.handleAnswer(msg)});
    this.signallingSocket.on('icecandidate',async (msg)=>{this.handleIceCandidates(msg)})
    this.signallingSocket.on('leave', async (msg) => {this.removeDisconnectedUser(msg)});
    this.remoteVideo = document.getElementById('remoteVid');
    this.streamWindow =  document.getElementById('localvid');
        this.start();
    }

    async initializeConnection(msg){
        let re = this.signallingSocket.id;
        let to = msg.signallingSocket || msg.re;
        let name = msg.name;
        delete RTCconnections[to]
        let connection = new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics});
        connection['outputStream'] = false;
        await this.addTracksToRTC(connection);
        connection.addEventListener('icecandidate',(ev)=>{});
        connection.addEventListener('track',(track)=>{
            connection.outputStream = track.streams[0];
            this.setState((state=>( state.remotestreams[to]={stream:track.streams[0],name})));
            console.log(connection);
        });
        connection.addEventListener('iceconnectionstatechange',(e)=>{
            console.log('Ice connection state changed to '+e.target.iceConnectionState+" "+to);
            if (e.target.iceConnectionState===('disconnected'||'new')){
                e.target.close();
                if (!!RTCconnections[to]){
                    delete RTCconnections[to];
                }
                console.log(RTCconnections);
                let prevState = this.state.remotestreams;
                if (!!prevState[to]){
                    delete RTCconnections[to];
                };
                this.setState({remotestreams:prevState});
            }
        });
        connection.addEventListener('icegatheringstatechange',(e)=>{console.log('Ice gathering state changed to '+e.target.iceGatheringState)});
        connection.addEventListener('icecandidate',async (e)=>{
            await this.signallingSocket.emit(e.type,{re,to,payload:e.candidate});
        })

        let localDescription;
        if (!msg.payload){
            localDescription = await connection.createOffer();
        } else {
            await connection.setRemoteDescription(msg.payload);
            localDescription = await connection.createAnswer();

        }
        await connection.setLocalDescription(localDescription);
        console.log(localDescription.type);
        await this.signallingSocket.emit(localDescription.type,{re,to,payload:localDescription});

        RTCconnections[to] = connection;
        console.log(RTCconnections);
    }

    async handleAnswer(answer){
        let to = answer.re;
        try {await RTCconnections[to].setRemoteDescription(answer.payload)} catch (e) {console.log("error"+e)};
    }

    async handleIceCandidates(ice){
        if (ice.payload!=null){
        let to = ice.re;
        try {await RTCconnections[to].addIceCandidate(ice.payload)} catch (e){console.log(e); console.log(RTCconnections)};
        }
    }

    async addTracksToRTC(connection){
        let stream = await this.state.localstream;
            stream.getTracks().forEach((track)=>{connection.addTrack(track,stream)});
    }

    async removeDisconnectedUser(signallingSocketId){
        let to = signallingSocketId;
        delete RTCconnections[to];
        let prevState = this.state.remotestreams;
        delete prevState[to];
        this.setState({remotestreams:prevState});
        console.log('user with token $callid left'+to)
    }

    componentWillUnmount (){
        Object.keys(RTCconnections).map((to)=>{
            RTCconnections[to].close();
            return true;
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
                <Paper id="video_own_controls" className="MuiCard-root" justify="center">
                    <Button onClick={ this.muteCamera }> { this.state.isCameraMuted ? <VideocamOffIcon color="action"/>:  <VideocamIcon color="action"/> } </Button>
                    <Button onClick={ this.muteMic }> { this.state.isMicMuted ? <MicOffIcon color="action"/>:  <MicIcon color="action"/> } </Button>
                    <Button onClick={ this.toggleScreensharing }><ScreenShareIcon color="action"/></Button>
                </Paper>
        <Card key = { uuidv4+"x" } className="videoBox">
                <CardMedia
                    component="video"
                    autoPlay={ true }
                    muted={ true }
                    id="localvid"
                    width = { appSettings.webrtc.constraints.video.width*0.8 }
                    height = { appSettings.webrtc.constraints.video.height*0.8 }

                />
            <CardActions className="video_extras">
                <Typography className="video_title">{this.props.name} </Typography>

            </CardActions>
        </Card>
        { Object.keys(this.state.remotestreams).map((to)=>
            
        <RemoteVideoCard key = { to } to={ to } srcObject={ this.state.remotestreams[to] } />
        )}
        </Container>
    )}
};

export default VideoChat