import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from '@material-ui/core'
import CAPTIONS from '../captions'

class ChatInput extends Component {
  static propTypes = {
    onSubmitMessage: PropTypes.func.isRequired,
  }
  state = {
    message: '',
  }

  render() {
    return (
      <form id="input_form"
        action="."
        onSubmit={e => {
          e.preventDefault()
          this.props.onSubmitMessage(this.state.message)
          this.setState({ message: '' })
        }}
      >
        <TextField className="input_text" variant="outlined"
          type="text"
          placeholder={'Enter message...'}
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
        />
        <Button className="input_submit" variant="contained" type="submit"> { CAPTIONS.CHAT.SUBMIT_BUTTON } </Button>
      </form>
    )
  }
}

export default ChatInput