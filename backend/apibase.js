
const LOCAL_HOST = "localhost"
const IP_HOST = "192.168.100.162";

function IP_ADDRESS_GET(sel) {
    if (sel === "LOCAL") {
        return LOCAL_HOST;
    } else if (sel === "PUBLIC") {
        return IP_HOST;
    }
}

const IP_ADDRESS = IP_ADDRESS_GET("PUBLIC")


module.exports = IP_ADDRESS;