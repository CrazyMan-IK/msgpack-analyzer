declare class Packer {
    private _offset;
    private _bufSize;
    private _buf;
    private _view;
    private _encoder;
    constructor(bufSize?: number);
    private _tryResize;
    private _putBytes;
    pack(v: unknown): Packer;
    packNull(): Packer;
    packBool(v: boolean | null): Packer;
    packInt(v: number | null): Packer;
    packFloat(v: number | null): Packer;
    packString(v: string | null): Packer;
    packStringEmptyIsNull(v: string | null): Packer;
    packBinary(buffer: Uint8Array | null): Packer;
    packListLength(length: number | null): Packer;
    packMapLength(length: number | null): Packer;
    packList(v: Array<any> | null): Packer;
    packMap(v: Record<any, any> | null): Packer;
    takeBytes(): Uint8Array;
    reset(): void;
}
export default Packer;
//# sourceMappingURL=packer.d.ts.map