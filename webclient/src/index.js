import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, useParams } from 'react-router-dom';
import './App.css'
import Chat from './Chat'
import Logon from './Logon';
import Cookies from 'universal-cookie';

function GetChatWithId(){
    let { chatId }  = useParams();
    return <Chat chatId={chatId}/>;
}

function ReturnLogonWitId(){
  let { chatId }  = useParams();
  return <Logon chatId={chatId}/>;
}


const cookies = new Cookies();

function verifyCookie(){
  return (!!cookies.get('token'));
}

function ValidateAccess(){
  if (verifyCookie()){
    return GetChatWithId()
  }
  else{
    return ReturnLogonWitId();
  }
}
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/:chatId" children= { <ValidateAccess/> }  />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
