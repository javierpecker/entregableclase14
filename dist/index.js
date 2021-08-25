"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const rutas_js_1 = __importDefault(require("./routes/rutas.js"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const app = express_1.default();
const puerto = 8080;
const server = new http.Server(app);
server.listen(puerto, () => console.log('Server up en puerto', puerto));
server.on('error', (err) => {
    console.log('ERROR ATAJADO', err);
});
const layoutFolderPath = path_1.default.resolve(__dirname, '../views/layouts');
const defaultLayerPath = path_1.default.resolve(__dirname, '../views/layouts/index.hbs');
const partialFolderPath = path_1.default.resolve(__dirname, '../views/partial');
app.set('view engine', 'hbs');
app.engine('hbs', express_handlebars_1.default({
    layoutsDir: layoutFolderPath,
    partialsDir: partialFolderPath,
    defaultLayout: defaultLayerPath,
    extname: 'hbs',
}));
const publicPath = path_1.default.resolve(__dirname, '../public');
app.use(express_1.default.static(publicPath));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', rutas_js_1.default);
const readfile = () => {
    let filenames = fs_1.default.readdirSync("./persistentdata");
    const found = filenames.find((element) => "messages.txt" === element);
    if (found === "messages.txt") {
        const data = fs_1.default.readFileSync("./persistentdata/messages.txt", "utf-8");
        return data;
    }
    else {
        console.log("Archivo no leido");
    }
};
const guardarMessages = (messages) => {
    fs_1.default.writeFileSync("./persistentdata/messages.txt", JSON.stringify(messages, undefined, 2), "utf-8");
};
const guardarNewMessage = (data) => {
    let messages = JSON.parse(readfile());
    let now = new Date();
    let date = moment_1.default(now).format("DD/MM/YYYY HH:MM:SS");
    const newMessage = { email: data.email, fecha: date, mensaje: data.mensaje };
    messages.push(newMessage);
    guardarMessages(messages);
};
const productos = [];
const myWSServer = new socket_io_1.Server(server);
myWSServer.on('connection', (socket) => {
    console.log('\n\nUn cliente se ha conectado');
    console.log(`ID DEL SOCKET DEL CLIENTE => ${socket.client.id}`);
    //console.log(`ID DEL SOCKET DEL SERVER => ${socket.id}`);
    socket.on('new-message', (data) => {
        productos.push(data);
        socket.emit('messages', productos);
    });
    socket.on('askData', (data) => {
        const chatfile = readfile();
        socket.emit('messages', productos);
        socket.emit('message', chatfile);
    });
    socket.on("chatMessage", (chat) => {
        guardarNewMessage(chat);
        const chatfile = readfile();
        socket.emit("message", chatfile);
        socket.broadcast.emit("message", chatfile);
    });
});
