"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = __importDefault(require("util"));
var Unpacker = /** @class */ (function () {
    function Unpacker(data) {
        this._offset = 0;
        this._buf = data;
        this._view = new DataView(this._buf.buffer, 0, this._buf.length);
        this._decoder = new util_1.default.TextDecoder();
    }
    Object.defineProperty(Unpacker.prototype, "offset", {
        get: function () {
            return this._offset;
        },
        enumerable: false,
        configurable: true
    });
    Unpacker.prototype.unpack = function () {
        var v = this._view.getUint8(this._offset);
        var res;
        if (v == 0xc0)
            res = this.unpackNull();
        else if (v == 0xc2 || v == 0xc3)
            res = this.unpackBool();
        else if (v <= 0x7f || v >= 0xe0 || v == 0xcc || v == 0xcd || v == 0xce || v == 0xcf || v == 0xd0 || v == 0xd1 || v == 0xd2 || v == 0xd3)
            res = this.unpackInt();
        else if (v == 0xca || v == 0xcb)
            res = this.unpackFloat();
        else if ((v & 0xe0) == 0xa0 || v == 0xc0 || v == 0xd9 || v == 0xda || v == 0xdb)
            res = this.unpackString();
        else if (v == 0xc4 || v == 0xc5 || v == 0xc6)
            res = this.unpackBinary();
        else if ((v & 0xf0) == 0x90 || v == 0xdc || v == 0xdd)
            res = this.unpackList();
        else if ((v & 0xf0) == 0x80 || v == 0xde || v == 0xdf)
            res = this.unpackMap();
        else
            throw new Error("Cannot unpack byte: '0x" + v.toString(16).toUpperCase() + "' offset: '" + this._offset + "'");
        return res;
    };
    Unpacker.prototype.unpackNull = function () {
        var v = this._view.getUint8(this._offset);
        if (v == 0xc0) {
            this._offset++;
            return null;
        }
        throw new Error("Try to unpack null value, but it's not an null, byte = 0x" + v.toString(16).toUpperCase());
    };
    Unpacker.prototype.unpackBool = function () {
        var v = this._view.getUint8(this._offset);
        var res;
        if (v == 0xc0) {
            res = null;
            this._offset += 1;
        }
        else if (v == 0xc3) {
            res = true;
            this._offset += 1;
        }
        else if (v == 0xc2) {
            res = false;
            this._offset += 1;
        }
        else {
            throw new Error("Try to unpack bool value, but it's not an bool, byte = 0x" + v.toString(16).toUpperCase());
        }
        return res;
    };
    Unpacker.prototype.unpackInt = function () {
        var v = this._view.getUint8(this._offset);
        var res;
        if (v == 0xc0) {
            res = null;
        }
        else if (v <= 0x7f || v >= 0xe0) {
            res = this._view.getInt8(this._offset);
            this._offset += 1;
        }
        else if (v == 0xcc) {
            res = this._view.getUint8(++this._offset);
            this._offset += 1;
        }
        else if (v == 0xcd) {
            res = this._view.getUint16(++this._offset);
            this._offset += 2;
        }
        else if (v == 0xce) {
            res = this._view.getUint32(++this._offset);
            this._offset += 4;
        }
        else if (v == 0xcf) {
            res = this._view.getBigUint64(++this._offset);
            this._offset += 8;
        }
        else if (v == 0xd0) {
            res = this._view.getInt8(++this._offset);
            this._offset += 1;
        }
        else if (v == 0xd1) {
            res = this._view.getInt16(++this._offset);
            this._offset += 2;
        }
        else if (v == 0xd2) {
            res = this._view.getInt32(++this._offset);
            this._offset += 4;
        }
        else if (v == 0xd3) {
            res = this._view.getBigInt64(++this._offset);
            this._offset += 8;
        }
        else {
            throw new Error("Try to unpack integer value, but it's not an integer, byte = 0x" + v.toString(16).toUpperCase());
        }
        return res;
    };
    Unpacker.prototype.unpackFloat = function () {
        var v = this._view.getUint8(this._offset);
        var res;
        if (v == 0xc0) {
            res = null;
        }
        else if (v == 0xca) {
            res = this._view.getFloat32(++this._offset);
            this._offset += 4;
        }
        else if (v == 0xcb) {
            res = this._view.getFloat64(++this._offset);
            this._offset += 8;
        }
        else {
            throw new Error("Try to unpack float value, but it's not an float, byte = 0x" + v.toString(16).toUpperCase());
        }
        return res;
    };
    Unpacker.prototype.unpackString = function () {
        var v = this._view.getUint8(this._offset);
        var len;
        if (v == 0xc0) {
            this._offset += 1;
            return null;
        }
        else if ((v & 0xe0) == 0xa0) {
            len = v & 0x1f;
            this._offset += 1;
        }
        else if (v == 0xd9) {
            len = this._view.getUint8(++this._offset);
            this._offset += 1;
        }
        else if (v == 0xda) {
            len = this._view.getUint16(++this._offset);
            this._offset += 2;
        }
        else if (v == 0xdb) {
            len = this._view.getUint32(++this._offset);
            this._offset += 4;
        }
        else {
            throw new Error("Try to unpack string value, but it's not an string, byte = 0x" + v.toString(16).toUpperCase());
        }
        var res = this._decoder.decode(new Uint8Array(this._buf.buffer, this._offset, len));
        this._offset += len;
        return res;
    };
    Unpacker.prototype.unpackBinary = function () {
        var v = this._view.getUint8(this._offset);
        var len;
        if (v == 0xc0) {
            this._offset += 1;
            return null;
        }
        else if ((v & 0xe0) == 0xa0) {
            len = v & 0x1f;
            this._offset += 1;
        }
        else if (v == 0xd9) {
            len = this._view.getUint8(++this._offset);
            this._offset += 1;
        }
        else if (v == 0xda) {
            len = this._view.getUint16(++this._offset);
            this._offset += 2;
        }
        else if (v == 0xdb) {
            len = this._view.getUint32(++this._offset);
            this._offset += 4;
        }
        else {
            throw new Error("Try to unpack binary value, but it's not an binary, byte = 0x" + v.toString(16).toUpperCase());
        }
        var res = new Uint8Array(this._buf.buffer.slice(this._buf.byteOffset, this._offset));
        this._offset += len;
        return res;
    };
    Unpacker.prototype.unpackListLength = function () {
        var v = this._view.getUint8(this._offset);
        var len;
        if (v == 0xc0) {
            len = 0;
            this._offset += 1;
        }
        else if ((v & 0xf0) == 0x90) {
            len = v & 0xf;
            this._offset += 1;
        }
        else if (v == 0xdc) {
            len = this._view.getUint16(++this._offset);
            this._offset += 2;
        }
        else if (v == 0xdd) {
            len = this._view.getUint32(++this._offset);
            this._offset += 4;
        }
        else {
            throw new Error("Try to unpack List length value, but it's not an List lenght, byte = 0x" + v.toString(16).toUpperCase());
        }
        return len;
    };
    Unpacker.prototype.unpackMapLength = function () {
        var v = this._view.getUint8(this._offset);
        var len;
        if (v == 0xc0) {
            len = 0;
            this._offset += 1;
        }
        else if ((v & 0xf0) == 0x80) {
            len = v & 0xf;
            this._offset += 1;
        }
        else if (v == 0xde) {
            len = this._view.getUint16(++this._offset);
            this._offset += 2;
        }
        else if (v == 0xdf) {
            len = this._view.getUint32(++this._offset);
            this._offset += 4;
        }
        else {
            throw new Error("Try to unpack Map length value, but it's not an Map lenght, byte = 0x" + v.toString(16).toUpperCase());
        }
        return len;
    };
    Unpacker.prototype.unpackList = function () {
        var len = this.unpackListLength();
        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            res[i] = this.unpack();
        }
        return res;
    };
    Unpacker.prototype.unpackMap = function () {
        var len = this.unpackMapLength();
        var res = {};
        for (var i = 0; i < len; i++) {
            res[this.unpack()] = this.unpack();
        }
        return res;
    };
    Unpacker.prototype.reset = function (data) {
        if (data === void 0) { data = null; }
        this._offset = 0;
        if (data !== null) {
            this._buf = data;
            this._view = new DataView(this._buf.buffer, 0, this._buf.length);
        }
    };
    return Unpacker;
}());
module.exports = Unpacker;
exports.default = Unpacker;
//# sourceMappingURL=unpacker.js.map