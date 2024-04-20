"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_events_1 = require("node:events");
var config_json_1 = require("./config.json");
var voiceStateUpdate_1 = __importDefault(require("./Connectors/voiceStateUpdate"));
var Util_1 = __importDefault(require("./Utils/Util"));
var Types_1 = __importDefault(require("./Utils/Types"));
var Events_1 = __importDefault(require("./Utils/Events"));
var Node_1 = __importDefault(require("./Connectors/Node"));
var SearchManager_1 = __importDefault(require("./Manager/SearchManager"));
var Track_1 = __importDefault(require("./Structure/Track"));
var index_1 = __importDefault(require("./Libs/index"));
var Blue = /** @class */ (function (_super) {
    __extends(Blue, _super);
    function Blue(nodes, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, __assign({}, options)) || this;
        if (!nodes)
            throw new Error("You didn't provide a lavalink node");
        _this.nodes = new Map();
        _this._options = options;
        _this.options = options;
        _this._versions = ["v4"]; //soon many versions will be there.
        _this.version = _this._versions[0];
        _this.node = null;
        _this.load = new SearchManager_1.default(_this);
        _this._nodes = nodes;
        _this.util = new Util_1.default(_this);
        _this.client = null;
        _this.initiated = false;
        _this.voiceState = new voiceStateUpdate_1.default(_this);
        _this.players = new Map();
        return _this;
    }
    Object.defineProperty(Blue.prototype, "isInitiated", {
        get: function () {
            return this.initiated;
        },
        enumerable: false,
        configurable: true
    });
    Blue.prototype.init = function (client) {
        this.initiated = true;
        this.client = client;
        this.util.checkParamsValidity(__spreadArray([], this._nodes, true), __assign({}, this.options));
        this.Lib = new index_1.default(this.options.library, this).main();
        return this.node;
    };
    Blue.prototype.create = function (options) {
        if (options === void 0) { options = {}; }
        if (!this.isInitiated)
            throw new Error("Blue has not been initiated yet.");
        var check = this.util.checkObjectValidity(options);
        if (!check)
            return false;
        var node = this.nodes.get(this.options.host);
        if (!node)
            throw new TypeError("No nodes are avalible");
        var player = this.node.rest.createPlayer(options);
        player.connect();
        return player;
    };
    Blue.prototype.activeNodes = function () {
        var _this = this;
        return this._nodes.filter(function (n) { var _a; return (_a = _this.nodes.get(n.host)) === null || _a === void 0 ? void 0 : _a.connected; });
    };
    Blue.prototype.verify_version = function (ver) {
        return this._versions.find(function (v) { return v.toLowerCase() == ver.toLowerCase(); });
    };
    Blue.prototype.activateNode = function (node) {
        if (node === void 0) { node = {}; }
        this.options["host"] = node.host;
        this.options["password"] = node.password;
        this.options["port"] = node.port;
        this.options["secure"] = node.secure;
        this.node.info["host"] = node.host;
        this.node.info["password"] = node.password;
        this.node.info["port"] = node.port;
        this.node.info["secure"] = node.secure;
        this.node.node["host"] = node.host;
        this.node.node["password"] = node.password;
        this.node.node["port"] = node.port;
        this.node.node["secure"] = node.secure;
        this.node = new Node_1.default(this, node, this.node.options);
        this.node.connect();
        return this.node;
    };
    Blue.prototype.addNode = function (node) {
        if (!node.host || !node.password || !node.port)
            throw new Error("Provide valid node to add");
        return this.nodes.set(node.host, this.activateNode(node));
    };
    Blue.prototype.removeNode = function (node) {
        var _a, _b, _c, _d;
        if (!((_a = node.info) === null || _a === void 0 ? void 0 : _a.host) || !((_b = node.info) === null || _b === void 0 ? void 0 : _b.password) || !((_c = node.info) === null || _c === void 0 ? void 0 : _c.port))
            throw new Error("Provide valid node to remove");
        node.disconnect();
        return this.nodes.delete((_d = node.info) === null || _d === void 0 ? void 0 : _d.host);
    };
    Blue.prototype.updateNode = function (node) {
        var _this = this;
        if (node === void 0) { node = {}; }
        if (node)
            return this.addNode(node);
        var nodes = this._nodes.filter(function (n) { var _a, _b; return n.host !== ((_b = (_a = _this.node) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.host); });
        var get_active_nodes = nodes.filter(function (n) { var _a; return (_a = _this.nodes.get(n === null || n === void 0 ? void 0 : n.host)) === null || _a === void 0 ? void 0 : _a.connected; });
        if (get_active_nodes) {
            return this.activateNode(get_active_nodes);
        }
        throw new Error("There are no active nodes are available.");
    };
    Blue.prototype.handleEvents = function (payload) {
        var _a, _b;
        if (!payload.guildId)
            throw new Error("Unknown payload recieved.");
        var player = this.players.get(payload.guildId);
        if (!player || !((_a = player === null || player === void 0 ? void 0 : player.queue) === null || _a === void 0 ? void 0 : _a.current))
            return;
        var track = (_b = player.queue.current) === null || _b === void 0 ? void 0 : _b.info;
        if (!track)
            return;
        var type = payload === null || payload === void 0 ? void 0 : payload.type;
        if (!type) {
            var error = new Error("Unknown node event '".concat(type, "'."));
            this.emit("nodeError", this, error);
        }
        if (type === "TrackStartEvent") {
            player.event.TrackStartEvent(player, track, payload);
        }
        else if (type === "TrackEndEvent") {
            player.event.TrackEndEvent(player, track, payload);
        }
        else if (type === "TrackStuckEvent") {
            player.event.TrackStuckEvent(player, track, payload);
        }
        else if (type === "TrackExceptionEvent") {
            player.event.TrackExceptionEvent(player, track, payload);
        }
        else if (type === "WebSocketClosedEvent") {
            player.event.WebSocketClosedEvent(player, payload);
        }
        else {
            var error = new Error("".concat(config_json_1.client_name, " :: unknown node event '").concat(type, "'."));
            this.emit(Events_1.default.nodeError, this, error);
        }
    };
    Blue.prototype.search = function (param_1) {
        return __awaiter(this, arguments, void 0, function (param, requester) {
            var data_copy, data, i, track, i, track, track;
            var _a;
            if (requester === void 0) { requester = this.client.user; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isInitiated)
                            throw new Error("Blue has not been initiated yet.");
                        data_copy = {};
                        data_copy.tracks = [];
                        data_copy.requester = requester;
                        if (!((_a = this.nodes) === null || _a === void 0 ? void 0 : _a.has(this.options.host)))
                            throw new Error("No nodes are available.");
                        return [4 /*yield*/, this.load.fetch(param)];
                    case 1:
                        data = _b.sent();
                        if (data.loadType === Types_1.default.LOAD_ERROR || data.loadType === Types_1.default.LOAD_EMPTY) {
                            throw new Error("No tracks found.");
                        }
                        else if (data.loadType === Types_1.default.LOAD_SEARCH || data.loadType === Types_1.default.LOAD_PLAYLIST) {
                            if (Array.isArray(data.data)) {
                                for (i = 0; i < data.data.length; i++) {
                                    track = new Track_1.default(data.data[i]);
                                    data_copy.tracks[i] = track;
                                }
                            }
                            else {
                                for (i = 0; i < data.data.tracks.length; i++) {
                                    track = new Track_1.default(data.data.tracks[i]);
                                    data_copy.tracks[i] = track;
                                }
                            }
                        }
                        else if (data.loadType === Types_1.default.LOAD_TRACK) {
                            track = new Track_1.default(data.data);
                            data_copy.tracks[0] = track;
                        }
                        else {
                            data_copy = __assign(__assign({}, data), { requester: requester });
                        }
                        data_copy.loadType = data.loadType;
                        return [2 /*return*/, data_copy];
                }
            });
        });
    };
    return Blue;
}(node_events_1.EventEmitter));
exports.default = Blue;
