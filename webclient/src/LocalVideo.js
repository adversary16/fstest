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


class RTCConnection extends RTCPeerConnection{
    constructor(){

    }
    
}

class LocalVideo extends Component{
    constructor(props){
        super(props);
        this.state={
            classes: this.useStyles(),
            RTCconnections: new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics}),
            localstream: new Promise (async(resolve)=>{navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream)=>{resolve(stream)})})
        }
        this.signallingSocket = this.props.signallingSocket;
        this.state.RTCconnections.candidatePool = [];
        (async()=>{return await this.state.localstream})().then((stream)=>{
            stream.getTracks().forEach((track)=>{this.state.RTCconnections.addTrack(track,stream)});
        });
    }

  async  componentDidMount(){
        this.signallingSocket.on('answer', async (msg)=>{
            console.log(this.state.RTCconnections);
            await this.state.RTCconnections.setRemoteDescription(msg);
            this.state.RTCconnections.candidatePool.map((candidate)=>{
                this.signallingSocket.emit('icecandidate',candidate);
            })
            this.signallingSocket.emit('receiving');
            // try {await this.state.RTCconnections.setRemoteDescription(msg);
            // } catch (e) {
            //     console.log(e);
            // };
              
        })


        this.signallingSocket.on('offer',async (offer)=>{
            console.log("i am passive");
            try { acceptIncomingCall(offer,this.state.RTCconnections).then((connection)=>{
                              connection.createAnswer().then((answer)=>{
                                  this.signallingSocket.emit(answer.type,answer);
                              })
                              connection.addEventListener('icestatechange', async (event) => {
                                  console.log("ice changed");
                              });
  
              })} catch (e){
                  console.log(e);
              }
      });

        this.state.RTCconnections.addEventListener('icecandidate', async (event) => {
        if(event.candidate!=null){this.state.RTCconnections.candidatePool = [event.candidate, ...this.state.RTCconnections.candidatePool]}
            // console.log(event);
        // this.signallingSocket.emit(event.type,event.candidate);
        });  


        this.state.RTCconnections.addEventListener('track', async (e) => {
            if (document.getElementById('remoteVid').srcObject !== e.streams[0]) {
                document.getElementById('remoteVid').srcObject = e.streams[0];
                console.log(e);
            }
        });



        this.signallingSocket.on('join',async()=>{
            console.log('signal received');
            call(this.signallingSocket, this.state.RTCconnections).then(async (connection)=>{
                // this.setState(state=>{state.RTCconnections = connection});   
                console.log(this.state.RTCconnections);
         
            });
        });

        this.signallingSocket.on('icecandidate',async (msg)=>{
            if (msg!=null){
                console.log(msg);
            try {await this.state.RTCconnections.addIceCandidate(msg);
                } catch (e) {
                console.log(e);
            }
            console.log(this.state.RTCconnections)
            }
            
        })
        this.signallingSocket.on('receiving',async ()=>{
            this.state.RTCconnections.candidatePool.map((candidate)=>{
                this.signallingSocket.emit('icecandidate',candidate);
            })

        })


        start();
    }

    useStyles(){
        return makeStyles({
            localVideo: {
                width: 512,
                height: 320
            }
        })
    }

    render(){
        return(
        <Container>
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