const appSettings = {
    signalling:{
      path:':3081/signalling',
      room: (()=>{
        let x = new URLSearchParams(window.location.search);
        return (x.get('room'))
      })(),
      marker:"rtc",
      transports: ['websocket']
    },
    chat:{
      path:':3081/chat',
      room: (()=>{
        let x = new URLSearchParams(window.location.search);
        return (x.get('room'))
      })(),
      marker:"chat",
      transports: ['websocket']
    },
    socketBasePath:"/socket.io",
    webrtc:{
      sdpSemantics:"unified-plan",
      constraints:{
        audio: true,
        video:{
          "width":240,
          "height":160
        }
      }
    },
    navigation:{
      minRoomNameLength: 3,
      minUserNameLength: 4,
      logonPageDefaultPath: "login",
    },
    api:{
      basePath: "/api",
      auth: "/auth",
      validation: "/validate",
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      cookieLabel: 'fstest'
    }
  }

export default appSettings