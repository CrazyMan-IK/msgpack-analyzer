import Unpacker from './unpacker';

type Value = any | AnalyzedValues;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnalyzedValues extends Record<number, Value> {}

class Analyzer {
  private _buf: Uint8Array;
  private _view: DataView;
  private _unpacker: Unpacker;

  public constructor(data: Uint8Array) {
    this._buf = data;
    this._view = new DataView(this._buf.buffer, 0, this._buf.length);
    this._unpacker = new Unpacker(data);
  }

  public analyze(): AnalyzedValues {
    const off = this._unpacker.offset;
    const byte = this._view.getUint8(off);
    const val = this._unpacker.unpack();

    return { byte: val };
  }
}

module.exports = Analyzer;
