const express = require("express");
const path = require("path");
const os = require("os");
const app = express();

function getNetworkIP() {
    const networkInterfaces = os.networkInterfaces();
    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }
    return null;
}

// Joke collection for the new API
const jokes = [
    { type: "single", joke: "Why don't scientists trust atoms? Because they make up everything!" },
    { type: "twopart", setup: "Why did the chicken join a band?", delivery: "Because it had the drumsticks!" },
    { type: "single", joke: "Parallel lines have so much in common. It’s a shame they’ll never meet." }
];

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

// New route for random jokes
app.get("/api/joke", (req, res) => {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    res.json(jokes[randomIndex]);
});

const port = 3000;
const networkIP = getNetworkIP();

// Define route for home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(port, () => {
    console.log(`Server is running at http://${networkIP}:${port}`);
});
