import * as i0 from "@angular/core";
export declare class ImageResizeService {
    hasBlobConstructor: boolean;
    hasArrayBufferViewSupport: boolean;
    hasToBlobSupport: boolean | ((callback: BlobCallback, type?: string, quality?: any) => void);
    hasBlobSupport: boolean | ((callback: BlobCallback, type?: string, quality?: any) => void);
    hasReaderSupport: boolean;
    constructor();
    resize(file: File, maxDimensions: {
        width: number;
        height: number;
    }, callback: any): boolean;
    isSupported(): boolean;
    _toBlob(canvas: any, type: any): any;
    _loadImage(image: any, file: any, callback?: any): void;
    _toFile(theBlob: Blob, fileName: string): File;
    static ɵfac: i0.ɵɵFactoryDef<ImageResizeService, never>;
    static ɵprov: i0.ɵɵInjectableDef<ImageResizeService>;
}
