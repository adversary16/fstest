import { List, ListItem } from '@material-ui/core'
import React from 'react'

export default ({ name,token }) =>
<ListItem key={token}>
    {name}
</ListItem>