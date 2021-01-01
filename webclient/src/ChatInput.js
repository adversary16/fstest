import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from '@material-ui/core'

class ChatInput extends Component {
  static propTypes = {
    onSubmitMessage: PropTypes.func.isRequired,
  }
  state = {
    message: '',
  }

  render() {
    return (
      <form
        action="."
        onSubmit={e => {
          e.preventDefault()
          this.props.onSubmitMessage(this.state.message)
          this.setState({ message: '' })
        }}
      >
        <TextField variant="outlined"
          type="text"
          placeholder={'Enter message...'}
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
        />
        <Button variant="contained" type="submit"> SEND </Button>
      </form>
    )
  }
}

export default ChatInput