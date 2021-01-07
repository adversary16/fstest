function validateInput (event){
    var char = String.fromCharCode(event.which);
if (!char.match(/[A-Za-z0-9+#.-]/)) {event.preventDefault()};
}

export default validateInput;