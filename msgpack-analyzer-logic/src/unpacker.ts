import util from 'util';

class Unpacker {
  private _offset = 0;
  private _buf: Uint8Array;
  private _view: DataView;
  private _decoder: util.TextDecoder;

  get offset(): number {
    return this._offset;
  }

  public constructor(data: Uint8Array) {
    this._buf = data;
    this._view = new DataView(this._buf.buffer, 0, this._buf.length);
    this._decoder = new util.TextDecoder();
  }

  public unpack(): any {
    const v = this._view.getUint8(this._offset);
    let res: any;

    if (v == 0xc0) res = this.unpackNull();
    else if (v == 0xc2 || v == 0xc3) res = this.unpackBool();
    else if (v <= 0x7f || v >= 0xe0 || v == 0xcc || v == 0xcd || v == 0xce || v == 0xcf || v == 0xd0 || v == 0xd1 || v == 0xd2 || v == 0xd3) res = this.unpackInt();
    else if (v == 0xca || v == 0xcb) res = this.unpackFloat();
    else if ((v & 0xe0) == 0xa0 || v == 0xc0 || v == 0xd9 || v == 0xda || v == 0xdb) res = this.unpackString();
    else if (v == 0xc4 || v == 0xc5 || v == 0xc6) res = this.unpackBinary();
    else if ((v & 0xf0) == 0x90 || v == 0xdc || v == 0xdd) res = this.unpackList();
    else if ((v & 0xf0) == 0x80 || v == 0xde || v == 0xdf) res = this.unpackMap();
    else throw new Error(`Cannot unpack byte: '0x${v.toString(16).toUpperCase()}' offset: '${this._offset}'`);

    return res;
  }

  public unpackNull(): null {
    const v = this._view.getUint8(this._offset);

    if (v == 0xc0) {
      this._offset++;
      return null;
    }

    throw new Error(`Try to unpack null value, but it's not an null, byte = 0x${v.toString(16).toUpperCase()}`);
  }

