import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, useParams } from 'react-router-dom';
import './App.css'
import Logon from './Logon';
import GenerateValidator from './utils/GenerateValidator';

import uuidv4 from './utils/uuid';


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route key={ uuidv4 } exact path="/" children= { <Logon/> }  />
          <Route key={ uuidv4 } path="/:chatId" children= { <GenerateValidator/> }  />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
