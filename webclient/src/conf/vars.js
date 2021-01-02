const appSettings = {
    signalling:{
      path:"/signalling",
      room: (()=>{
        let x = new URLSearchParams(window.location.search);
        return (x.get('room'))
      })(),
      marker:"rtc",
      transports: ['websocket']
    },
    socketBasePath:"/socket.io",
    webrtc:{
      sdpSemantics:"unified-plan"
    }
  }

export default appSettings