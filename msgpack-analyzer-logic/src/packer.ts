import util from 'util';

class Packer {
  private _offset = 0;
  private _bufSize: number;
  private _buf: Uint8Array;
  private _view: DataView;
  private _encoder: util.TextEncoder;

  public constructor(bufSize = 64) {
    this._bufSize = bufSize;
    this._buf = new Uint8Array(this._bufSize);
    this._view = new DataView(this._buf.buffer, 0, this._bufSize);
    this._encoder = new util.TextEncoder();
  }

  private _tryResize(offset = 1): void {
    if (this._buf.length - this._offset < offset) {
      this._bufSize *= 2;
      const newBuf = new Uint8Array(this._bufSize);
      newBuf.set(this._buf, 0);
      this._buf = newBuf;
    }
  }

  private _putBytes(bytes: Uint8Array): void {
    const length = bytes.length;
    this._tryResize(length);
    this._buf.set(bytes, this._offset);
    this._offset += length;
  }

  public pack(v: any): Packer {
    if (v === null) this.packNull();
    else if (typeof v === 'boolean') this.packBool(v);
    else if (typeof v === 'number' && Number.isInteger(v)) this.packInt(v);
    else if (typeof v === 'number' && !Number.isInteger(v)) this.packFloat(v);
    else if (typeof v === 'string') this.packString(v);
    else if (v instanceof Uint8Array) this.packBinary(v);
    else if (v instanceof Array) this.packList(v);
    else if (typeof v === 'object') this.packMap(v);
    else throw new TypeError(`Cannot pack type: ${typeof v}`);

    return this;
  }

  public packNull(): Packer {
    this._tryResize();
    this._view.setUint8(this._offset++, 0xc0);

    return this;
  }

