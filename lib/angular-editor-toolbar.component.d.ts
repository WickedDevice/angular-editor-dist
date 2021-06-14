import { ElementRef, EventEmitter, PipeTransform, Renderer2 } from '@angular/core';
import { AngularEditorService, UploadResponse } from './angular-editor.service';
import { HttpResponse, HttpEvent } from '@angular/common/http';
import { CustomClass } from './config';
import { SelectOption } from './ae-select/ae-select.component';
import { Observable } from 'rxjs';
import { ImageResizeService } from './image-resize.service';
export declare class AEButtonIsHiddenPipe implements PipeTransform {
    transform(name: string, hiddenButtons: any): boolean;
}
export declare class AngularEditorToolbarComponent {
    private r;
    private editorService;
    private er;
    private imageResizeSrvc;
    private doc;
    htmlMode: boolean;
    linkSelected: boolean;
    block: string;
    fontName: string;
    fontSize: string;
    foreColour: any;
    backColor: any;
    headings: SelectOption[];
    fontSizes: SelectOption[];
    customClassId: string;
    _customClasses: CustomClass[];
    customClassList: SelectOption[];
    tagMap: {
        BLOCKQUOTE: string;
        A: string;
    };
    select: string[];
    buttons: string[];
    id: string;
    uploadUrl: string;
    upload: (file: File) => Observable<HttpEvent<UploadResponse>>;
    showToolbar: boolean;
    fonts: SelectOption[];
    set customClasses(classes: CustomClass[]);
    set defaultFontName(value: string);
    set defaultFontSize(value: string);
    hiddenButtons: string[][];
    insertResourceCallback: (string: any) => string;
    execute: EventEmitter<string>;
    markdownEmitter: EventEmitter<boolean>;
    myInputFile: ElementRef;
    get isLinkButtonDisabled(): boolean;
    constructor(r: Renderer2, editorService: AngularEditorService, er: ElementRef, imageResizeSrvc: ImageResizeService, doc: any);
    /**
     * Trigger command from editor header buttons
     * @param command string from toolbar buttons
     */
    triggerCommand(command: string): void;
    /**
     * highlight editor buttons when cursor moved or positioning
     */
    triggerButtons(): void;
    /**
     * trigger highlight editor buttons when cursor moved or positioning in block
     */
    triggerBlocks(nodes: Node[]): void;
    /**
     * insert URL link
     */
    insertUrl(): void;
    /**
     * insert Video link
     */
    insertVideo(): void;
    insertResource(): Promise<void>;
    /** insert color */
    insertColor(color: string, where: string): void;
    /**
     * set font Name/family
     * @param foreColor string
     */
    setFontName(foreColor: string): void;
    /**
     * set font Size
     * @param fontSize string
     */
    setFontSize(fontSize: string): void;
    /**
     * toggle editor mode (WYSIWYG or SOURCE)
     * @param m boolean
     */
    setEditorMode(m: boolean): void;
    /**
     * Upload image when file is selected.
     */
    onFileChanged(event: any): void;
    emitMarkdown(): void;
    watchUploadImage(response: HttpResponse<{
        imageUrl: string;
    }>, event: any): void;
    /**
     * Set custom class
     */
    setCustomClass(classId: string): void;
    focus(): void;
}
