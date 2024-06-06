const express = require("express");
const path = require("path");
const os = require("os");
const app = express();

function getNetworkIP() {
    const networkInterfaces = os.networkInterfaces();
    for(const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            //Skip over non-IPV$ and internal
            if(net.family === 'IPv4' && !net.internal)
                return net.address;
        }
    }
    return null;
}

//Start server on your network IP address and desire port
const port = 3000;
const networkIP = getNetworkIP();

//serve static files from the 'RandomJokes' directory
app.use(express.static(path.join(__dirname, "public")));

//Define route for url
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname, "public"));
});

app.listen(port, getNetworkIP, () => {
    console.log(`Server is running at http://${networkIP}:${port}`);
});