  public packBool(v: boolean | null): Packer {
    this._tryResize();
    if (v == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else {
      this._view.setUint8(this._offset++, v ? 0xc3 : 0xc2);
    }

    return this;
  }

  public packInt(v: number | null): Packer {
    this._tryResize(9);

    if (v == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else if (v >= 0) {
      if (v <= 127) {
        this._view.setUint8(this._offset++, v);
      } else if (v <= 0xff) {
        this._view.setUint8(this._offset++, 0xcc);
        this._view.setUint8(this._offset++, v);
      } else if (v <= 0xffff) {
        this._view.setUint8(this._offset++, 0xcd);
        this._view.setUint16(this._offset, v);
        this._offset += 2;
      } else if (v <= 0xffffffff) {
        this._view.setUint8(this._offset++, 0xce);
        this._view.setUint32(this._offset, v);
        this._offset += 4;
      } else {
        const bv = BigInt(v);

        this._view.setUint8(this._offset++, 0xcf);
        this._view.setBigUint64(this._offset, bv);
        this._offset += 8;
      }
    } else if (v >= -32) {
      this._view.setInt8(this._offset++, v);
    } else if (v >= -128) {
      this._view.setUint8(this._offset++, 0xd0);
      this._view.setInt8(this._offset++, v);
    } else if (v >= -32768) {
      this._view.setUint8(this._offset++, 0xd1);
      this._view.setInt16(this._offset, v);
      this._offset += 2;
    } else if (v >= -2147483648) {
      this._view.setUint8(this._offset++, 0xd2);
      this._view.setInt32(this._offset, v);
      this._offset += 4;
    } else {
      const bv = BigInt(v);

      this._view.setUint8(this._offset++, 0xd3);
      this._view.setBigInt64(this._offset, bv);
      this._offset += 8;
    }

    return this;
  }

  public packFloat(v: number | null): Packer {
    this._tryResize(9);
    if (v == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else if (v <= 3.40282e38) {
      this._view.setUint8(this._offset++, 0xca);
      this._view.setFloat32(this._offset, v);
      this._offset += 4;
    } else {
      this._view.setUint8(this._offset++, 0xcb);
      this._view.setFloat64(this._offset, v);
      this._offset += 8;
    }

    return this;
  }

  public packString(v: string | null): Packer {
    this._tryResize(5);
    if (v == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else {
      const encoded = this._encoder.encode(v);
      const length = encoded.length;

      if (length <= 31) {
        this._view.setUint8(this._offset++, 0xa0 | length);
      } else if (length <= 0xff) {
        this._view.setUint8(this._offset++, 0xd9);
        this._view.setUint8(this._offset++, length);
      } else if (length <= 0xffff) {
        this._view.setUint8(this._offset++, 0xda);
        this._view.setUint16(this._offset, length);
        this._offset += 2;
      } else if (length <= 0xffffffff) {
        this._view.setUint8(this._offset++, 0xdb);
        this._view.setUint32(this._offset, length);
        this._offset += 4;
      } else {
        throw new TypeError('Max String length is 0xFFFFFFFF');
      }

      this._putBytes(encoded);
    }

    return this;
  }

  public packStringEmptyIsNull(v: string | null): Packer {
    if (v == null || v == '') {
      this.packNull();
    } else {
      this.packString(v);
    }

    return this;
  }

  public packBinary(buffer: Uint8Array | null): Packer {
    this._tryResize(5);
    if (buffer == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else {
      const length = buffer.length;

      if (length <= 0xff) {
        this._view.setUint8(this._offset++, 0xc4);
        this._view.setUint8(this._offset++, length);
      } else if (length <= 0xffff) {
        this._view.setUint8(this._offset++, 0xc5);
        this._view.setUint16(this._offset, length);
        this._offset += 2;
      } else if (length <= 0xffffffff) {
        this._view.setUint8(this._offset++, 0xc6);
        this._view.setUint32(this._offset, length);
        this._offset += 4;
      } else {
        throw new TypeError('Max binary length is 0xFFFFFFFF');
      }

      this._putBytes(buffer);
    }

    return this;
  }

  public packListLength(length: number | null): Packer {
    this._tryResize(5);
    if (length == null) {
      this._view.setUint8(this._offset++, 0x90);
    } else if (length <= 0xf) {
      this._view.setUint8(this._offset++, 0x90 | length);
    } else if (length <= 0xffff) {
      this._view.setUint8(this._offset++, 0xdc);
      this._view.setUint16(this._offset, length);
      this._offset += 2;
    } else if (length <= 0xffffffff) {
      this._view.setUint8(this._offset++, 0xdd);
      this._view.setUint32(this._offset, length);
      this._offset += 4;
    } else {
      throw new TypeError('Max list length is 0xFFFFFFFF');
    }

    return this;
  }

  public packMapLength(length: number | null): Packer {
    this._tryResize(5);
    if (length == null) {
      this._view.setUint8(this._offset++, 0x80);
    } else if (length <= 0xf) {
      this._view.setUint8(this._offset++, 0x80 | length);
    } else if (length <= 0xffff) {
      this._view.setUint8(this._offset++, 0xde);
      this._view.setUint16(this._offset, length);
      this._offset += 2;
    } else if (length <= 0xffffffff) {
      this._view.setUint8(this._offset++, 0xdf);
      this._view.setUint32(this._offset, length);
      this._offset += 4;
    } else {
      throw new TypeError('Max map length is 0xFFFFFFFF');
    }

    return this;
  }

  public packList(v: Array<any> | null): Packer {
    if (v == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else {
      this.packListLength(v.length);

      v.forEach((val: any) => {
        this.pack(val);
      });
    }

    return this;
  }

  public packMap(v: Record<any, any> | null): Packer {
    if (v == null) {
      this._view.setUint8(this._offset++, 0xc0);
    } else {
      this.packMapLength(Object.keys(v).length);

      for (const key in v) {
        this.pack(key);
        this.pack(v[key]);
      }
    }
    return this;
  }

  public takeBytes(): Uint8Array {
    const bytes: Uint8Array = new Uint8Array(this._buf.buffer.slice(this._buf.byteOffset), 0, this._offset);

    return bytes;
  }

  public reset(): void {
    this._offset = 0;
    this._buf.fill(0);
  }
}

module.exports = Packer;
