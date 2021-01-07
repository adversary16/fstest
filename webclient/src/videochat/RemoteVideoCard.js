import { Card, CardActions, CardMedia, Typography } from "@material-ui/core";
import { Component } from "react";
import appSettings from "../conf/vars";

class RemoteVideoCard extends Component{
    componentDidMount(){
        let remotevid = document.getElementById(this.props.to);
        remotevid.srcObject = this.props.srcObject.stream;
    }

    render(){
        return(
        <Card key = { this.props.to } className="videoBox">
                <CardMedia
                    component="video"
                    autoPlay= { true }
                    width = { appSettings.webrtc.constraints.video.width*0.8 }
                    height = { appSettings.webrtc.constraints.video.height*0.8 }
                    id={ this.props.to }
                />
            <CardActions className="video_extras">
            <Typography className="video_title" >{ this.props.srcObject.name } </Typography> 
            </CardActions>
        </Card>
        )}

}

export default RemoteVideoCard