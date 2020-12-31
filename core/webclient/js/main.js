// const Emitter = require("component-emitter");
settings = {
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
console.log(settings.signalling.room);
class SocketInterface extends io{
}

class Signalling extends SocketInterface{
  room = (() => { return settings.signalling.marker+settings.signalling.room }) ();
  signal = (data) => { this.emit("rtc",data); console.log(this)};
}

class Chat extends SocketInterface{
}

class VideoChat{
    connections = [];
}

class WebClient extends EventTarget{
    constructor(){
        super();
    }
    emit = (event,{data}) => {
        let customEvent = new CustomEvent(event,{data});
        this.dispatchEvent(customEvent)
    }
    on = (event,callback) => {
        this.addEventListener(event,callback);
    }
}
class WebRTCConnection extends RTCPeerConnection {
  constructor(){
    super();
  }
  signalling = new Signalling("/signalling",{path:settings.socketBasePath+settings.signalling.path,   transports:settings.signalling.transports, forceNew:true, query:"room"});
  signal = (e) => {this.signalling.signal(e)};
  oniceconnection = (e) => {console.log(e)};
  onicecandidate = async (e) => {this.addIceCandidate(e); console.log(e)}
  onIceConnectionStateChange = async (e) => {console.log("asdasd")};
  onnegotiationneeded = (e) => {console.log(e)};
  onaddstream = (e) => {console.log(e)};
}




const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  let startTime;
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');

  


class videoClient{
    constructor (){
        this.localstream = null;
        this.connections = [];
        this.chatSocket = new Chat("/chat",{path:"/socket.io/chat",transports:['websocket'],query:{"room":"asdasd","token":"token"}});
    }
    start = async () => {
      console.log('Requesting local stream');
      this.localConnection = new WebRTCConnection({sdpSemantics:settings.webrtc.sdpSemantics});
      this.remoteConnection = new WebRTCConnection({sdpSemantics:settings.webrtc.sdpSemantics});
      console.log(this.localConnection);
      startButton.disabled = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        localVideo.srcObject = stream;
        this.localStream = stream;
        startButton.disabled = false;
      } catch (e) {
        alert(`getUserMedia() error: ${e.body}`);
      }
    }
    connect = async () =>{
        console.log("started");
           remoteVideo.addEventListener('loadedmetadata', function() {
            console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`)
        });  


          remoteVideo.addEventListener('resize', () => {
            console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
            // We'll use the first onsize callback as an indication that video has started
            // playing out.
            if (startTime) {
              const elapsedTime = window.performance.now() - startTime;
              console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
              startTime = null;
            }
          });
        this.remoteConnection.addEventListener('icecandidate',async (event)=>{
            await this.localConnection.addIceCandidate(event.candidate);
         });

        this.remoteConnection.addEventListener('track',async(track)=>{
            console.log(event);
            if (remoteVideo.srcObject !== event.streams[0]) {
                remoteVideo.srcObject = event.streams[0];
                console.log('pc2 received remote stream');
              }
        });
        this.remoteConnection.addEventListener("iceconnectionstatechange",async(source) => {
        });

        this.localStream.getTracks().forEach(async (track) => {this.localConnection.addTrack(track, this.localStream)});
        (async ()=>{await this.localConnection.createOffer(offerOptions)
            .then(async (description)=>{
                this.localConnection.signal(description);
                await this.localConnection.setLocalDescription(description);
                await this.remoteConnection.setRemoteDescription(description).then(async ()=>{
                    await this.remoteConnection.createAnswer().then( async (answer) => {
                       await this.localConnection.setRemoteDescription(answer);
                       await this.remoteConnection.setLocalDescription(answer);
                    })
                });
            })
        })();
    

    }
    stop = () => {
      this.localConnection.close();
      this.remoteConnection.close();
      this.remoteConnection = null;
      this.localConnection = null;
    }
}

const client = new videoClient();
// const chatSocket = new Chat("/chat",{path:"/chat",transports:['websocket']});

const startButton = document.getElementById('showVideo');
startButton.addEventListener('click', client.start);
// document.querySelector('#showVideo').addEventListener('click', async ()=>{await client.localVideo.on()});
// document.querySelector('#hideVideo').addEventListener('click', async ()=>{await client.localVideo.off()});
document.querySelector('#hideVideo').addEventListener('click', client.connect);
document.querySelector('#toggleCall').addEventListener('click', client.stop);

$("#chatform").submit((e)=>{
  e.preventDefault();
  console.log(e);
  let message = {
    sender: client.chatSocket.id,
    value: document.querySelector("#m").value
  }
  client.chatSocket.emit('chat message',message);
  document.querySelector("#m").value = '';
  return false;
 });
document.querySelector("#container").addEventListener('RTCevent',(e)=>{console.log(e)});
 client.chatSocket.on('chat message', function(msg){
$('#messages').prepend($('<li class="'+ ((msg.sender==client.chatSocket.id)?"own":"") +'">').text(new Date(msg.timestamp).toLocaleTimeString()+" "+msg.value));
});
client.chatSocket.on('rtc', function(msg){
$('#messages').append($('<li>').text(msg.value));
});
client.chatSocket.on("join", function(msg){
 $("#members").append('<li id="'+msg.value+'" class="member">'+(msg.value)+'</li>');
  console.log("user joined");
});
client.chatSocket.on("welcome",function(msg){
  console.log($(".member"));
  for (let member in msg.members){
    console.log(msg.members[member]);
    let memberId = msg.members[member].name;
    $("#members").prepend('<li id="'+memberId+'" class="member">'+memberId+'</li>');
  };
  console.log(msg.chats);
  msg.chats.reverse();
  for (let message in msg.chats){
    let messageId = msg.chats[message];
    $('#messages').append($('<li class="'+ ((messageId.sender==client.chatSocket.id)?"own":"") +'">').text(new Date(messageId.timestamp).toLocaleTimeString()+" "+messageId.value));
   }
})
client.chatSocket.on("leave",function(msg){
document.getElementById(msg.value).remove();
});