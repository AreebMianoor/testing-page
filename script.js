const logo = document.getElementById('logo');
const textInput = document.getElementById('textInput');
const sendButton = document.getElementById('sendButton');
const responseDiv = document.getElementById('response');

// Connect to the WebSocket server
const ws = new WebSocket('wss://agile-cliffs-93806.herokuapp.com');

// Handle messages from the server
ws.onmessage = function(event) {
    const message = event.data;
    responseDiv.innerText = message;
};

// Handle text message sending
sendButton.addEventListener('click', () => {
    const message = textInput.value;
    ws.send(message);
    textInput.value = '';
});

let mediaRecorder;
let audioChunks = [];

// Get user media for audio recording
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
            if (mediaRecorder.state === 'inactive') {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = function() {
                    const audioBase64 = reader.result.split(',')[1];
                    ws.send(`audio:${audioBase64}`);
                };
                reader.readAsDataURL(audioBlob);
                audioChunks = []; // Clear the chunks for the next recording
            }
        };
    });

// Handle logo click for audio recording
logo.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 30000); // Record for 30 seconds
    }
});
