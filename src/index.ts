import axios from "axios";
import App from "./app";
const appInstance = new App();

appInstance.startServers(8082);
