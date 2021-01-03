import { Button, Card, CardActionArea, CardActions, CardMedia, Container, makeStyles } from "@material-ui/core";
import { localeData } from "moment";
import { Component } from "react";
import appSettings from "./conf/vars";
import uuidv4 from "./utils/uuid";




let localstream= false ;

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

async function call(socket){
    await start();
    let remoteConnection = new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics});
    localstream.addEventListener('icecandidate', async (event) => {
        console.log("ice exchange");
    });
    localstream.getTracks().forEach((track)=>{remoteConnection.addTrack(track,localstream)});
        await remoteConnection.createOffer().then((offer)=>{
            remoteConnection.setLocalDescription(offer);
            socket.emit(offer.type,offer);
            // socket.on('offer',async (msg)=>{
            //     let offer = new RTCSessionDescription(msg); 
            //     await remoteConnection.setRemoteDescription(offer).then(async ()=>{
            //         await remoteConnection.createAnswer().then((answer)=>{
            //             socket.emit(answer.type,answer);
            //         })
            //     });

            // });
                socket.on('answer',async (answer)=>{
                    await remoteConnection.setRemoteDescription(answer).then(async()=>{
                        console.log('12123');
                    })
                });
            })
};


async function acceptIncomingCall(offer){
    let remoteConnection = new RTCPeerConnection({sdpSemantics:appSettings.webrtc.sdpSemantics});
    localstream.getTracks().forEach((track)=>{remoteConnection.addTrack(track,localstream)});
    await remoteConnection.createOffer().then(async (description)=>{
        await remoteConnection.setLocalDescription(description).then(async ()=>{
            remoteConnection.setRemoteDescription(offer).then(()=>{
                remoteConnection.createAnswer().then((answer)=>{
                    console.log(answer);
                })
            });
        });
    })
}

class LocalVideo extends Component{
    constructor(props){
        super(props);
        this.state={
            classes: this.useStyles()
        }
        this.signallingSocket = this.props.signallingSocket;
        this.signallingSocket.on('offer',async (offer)=>{
            acceptIncomingCall(offer);
        });
    }


    componentDidMount(){
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
                <Button onClick={ start }>START</Button>
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
                <Button onClick={()=>call(this.signallingSocket)}>CALL</Button>
            </CardActions>
        </Card>
        </Container>
    )}
};

export default LocalVideo