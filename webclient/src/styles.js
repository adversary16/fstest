import React, { Component } from 'react'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    List: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'reverse'
    },
}));

export default useStyles