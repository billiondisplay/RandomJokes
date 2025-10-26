const os = require('os');

/**
 * Retrieves the local network IP address of the machine
 * @returns {string|null} The IPv4 address or null if not found
 */
function getNetworkIP() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      // Skip internal (localhost) addresses and non-IPv4
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return null;
}

module.exports = getNetworkIP;
