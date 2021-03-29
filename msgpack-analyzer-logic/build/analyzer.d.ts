declare type AnalyzedValue = any | AnalyzedValues | AnalyzedValue[];
interface AnalyzedValues extends Map<number, AnalyzedValue> {
}
declare class Analyzer {
    private _buf;
    private _view;
    private _unpacker;
    constructor(data: Uint8Array);
    private _analyze;
    analyze(): AnalyzedValues;
}
export default Analyzer;
//# sourceMappingURL=analyzer.d.ts.map