import Unpacker from './unpacker';

type AnalyzedValue = { type: string; value: any } | AnalyzedValues | AnalyzedValue[];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
class AnalyzedValues extends Map<number, AnalyzedValue> {
  public get(key: number): AnalyzedValue | undefined {
    return { type: 'null', value: null };
  }
}

class Analyzer {
  private _buf: Uint8Array;
  private _view: DataView;
  private _unpacker: Unpacker;

  public constructor() {
    this._buf = new Uint8Array();
    this._view = new DataView(this._buf.buffer, 0, 0);
    this._unpacker = new Unpacker(this._buf);
  }

  private _analyze(): AnalyzedValue | AnalyzedValues {
    const off = this._unpacker.offset;
    const byte = this._view.getUint8(off);

    if ((byte & 0xf0) == 0x90 || byte == 0xdc || byte == 0xdd) {
      const val = this._unpacker.unpackListLength();

      const list = new AnalyzedValues();

      for (let i = 0; i < val; i++) {
        const off = this._unpacker.offset;
        list.set(off, this._analyze());
      }

      return { type: 'array', value: list };
    } else if ((byte & 0xf0) == 0x80 || byte == 0xde || byte == 0xdf) {
      const val = this._unpacker.unpackMapLength();

      const map = new AnalyzedValues();

      for (let i = 0; i < val * 2; i++) {
        const off = this._unpacker.offset;
        map.set(off, this._analyze());
      }

      return { type: 'map', value: map };
    } else {
      const val = this._unpacker.unpack();

      if (val instanceof Uint8Array) {
        return { type: 'binary', value: val };
      }

      return { type: typeof val, value: val };
    }
  }

  public analyze(data: Uint8Array): AnalyzedValues {
    const res = new AnalyzedValues();

    this._buf = data;
    this._view = new DataView(this._buf.buffer, 0, this._buf.length);
    this._unpacker.reset(data);

    while (this._unpacker.offset < this._buf.length) {
      res.set(this._unpacker.offset, this._analyze());
    }

    return res;
  }
}

export default Analyzer;