  public unpackBool(): boolean | null {
    const v = this._view.getUint8(this._offset);
    let res: boolean | null;

    if (v == 0xc0) {
      res = null;
      this._offset += 1;
    } else if (v == 0xc3) {
      res = true;
      this._offset += 1;
    } else if (v == 0xc2) {
      res = false;
      this._offset += 1;
    } else {
      throw new Error(`Try to unpack bool value, but it's not an bool, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    return res;
  }

  public unpackInt(): number | bigint | null {
    const v = this._view.getUint8(this._offset);
    let res: number | bigint | null;

    if (v == 0xc0) {
      res = null;
    } else if (v <= 0x7f || v >= 0xe0) {
      res = this._view.getInt8(this._offset);
      this._offset += 1;
    } else if (v == 0xcc) {
      res = this._view.getUint8(++this._offset);
      this._offset += 1;
    } else if (v == 0xcd) {
      res = this._view.getUint16(++this._offset);
      this._offset += 2;
    } else if (v == 0xce) {
      res = this._view.getUint32(++this._offset);
      this._offset += 4;
    } else if (v == 0xcf) {
      res = this._view.getBigUint64(++this._offset);
      this._offset += 8;
    } else if (v == 0xd0) {
      res = this._view.getInt8(++this._offset);
      this._offset += 1;
    } else if (v == 0xd1) {
      res = this._view.getInt16(++this._offset);
      this._offset += 2;
    } else if (v == 0xd2) {
      res = this._view.getInt32(++this._offset);
      this._offset += 4;
    } else if (v == 0xd3) {
      res = this._view.getBigInt64(++this._offset);
      this._offset += 8;
    } else {
      throw new Error(`Try to unpack integer value, but it's not an integer, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    return res;
  }

  public unpackFloat(): number | null {
    const v = this._view.getUint8(this._offset);
    let res: number | null;

    if (v == 0xc0) {
      res = null;
    } else if (v == 0xca) {
      res = this._view.getFloat32(++this._offset);
      this._offset += 4;
    } else if (v == 0xcb) {
      res = this._view.getFloat64(++this._offset);
      this._offset += 8;
    } else {
      throw new Error(`Try to unpack float value, but it's not an float, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    return res;
  }

  public unpackString(): string | null {
    const v = this._view.getUint8(this._offset);
    let len: number;

    if (v == 0xc0) {
      this._offset += 1;
      return null;
    } else if ((v & 0xe0) == 0xa0) {
      len = v & 0x1f;
      this._offset += 1;
    } else if (v == 0xd9) {
      len = this._view.getUint8(++this._offset);
      this._offset += 1;
    } else if (v == 0xda) {
      len = this._view.getUint16(++this._offset);
      this._offset += 2;
    } else if (v == 0xdb) {
      len = this._view.getUint32(++this._offset);
      this._offset += 4;
    } else {
      throw new Error(`Try to unpack string value, but it's not an string, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    const res = this._decoder.decode(new Uint8Array(this._buf.buffer, this._offset, len));
    this._offset += len;

    return res;
  }

  public unpackBinary(): Uint8Array | null {
    const v = this._view.getUint8(this._offset);
    let len: number;

    if (v == 0xc0) {
      this._offset += 1;
      return null;
    } else if ((v & 0xe0) == 0xa0) {
      len = v & 0x1f;
      this._offset += 1;
    } else if (v == 0xd9) {
      len = this._view.getUint8(++this._offset);
      this._offset += 1;
    } else if (v == 0xda) {
      len = this._view.getUint16(++this._offset);
      this._offset += 2;
    } else if (v == 0xdb) {
      len = this._view.getUint32(++this._offset);
      this._offset += 4;
    } else {
      throw new Error(`Try to unpack binary value, but it's not an binary, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    const res = new Uint8Array(this._buf.buffer.slice(this._buf.byteOffset, this._offset));
    this._offset += len;

    return res;
  }

  public unpackListLength(): number {
    const v = this._view.getUint8(this._offset);
    let len: number;

    if (v == 0xc0) {
      len = 0;
      this._offset += 1;
    } else if ((v & 0xf0) == 0x90) {
      len = v & 0xf;
      this._offset += 1;
    } else if (v == 0xdc) {
      len = this._view.getUint16(++this._offset);
      this._offset += 2;
    } else if (v == 0xdd) {
      len = this._view.getUint32(++this._offset);
      this._offset += 4;
    } else {
      throw new Error(`Try to unpack List length value, but it's not an List lenght, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    return len;
  }

  public unpackMapLength(): number {
    const v = this._view.getUint8(this._offset);
    let len: number;

    if (v == 0xc0) {
      len = 0;
      this._offset += 1;
    } else if ((v & 0xf0) == 0x80) {
      len = v & 0xf;
      this._offset += 1;
    } else if (v == 0xde) {
      len = this._view.getUint16(++this._offset);
      this._offset += 2;
    } else if (v == 0xdf) {
      len = this._view.getUint32(++this._offset);
      this._offset += 4;
    } else {
      throw new Error(`Try to unpack Map length value, but it's not an Map lenght, byte = 0x${v.toString(16).toUpperCase()}`);
    }

    return len;
  }

  public unpackList(): Array<any> {
    const len = this.unpackListLength();
    const res = new Array(len);

    for (let i = 0; i < len; i++) {
      res[i] = this.unpack();
    }

    return res;
  }

  public unpackMap(): Record<any, any> {
    const len = this.unpackMapLength();
    const res: Record<any, any> = {};

    for (let i = 0; i < len; i++) {
      res[this.unpack()] = this.unpack();
    }

    return res;
  }

  public reset(data: Uint8Array | null = null): void {
    this._offset = 0;
    if (data !== null) {
      this._buf = data;
      this._view = new DataView(this._buf.buffer, 0, this._buf.length);
    }
  }
}

module.exports = Unpacker;
export default Unpacker;
