const socket=io()

//Elements
const $messageform=document.querySelector('#message-form');
const $messageforminput=$messageform.querySelector('input');
const $messageformbutton=$messageform.querySelector('button');
const $sendlocationbutton=document.querySelector('#send-location')
const $message=document.querySelector('#messages')

//Templates
const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locationmessageTemlate=document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // Height of messages container 
    const containerHeight = $message.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
}
socket.on('connectionMade',(message)=>{
    console.log(message);
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
    const html=Mustache.render($sidebarTemplate,{
    room,users
    })
    document.querySelector('#sidebar').innerHTML=html
})

socket.on('locationMessage',(url)=>{
    console.log(url);
    const html=Mustache.render($locationmessageTemlate,{
       username:url.username,
       url: url.url_link,
       createdAt:moment(url.createdAt).format('hh:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

 $messageform.addEventListener('submit',(e)=>{
     e.preventDefault();
     $messageformbutton.setAttribute('disabled','disabled')
     const message=e.target.elements.message
      socket.emit('sendMessage',message.value,(error)=>{
          $messageformbutton.removeAttribute('disabled');
          $messageforminput.value=''
          $messageforminput.focus();
          if(error)
          {
              return console.log(error);
          }
          console.log("Message delivered");
      });
 })

 $sendlocationbutton.addEventListener('click',()=>{
     if(!navigator.geolocation)
     {
         return alert('Sorry geolocation is not supported');
     }
     $sendlocationbutton.setAttribute('disabled','disabled')
     navigator.geolocation.getCurrentPosition((position)=>{
         console.log(position);
         
         socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendlocationbutton.removeAttribute('disabled');
            console.log("Location Shared");
        });
     })

 })

 socket.emit('join',{username,room},(error)=>{
     if(error)
     {
         alert(error)
         location.href='/'
     }
 })