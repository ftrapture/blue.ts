"use strict";
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
var Events_1 = __importDefault(require("../Utils/Events"));
var undici_1 = require("undici");
var PlayerManager_1 = __importDefault(require("./PlayerManager"));
require("../Utils/Color");
var Methods_1 = __importDefault(require("../Utils/Methods"));
var Rest = /** @class */ (function () {
    function Rest(blue) {
        this.blue = blue;
        this.url = "http".concat(this.blue._nodes[0].secure ? "s" : "", "://").concat(this.blue._nodes[0].host, ":").concat(this.blue._nodes[0].port);
        this.options = {
            host: this.blue._nodes[0].host,
            password: this.blue._nodes[0].password,
            port: this.blue._nodes[0].port,
            secure: this.blue._nodes[0].secure
        };
    }
    Rest.prototype.setSession = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.sessionId = id;
                this.url = "http".concat(this.blue.options.secure ? "s" : "", "://").concat(this.blue.options.host, ":").concat(this.blue.options.port);
                this.options["host"] = this.blue.options.host;
                this.options["password"] = this.blue.options.password;
                this.options["port"] = this.blue.options.port;
                this.options["secure"] = this.blue.options.secur;
                return [2 /*return*/];
            });
        });
    };
    Rest.prototype.updatePlayer = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.blue.emit(Events_1.default.api, "[".concat(String("DEBUG").Blue(), "]: ").concat(this.options.host, " ---> [").concat(String("PLAYER UPDATE").Yellow(), "] ---> ").concat(String("".concat(JSON.stringify(options))).Yellow()));
                        return [4 /*yield*/, this.patch("/".concat(this.blue.version, "/sessions/").concat(this.sessionId, "/players/").concat(options.guildId, "?noReplace=").concat((options === null || options === void 0 ? void 0 : options.noReplace) || false), options.data)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.createPlayer = function (options) {
        if (options === void 0) { options = {}; }
        if (Object.keys(options).length < 1)
            throw new ReferenceError("Must provide voice, guild and text channel ids.");
        if (this.blue.players.has(options.guildId))
            return this.blue.players.get(options.guildId);
        var playerObj = new PlayerManager_1.default(this.blue, options);
        this.blue.players.set(options.guildId, playerObj);
        return playerObj;
    };
    Rest.prototype.getPlayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/".concat(this.blue.version, "/sessions/").concat(this.sessionId, "/players"))];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/".concat(this.blue.version, "/stats"))];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.fetchVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/version")];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.updateSession = function (sessionId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("/".concat(this.blue.version, "/sessions/").concat(sessionId), payload)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/".concat(this.blue.version, "/info"))];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.decodeTrack = function (encoded) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("".concat(this.blue.version, "/decodetrack?encodedTrack=").concat(encoded))];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.decodeTracks = function (encoded) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("".concat(this.blue.version, "/decodetracks"), encoded)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.getPlayer = function (guildId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/".concat(this.blue.version, "/sessions/").concat(this.sessionId, "/players/").concat(guildId))];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.destroyPlayer = function (guildId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete("/".concat(this.blue.version, "/sessions/").concat(this.sessionId, "/players/").concat(guildId))];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Rest.prototype.patch = function (endpoint, body) {
        return __awaiter(this, void 0, void 0, function () {
            var req, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, undici_1.fetch)(this.url + endpoint, {
                                method: Methods_1.default.Patch,
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: this.options.password,
                                },
                                body: JSON.stringify(body),
                            })];
                    case 1:
                        req = _a.sent();
                        return [4 /*yield*/, req.json()];
                    case 2: return [2 /*return*/, (_a.sent())];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Rest.prototype.get = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var req, _a, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, undici_1.fetch)(this.url + path, {
                                method: Methods_1.default.Get,
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: this.options.password,
                                },
                            })];
                    case 1:
                        req = _b.sent();
                        if (!(req.headers.get("content-type") === "application/json")) return [3 /*break*/, 3];
                        return [4 /*yield*/, req.json()];
                    case 2:
                        _a = (_b.sent());
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, req.text()];
                    case 4:
                        _a = (_b.sent());
                        _b.label = 5;
                    case 5: return [2 /*return*/, _a];
                    case 6:
                        e_2 = _b.sent();
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Rest.prototype.post = function (endpoint, body) {
        return __awaiter(this, void 0, void 0, function () {
            var req, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, undici_1.fetch)(this.url + endpoint, {
                                method: Methods_1.default.Post,
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: this.options.password,
                                },
                                body: JSON.stringify(body),
                            })];
                    case 1:
                        req = _a.sent();
                        return [4 /*yield*/, req.json()];
                    case 2: return [2 /*return*/, (_a.sent())];
                    case 3:
                        e_3 = _a.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Rest.prototype.delete = function (endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var req, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, undici_1.fetch)(this.url + endpoint, {
                                method: Methods_1.default.Delete,
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: this.options.password,
                                },
                            })];
                    case 1:
                        req = _a.sent();
                        return [4 /*yield*/, req.json()];
                    case 2: return [2 /*return*/, (_a.sent())];
                    case 3:
                        e_4 = _a.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Rest.prototype.send = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    new Promise(function (resolve, reject) {
                        var data = JSON.stringify(payload);
                        if (data) {
                            resolve(data);
                            _this.blue.node.ws.send(data, function (error) {
                                if (error)
                                    throw new Error(error);
                                else
                                    return _this;
                            });
                        }
                        else {
                            reject(data);
                            throw new Error("Recieved an unknown payload!");
                        }
                    });
                }
                catch (e) {
                    this.blue.emit(Events_1.default.nodeError, e, new Error("Unable to send the data to the endpoint!"));
                }
                return [2 /*return*/];
            });
        });
    };
    return Rest;
}());
exports.default = Rest;
