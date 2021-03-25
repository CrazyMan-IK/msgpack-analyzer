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
    Analyzer.prototype._analyze = function () {
        var off = this._unpacker.offset;
        var byte = this._view.getUint8(off);
        if ((byte & 0xf0) == 0x90 || byte == 0xdc || byte == 0xdd) {
            var val = this._unpacker.unpackListLength();
            var list = new Map();
            for (var i = 0; i < val; i++) {
                var off_1 = this._unpacker.offset;
                list.set(off_1, this._analyze());
            }
            return list;
        }
        else if ((byte & 0xf0) == 0x80 || byte == 0xde || byte == 0xdf) {
            var val = this._unpacker.unpackMapLength();
            var map = new Map();
            for (var i = 0; i < val * 2; i++) {
                var off_2 = this._unpacker.offset;
                map.set(off_2, this._analyze());
            }
            return map;
        }
        else {
            var val = this._unpacker.unpack();
            if (typeof val === 'string') {
                return val;
            }
            else {
                return val;
            }
        }
    };
    Analyzer.prototype.analyze = function () {
        var res = new Map();
        while (this._unpacker.offset < this._buf.length) {
            res.set(this._unpacker.offset, this._analyze());
        }
        return res;
    };
    return Analyzer;
}());
module.exports = Analyzer;
//# sourceMappingURL=analyzer.js.map