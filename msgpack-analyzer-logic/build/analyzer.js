"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var unpacker_1 = __importDefault(require("./unpacker"));
var Analyzer = /** @class */ (function () {
    function Analyzer(data) {
        this._buf = data;
        this._view = new DataView(this._buf.buffer, 0, this._buf.length);
        this._unpacker = new unpacker_1.default(data);
    }
    Analyzer.prototype.analyze = function () {
        var off = this._unpacker.offset;
        var byte = this._view.getUint8(off);
        var val = this._unpacker.unpack();
        return { byte: val };
    };
    return Analyzer;
}());
module.exports = Analyzer;
//# sourceMappingURL=analyzer.js.map