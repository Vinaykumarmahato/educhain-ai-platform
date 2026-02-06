
const apiKey = "AIzaSyDsU8-3bIuLu7DHqj4FkIcUlmQvRC48R4E";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", data);
        }
    })
    .catch(err => console.error(err));
