declare class Unpacker {
    private _offset;
    private _buf;
    private _view;
    private _decoder;
    get offset(): number;
    constructor(data: Uint8Array);
    unpack(): any;
    unpackNull(): null;
    unpackBool(): boolean | null;
    unpackInt(): number | bigint | null;
    unpackFloat(): number | null;
    unpackString(): string | null;
    unpackBinary(): Uint8Array | null;
    unpackListLength(): number;
    unpackMapLength(): number;
    unpackList(): Array<any>;
    unpackMap(): Record<any, any>;
    reset(data?: Uint8Array | null): void;
}
export default Unpacker;
//# sourceMappingURL=unpacker.d.ts.map