
const LOCAL_HOST = "http://localhost:4040"
const IP_HOST = "http://192.168.100.162:4040";

function IP_ADDRESS_GET(sel) {
    if (sel === "LOCAL") {
        return LOCAL_HOST;
    } else if (sel === "PUBLIC") {
        return IP_HOST;
    }
}

const IP_ADDRESS = IP_ADDRESS_GET("PUBLIC")


export default IP_ADDRESS;