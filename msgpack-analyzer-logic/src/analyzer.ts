import Unpacker from './unpacker';

type AnalyzedValue = any | AnalyzedValues | AnalyzedValue[];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnalyzedValues extends Map<number, AnalyzedValue> {}

class Analyzer {
  private _buf: Uint8Array;
  private _view: DataView;
  private _unpacker: Unpacker;

  public constructor(data: Uint8Array) {
    this._buf = data;
    this._view = new DataView(this._buf.buffer, 0, this._buf.length);
    this._unpacker = new Unpacker(data);
  }

  private _analyze(): AnalyzedValue | AnalyzedValues {
    const off = this._unpacker.offset;
    const byte = this._view.getUint8(off);

    if ((byte & 0xf0) == 0x90 || byte == 0xdc || byte == 0xdd) {
      const val = this._unpacker.unpackListLength();

      const list: AnalyzedValues = new Map();

      for (let i = 0; i < val; i++) {
        const off = this._unpacker.offset;
        list.set(off, this._analyze());
      }

      return list;
    } else if ((byte & 0xf0) == 0x80 || byte == 0xde || byte == 0xdf) {
      const val = this._unpacker.unpackMapLength();

      const map: AnalyzedValues = new Map();

      for (let i = 0; i < val * 2; i++) {
        const off = this._unpacker.offset;
        map.set(off, this._analyze());
      }

      return map;
    } else {
      const val = this._unpacker.unpack();

      if (typeof val === 'string') {
        return val;
      } else {
        return val;
      }
    }
  }

  public analyze(): AnalyzedValues {
    const res: AnalyzedValues = new Map();

    while (this._unpacker.offset < this._buf.length) {
      res.set(this._unpacker.offset, this._analyze());
    }

    return res;
  }
}

module.exports = Analyzer;
export default Analyzer;
