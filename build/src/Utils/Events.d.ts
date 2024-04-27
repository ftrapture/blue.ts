declare enum Events {
    nodeConnect = "nodeConnect",
    nodeDisconnect = "nodeDisconnect",
    nodeError = "nodeError",
    trackStart = "trackStart",
    debug = "api",
    voiceUpdate = "voiceUpdate",
    voiceStateUpdate = "voiceStateUpdate",
    api = "raw",
    trackEnd = "trackEnd",
    queueEnd = "queueEnd",
    trackError = "trackError",
    playerCreate = "playerCreate",
    playerUpdate = "playerUpdate",
    playerDisconnect = "playerDisconnect",
    wsConnect = "open",
    wsDisconnect = "close",
    wsDebug = "message",
    wsError = "error"
}
export default Events;
