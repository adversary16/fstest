import { Card, CardActions, CardMedia } from "@material-ui/core";
import { Component } from "react";

class RemoteVideoCard extends Component{
    constructor(props){
        super(props)
    }
    componentDidMount(){
        let remotevid = document.getElementById(this.props.to);
        remotevid.srcObject = this.props.srcObject.stream;
    }

    render(){
        return(
        <Card key = { this.props.to }>
                <CardMedia
                    component="video"
                    autoPlay= { true }

                    id={ this.props.to }
                    // ref = { remotevid=> {this.videoref = remotevid; this.videoref.srcObject = this.state.remotestreams[to]}}
                    // className={this.useStyles().localVideo}
                />
            <CardActions>
                { this.props.srcObject.name }
            </CardActions>
        </Card>
        )}

}

export default RemoteVideoCard