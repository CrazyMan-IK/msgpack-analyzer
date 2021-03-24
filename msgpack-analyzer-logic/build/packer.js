"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = __importDefault(require("util"));
var Packer = /** @class */ (function () {
    function Packer(bufSize) {
        if (bufSize === void 0) { bufSize = 64; }
        this._offset = 0;
        this._bufSize = bufSize;
        this._buf = new Uint8Array(this._bufSize);
        this._view = new DataView(this._buf.buffer, 0, this._bufSize);
        this._encoder = new util_1.default.TextEncoder();
    }
    Packer.prototype._tryResize = function (offset) {
        if (offset === void 0) { offset = 1; }
        if (this._buf.length - this._offset < offset) {
            this._bufSize *= 2;
            var newBuf = new Uint8Array(this._bufSize);
            newBuf.set(this._buf, 0);
            this._buf = newBuf;
        }
    };
    Packer.prototype._putBytes = function (bytes) {
        var length = bytes.length;
        this._tryResize(length);
        this._buf.set(bytes, this._offset);
        this._offset += length;
    };
    Packer.prototype.pack = function (v) {
        if (v === null)
            this.packNull();
        else if (typeof v === 'boolean')
            this.packBool(v);
        else if (typeof v === 'number' && Number.isInteger(v))
            this.packInt(v);
        else if (typeof v === 'number' && !Number.isInteger(v))
            this.packFloat(v);
        else if (typeof v === 'string')
            this.packString(v);
        else if (v instanceof Uint8Array)
            this.packBinary(v);
        else if (v instanceof Array)
            this.packList(v);
        else if (typeof v === 'object')
            this.packMap(v);
        else
            throw new TypeError("Cannot pack type: " + typeof v);
        return this;
    };
    Packer.prototype.packNull = function () {
        this._tryResize();
        this._view.setUint8(this._offset++, 0xc0);
        return this;
    };
    Packer.prototype.packBool = function (v) {
        this._tryResize();
        if (v == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else {
            this._view.setUint8(this._offset++, v ? 0xc3 : 0xc2);
        }
        return this;
    };
    Packer.prototype.packInt = function (v) {
        this._tryResize(9);
        if (v == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else if (v >= 0) {
            if (v <= 127) {
                this._view.setUint8(this._offset++, v);
            }
            else if (v <= 0xff) {
                this._view.setUint8(this._offset++, 0xcc);
                this._view.setUint8(this._offset++, v);
            }
            else if (v <= 0xffff) {
                this._view.setUint8(this._offset++, 0xcd);
                this._view.setUint16(this._offset, v);
                this._offset += 2;
            }
            else if (v <= 0xffffffff) {
                this._view.setUint8(this._offset++, 0xce);
                this._view.setUint32(this._offset, v);
                this._offset += 4;
            }
            else {
                var bv = BigInt(v);
                this._view.setUint8(this._offset++, 0xcf);
                this._view.setBigUint64(this._offset, bv);
                this._offset += 8;
            }
        }
        else if (v >= -32) {
            this._view.setInt8(this._offset++, v);
        }
        else if (v >= -128) {
            this._view.setUint8(this._offset++, 0xd0);
            this._view.setInt8(this._offset++, v);
        }
        else if (v >= -32768) {
            this._view.setUint8(this._offset++, 0xd1);
            this._view.setInt16(this._offset, v);
            this._offset += 2;
        }
        else if (v >= -2147483648) {
            this._view.setUint8(this._offset++, 0xd2);
            this._view.setInt32(this._offset, v);
            this._offset += 4;
        }
        else {
            var bv = BigInt(v);
            this._view.setUint8(this._offset++, 0xd3);
            this._view.setBigInt64(this._offset, bv);
            this._offset += 8;
        }
        return this;
    };
    Packer.prototype.packFloat = function (v) {
        this._tryResize(9);
        if (v == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else if (v <= 3.40282e38) {
            this._view.setUint8(this._offset++, 0xca);
            this._view.setFloat32(this._offset, v);
            this._offset += 4;
        }
        else {
            this._view.setUint8(this._offset++, 0xcb);
            this._view.setFloat64(this._offset, v);
            this._offset += 8;
        }
        return this;
    };
    Packer.prototype.packString = function (v) {
        this._tryResize(5);
        if (v == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else {
            var encoded = this._encoder.encode(v);
            var length = encoded.length;
            if (length <= 31) {
                this._view.setUint8(this._offset++, 0xa0 | length);
            }
            else if (length <= 0xff) {
                this._view.setUint8(this._offset++, 0xd9);
                this._view.setUint8(this._offset++, length);
            }
            else if (length <= 0xffff) {
                this._view.setUint8(this._offset++, 0xda);
                this._view.setUint16(this._offset, length);
                this._offset += 2;
            }
            else if (length <= 0xffffffff) {
                this._view.setUint8(this._offset++, 0xdb);
                this._view.setUint32(this._offset, length);
                this._offset += 4;
            }
            else {
                throw new TypeError('Max String length is 0xFFFFFFFF');
            }
            this._putBytes(encoded);
        }
        return this;
    };
    Packer.prototype.packStringEmptyIsNull = function (v) {
        if (v == null || v == '') {
            this.packNull();
        }
        else {
            this.packString(v);
        }
        return this;
    };
    Packer.prototype.packBinary = function (buffer) {
        this._tryResize(5);
        if (buffer == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else {
            var length = buffer.length;
            if (length <= 0xff) {
                this._view.setUint8(this._offset++, 0xc4);
                this._view.setUint8(this._offset++, length);
            }
            else if (length <= 0xffff) {
                this._view.setUint8(this._offset++, 0xc5);
                this._view.setUint16(this._offset, length);
                this._offset += 2;
            }
            else if (length <= 0xffffffff) {
                this._view.setUint8(this._offset++, 0xc6);
                this._view.setUint32(this._offset, length);
                this._offset += 4;
            }
            else {
                throw new TypeError('Max binary length is 0xFFFFFFFF');
            }
            this._putBytes(buffer);
        }
        return this;
    };
    Packer.prototype.packListLength = function (length) {
        this._tryResize(5);
        if (length == null) {
            this._view.setUint8(this._offset++, 0x90);
        }
        else if (length <= 0xf) {
            this._view.setUint8(this._offset++, 0x90 | length);
        }
        else if (length <= 0xffff) {
            this._view.setUint8(this._offset++, 0xdc);
            this._view.setUint16(this._offset, length);
            this._offset += 2;
        }
        else if (length <= 0xffffffff) {
            this._view.setUint8(this._offset++, 0xdd);
            this._view.setUint32(this._offset, length);
            this._offset += 4;
        }
        else {
            throw new TypeError('Max list length is 0xFFFFFFFF');
        }
        return this;
    };
    Packer.prototype.packMapLength = function (length) {
        this._tryResize(5);
        if (length == null) {
            this._view.setUint8(this._offset++, 0x80);
        }
        else if (length <= 0xf) {
            this._view.setUint8(this._offset++, 0x80 | length);
        }
        else if (length <= 0xffff) {
            this._view.setUint8(this._offset++, 0xde);
            this._view.setUint16(this._offset, length);
            this._offset += 2;
        }
        else if (length <= 0xffffffff) {
            this._view.setUint8(this._offset++, 0xdf);
            this._view.setUint32(this._offset, length);
            this._offset += 4;
        }
        else {
            throw new TypeError('Max map length is 0xFFFFFFFF');
        }
        return this;
    };
    Packer.prototype.packList = function (v) {
        var _this = this;
        if (v == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else {
            this.packListLength(v.length);
            v.forEach(function (val) {
                _this.pack(val);
            });
        }
        return this;
    };
    Packer.prototype.packMap = function (v) {
        if (v == null) {
            this._view.setUint8(this._offset++, 0xc0);
        }
        else {
            this.packMapLength(Object.keys(v).length);
            for (var key in v) {
                this.pack(key);
                this.pack(v[key]);
            }
        }
        return this;
    };
    Packer.prototype.takeBytes = function () {
        var bytes = new Uint8Array(this._buf.buffer.slice(this._buf.byteOffset), 0, this._offset);
        return bytes;
    };
    Packer.prototype.reset = function () {
        this._offset = 0;
        this._buf.fill(0);
    };
    return Packer;
}());
module.exports = Packer;
//# sourceMappingURL=packer.js.map