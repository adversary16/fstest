import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, useParams } from 'react-router-dom';
import './App.css'
import Chat from './Chat'
import Logon from './Logon';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function GetChatWithId(){
  let userId  = cookies.get('token').user;
  console.log(userId);
    let { chatId }  = useParams();
    return <Chat chatId={chatId} userId={userId}/>;
}

function ReturnLogonWitId(){
  let { chatId }  = useParams();
  return <Logon chatId={chatId}/>;
}


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
