document.addEventListener('DOMContentLoaded', function() {

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];

    async function sendFoodData() {
        const userInput = document.getElementById('userInput').value;
        const response = await fetch('http://localhost:5000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_input: userInput })
        });

        const data = await response.json();
        document.getElementById('response').innerText = data;
    }

    function convertBlobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                let base64data = reader.result;
                base64data = base64data.split(',')[1]; // Remove the content type part
                resolve(base64data);
            };
            reader.onerror = error => reject(error);
        });
    }

    async function requestMicrophoneAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
            };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { 'type' : 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                // Save the audio file or do something else with it
                audioChunks = [];

                const audioData = new FormData();
                audioData.append('file', audioBlob);

                // Show 'Recording Saved' message
                
                try {
                    // Convert the audio file to base64 or the format required by the API
                    const audioBase64 = await convertBlobToBase64(audioBlob);
            
                    // Prepare the request payload
                    const payload = {
                        config: {
                            encoding: 'LINEAR16', // Change this depending on your audio format
                            sampleRateHertz: 16000, // Change this depending on your audio format
                            languageCode: 'en-US', // Set the language of the audio
                        },
                        audio: {
                            content: audioBase64
                        }
                    };
            
                    // Send the audio to Google Speech-to-Text API
                    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
            
                    const result = await response.json();
                    console.log(result);
            
                    // Handle the response here
                    
            
                } catch (err) {
                    console.error('Error sending audio to Google Speech-to-Text', err);
                }
            
                // Display the 'Recording Saved' message
                document.getElementById('recordingSavedMsg').style.display = 'block';
                document.getElementById('recordAgainBtn').style.display = 'block';
            };
            console.log('Microphone access granted');
        } catch (err) {
            console.error('Microphone access denied', err);
        }
    }

    document.getElementById('microphoneBtn').addEventListener('click', async function() {
        if (!mediaRecorder) {
            await requestMicrophoneAccess();
        }

        if (isRecording) {
            mediaRecorder.stop();
            this.style.animation = '';
        } else {
            mediaRecorder.start();
            this.style.animation = 'pulse 1s infinite';
            document.getElementById('recordAgainBtn').style.display = 'none';
            document.getElementById('recordingSavedMsg').style.display = 'none';
        }
        isRecording = !isRecording;
    });

    document.getElementById('recordAgainBtn').addEventListener('click', function() {
        document.getElementById('microphoneBtn').click(); // Simulate click on microphone button
    });

});


