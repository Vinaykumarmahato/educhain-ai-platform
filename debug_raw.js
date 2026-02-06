
const apiKey = "AIzaSyDsU8-3bIuLu7DHqj4FkIcUlmQvRC48R4E";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Querying: ${url}`);

fetch(url)
    .then(res => {
        console.log(`Status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        console.log("Response Body:", JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error("Fetch Error:", err);
    });
