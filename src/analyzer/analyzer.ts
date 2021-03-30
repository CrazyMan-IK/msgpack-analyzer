import Unpacker from './unpacker';

type AnalyzedValue = { type: string; value: any } | AnalyzedValues;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
class AnalyzedValues implements Map<number, AnalyzedValue> {
  clear(): void {
    throw new Error('Method not implemented.');
  }
  delete(key: number): boolean {
    throw new Error('Method not implemented.');
  }
  forEach(callbackfn: (value: AnalyzedValue, key: number, map: Map<number, AnalyzedValue>) => void, thisArg?: any): void {
    throw new Error('Method not implemented.');
  }
  has(key: number): boolean {
    throw new Error('Method not implemented.');
  }
  set(key: number, value: AnalyzedValue): this {
    throw new Error('Method not implemented.');
  }
  size: number = 0;
  [Symbol.iterator](): IterableIterator<[number, AnalyzedValue]> {
    throw new Error('Method not implemented.');
  }
  entries(): IterableIterator<[number, AnalyzedValue]> {
    throw new Error('Method not implemented.');
  }
  keys(): IterableIterator<number> {
    throw new Error('Method not implemented.');
  }
  values(): IterableIterator<AnalyzedValue> {
    throw new Error('Method not implemented.');
  }

  [Symbol.toStringTag]: string;
  private _get(key: number, nestings: number): { nestings: number; value: AnalyzedValue } | undefined {
    let res: { nestings: number; value: AnalyzedValue } | undefined;

    if (this.has(key)) {
      const result = this.get(key);

      if (result === undefined) {
        return undefined;
      }

      return { nestings, value: result };
    } else {
      for (const val of this) {
        if ('value' in val[1]) {
          if (val[1].value instanceof AnalyzedValues) {
            res = val[1].value._get(key, nestings + 1);
          }
          if (res !== undefined) {
            break;
          }
        }
      }
    }

    return res;
  }

  public get(key: number): AnalyzedValue | undefined {
    let res: AnalyzedValue | undefined;

    if (this.has(key)) {
      return super.get(key);
    } else {
      for (const val of this) {
        if ('value' in val[1]) {
          if (val[1].value instanceof AnalyzedValues) {
            res = val[1].value.get(key);
          }
          if (res !== undefined) {
            break;
          }
        }
      }
    }

    return res;
  }

  public getWithNestings(key: number): { nestings: number; value: AnalyzedValue } | undefined {
    return this._get(key, 0);
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
    } else if (byte == 0xc4 || byte == 0xc5 || byte == 0xc6) {
      const val = this._unpacker.unpackBinary();

      if (val != null) {
        const list = new AnalyzedValues();
        list.set(this._unpacker.offset - val.length - 1, { type: 'length', value: val.length });

        for (let i = 0; i < val.length; i++) {
          const off = this._unpacker.offset - (val.length - i);
          list.set(off, { type: 'byte', value: val[i] });
        }

        return { type: 'binary', value: list };
      }
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

      return { type: typeof val, value: val };
    }

    return { type: 'null', value: null };
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

export { AnalyzedValues };
