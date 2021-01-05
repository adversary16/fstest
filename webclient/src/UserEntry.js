import { ListItem, Typography } from '@material-ui/core'
import React from 'react'

export default ({ name, token, isMe }) => (
<ListItem key={token}>
    {name} <Typography visible={ isMe }>{ (isMe)?" (Me) ":'' }</Typography>
</ListItem>
)