import { Card, CardActions, CardMedia } from "@material-ui/core";
import { Component } from "react";

class RemoteVideoCard extends Component{
    constructor(props){
        super(props)
    }
    componentDidMount(){
        let remotevid = document.getElementById(this.props.cid);
        remotevid.srcObject = this.props.srcObject.stream;
    }

    render(){
        return(
        <Card key = { this.props.cid }>
                <CardMedia
                    component="video"
                    autoPlay= { true }

                    id={ this.props.cid }
                    // ref = { remotevid=> {this.videoref = remotevid; this.videoref.srcObject = this.state.remotestreams[cid]}}
                    // className={this.useStyles().localVideo}
                />
            <CardActions>
                { this.props.srcObject.name }
            </CardActions>
        </Card>
        )}

}

export default RemoteVideoCard