"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var config_json_1 = require("../config.json");
var Events_1 = __importDefault(require("../Utils/Events"));
var RestManager_1 = __importDefault(require("../Manager/RestManager"));
require("../Utils/Color");
var package_json_1 = __importDefault(require("../config.json"));
var Node = /** @class */ (function () {
    function Node(blue, node, options) {
        var _a, _b;
        this.blue = blue;
        this.node = node;
        this.sessionId = null;
        this.connected = false;
        this.options = options;
        this.info = {
            host: this.node.host,
            port: this.node.port,
            secure: !!this.node.secure,
            password: this.node.password
        };
        this.count = 0;
        this.stats = {
            frameStats: null,
            players: 0,
            playingPlayers: 0,
            uptime: 0,
            memory: {
                free: 0,
                used: 0,
                allocated: 0,
                reservable: 0
            },
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0
            }
        };
        this.playerUpdate = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.playerUpdateInterval) || 50;
        this.rest = new RestManager_1.default(this.blue);
        this.resumeKey = !!((_b = this.options) === null || _b === void 0 ? void 0 : _b.resumeKey) ? this.options.resumeKey : null;
        this.ws = null;
    }
    Node.prototype.connect = function () {
        var headers = {
            "Authorization": this.info.password,
            "Client-Name": config_json_1.client_name,
            "User-Id": this.blue.client.user.id,
            "User-Agent": "".concat(config_json_1.client_name, ":").concat(package_json_1.default.version, " (").concat(package_json_1.default.repository.url, ")")
        };
        if (this.resumeKey)
            headers["Session-Id"] = this.resumeKey;
        this.ws = new ws_1.default("w".concat(this.info.secure ? "ss" : "s", "://").concat(this.info.host, ":").concat(this.info.port, "/").concat(this.blue.version, "/websocket"), { headers: headers });
        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("CONNECTING...").Yellow(), "]"));
        this.ws.on(Events_1.default.wsConnect, this.open.bind(this));
        this.ws.on(Events_1.default.wsDisconnect, this.close.bind(this));
        this.ws.on(Events_1.default.wsDebug, this.message.bind(this));
        this.ws.on(Events_1.default.wsError, this.error.bind(this));
    };
    Node.prototype.disconnect = function () {
        if (this.ws) {
            return this.ws.close();
        }
        return this;
    };
    Node.prototype.isConnected = function () {
        return this.connected;
    };
    Node.prototype.open = function () {
        this.connected = true;
        this.blue.nodes.set(this.info.host, this);
        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("WEBSOCKET GATEWAY").Yellow(), "] --> [").concat(String("STATUS: OK, CODE: 200").Green(), "]"));
        this.blue.emit(Events_1.default.nodeConnect, this, "".concat(config_json_1.client_name, " ").concat(this.info.host, " :: node successfully connected!"));
    };
    Node.prototype.close = function () {
        var _this = this;
        this.connected = false;
        this.blue.emit(Events_1.default.nodeDisconnect, this, "".concat(config_json_1.client_name, " ").concat(this.info.host, " :: node disconnected!"));
        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("CLOSING ERROR_CODE: 404 | 405").Red(), "]"));
        this.count++;
        if (this.count > 10) {
            this.blue.emit(Events_1.default.nodeDisconnect, this, "".concat(config_json_1.client_name, " error :: After Several tries I couldn't connect to the lavalink!"));
            this.count = 0;
            return this.ws.close();
        }
        var timeout = setTimeout(function () {
            if (_this.blue.nodes.get(_this.info.host))
                _this.connect();
            clearTimeout(timeout);
        }, 5000);
    };
    Node.prototype.message = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, _a, player;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        packet = JSON.parse(payload);
                        if (!(packet === null || packet === void 0 ? void 0 : packet.op))
                            return [2 /*return*/];
                        _a = packet.op;
                        switch (_a) {
                            case "stats": return [3 /*break*/, 1];
                            case "event": return [3 /*break*/, 2];
                            case "ready": return [3 /*break*/, 3];
                            case "playerUpdate": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        this.stats = __assign({}, packet);
                        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("RECEIVED: SYSTEM PAYLOAD").Green(), "] ---> ").concat(String("".concat(JSON.stringify(this.stats))).Yellow()));
                        return [3 /*break*/, 8];
                    case 2:
                        this.blue.handleEvents(packet);
                        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("RECEIVED: EVENT PAYLOAD").Green(), "] ---> ").concat(String("".concat(JSON.stringify(packet))).Yellow()));
                        return [3 /*break*/, 8];
                    case 3:
                        this.sessionId = packet.sessionId;
                        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("RECEIVED: READY PAYLOAD").Green(), "] ---> ").concat(String("".concat(JSON.stringify(packet))).Yellow()));
                        this.rest.setSession(this.sessionId || "none");
                        if (!this.resumeKey) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.rest.patch("/v4/sessions/".concat(this.sessionId), { resuming: !!this.resumeKey || false, timeout: this.playerUpdate })];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        player = this.blue.players.get(packet === null || packet === void 0 ? void 0 : packet.guildId);
                        if (player) {
                            this.blue.emit(Events_1.default.playerUpdate, player, (_c = (_b = player === null || player === void 0 ? void 0 : player.queue) === null || _b === void 0 ? void 0 : _b.current) === null || _c === void 0 ? void 0 : _c.info);
                            player.position = packet.state.position || 0;
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        this.blue.emit(Events_1.default.nodeError, this, new Error("Unexpected op \"".concat(payload.op, "\" with data: ").concat(payload)));
                        return [2 /*return*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.error = function (err) {
        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.info.host, " ---> [").concat(String("WEBSOCKET ERROR").Red(), "]"));
        this.blue.emit(Events_1.default.nodeError, err, new Error("Unable to connect to lavalink!"));
    };
    return Node;
}());
exports.default = Node;
