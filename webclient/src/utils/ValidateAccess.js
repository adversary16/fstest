
import { Component } from "react";
import appSettings from "../conf/vars";
import CheckCookies from "./checkCookies";
import GetChatWithId from "./GetChatWithId";
import GetLogonScreenWithId from "./GetLogonScreenWithId";
import removeNonAlphanumeric from "./removeNonAlphanumeric";

class ValidateAccess extends Component {
  constructor (props) {
    super(props);
    this.state = {isAuthorized:null,itemToRender:null}
  }

  async componentDidMount(){
    const isAuthorized = await CheckCookies(this.props.location);
    const itemToRender = (isAuthorized) ? GetChatWithId(this.props.location) : GetLogonScreenWithId(this.props.location);
    this.setState({isAuthorized,itemToRender});
    console.log(this.props.location);
  }

  render(){
    return this.state.itemToRender
  }
}

export default ValidateAccess