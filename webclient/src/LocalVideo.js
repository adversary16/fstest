import { Button, Card, CardActionArea, CardActions, CardMedia, Container, makeStyles } from "@material-ui/core";
import { localeData } from "moment";
import { Component } from "react";
import appSettings from "./conf/vars";




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
    localstream.getTracks().forEach((track)=>{remoteConnection.addTrack(track,localstream)});
        await remoteConnection.createOffer().then((offer)=>{
            remoteConnection.setLocalDescription(offer);
            socket.emit(offer.type,offer);
            console.log(offer);
            })
};


class LocalVideo extends Component{
    state={
        classes: this.useStyles(),
        signallingSocket: this.props.signallingSocket
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
                    autoPlay="true"
                    muted="true"
                    id="localvid"
                    className={this.useStyles().localVideo}
                />
            <CardActions>
                <Button onClick={start}>START</Button>
                <Button onClick={stop}>STOP</Button>
            </CardActions>
        </Card>
        <Card>
                <CardMedia
                    component="video"
                    autoPlay="true"
                    muted="true"
                    id="remoteVid"
                    className={this.useStyles().localVideo}
                />
            <CardActions>
                <Button onClick={()=>call(this.state.signallingSocket)}>CALL</Button>
            </CardActions>
        </Card>
        </Container>
    )}
};

export default LocalVideo