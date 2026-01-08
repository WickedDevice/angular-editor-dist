import * as i0 from '@angular/core';
import { ElementRef, OnInit, EventEmitter, Renderer2, PipeTransform, AfterViewInit, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { HttpEvent, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as i7 from '@angular/forms';
import { ControlValueAccessor } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import * as i6 from '@angular/common';

interface CustomClass {
    name: string;
    class: string;
    tag?: string;
}
interface Font {
    name: string;
    class: string;
}
interface AngularEditorConfig {
    editable?: boolean;
    spellcheck?: boolean;
    height?: 'auto' | string;
    minHeight?: '0' | string;
    maxHeight?: 'auto' | string;
    width?: 'auto' | string;
    minWidth?: '0' | string;
    translate?: 'yes' | 'now' | string;
    enableToolbar?: boolean;
    showToolbar?: boolean;
    placeholder?: string;
    defaultParagraphSeparator?: string;
    defaultFontName?: string;
    defaultFontSize?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | string;
    uploadUrl?: string;
    upload?: (file: File) => Observable<HttpEvent<UploadResponse>>;
    uploadWithCredentials?: boolean;
    fonts?: Font[];
    customClasses?: CustomClass[];
    sanitize?: boolean;
    toolbarPosition?: 'top' | 'bottom';
    outline?: boolean;
    toolbarHiddenButtons?: string[][];
    rawPaste?: boolean;
    toolbarInsertResourceCallback?: (string: any) => string;
}

interface UploadResponse {
    imageUrl: string;
}
declare class AngularEditorService {
    private http;
    private doc;
    savedSelection: Range | null;
    selectedText: string;
    uploadUrl: string;
    uploadWithCredentials: boolean;
    constructor(http: HttpClient, doc: any);
    /**
     * Executed command from editor header buttons exclude toggleEditorMode
     * @param command string from triggerCommand
     */
    executeCommand(command: string, param?: string): void;
    editCmd(cmd: string, param: string): boolean;
    /**
     * Create URL link
     * @param url string from UI prompt
     */
    createLink(url: string): void;
    /**
     * insert color either font or background
     *
     * @param color color to be inserted
     * @param where where the color has to be inserted either text/background
     */
    insertColor(color: string, where: string): void;
    /**
     * Set font name
     * @param fontName string
     */
    setFontName(fontName: string): void;
    /**
     * Set font size
     * @param fontSize string
     */
    setFontSize(fontSize: string): void;
    /**
     * Create raw HTML
     * @param html HTML string
     */
    insertHtml(html: any): void;
    /**
     * save selection when the editor is focussed out
     */
    saveSelection: (el: ElementRef) => void;
    elementContainsSelection(el: any): boolean;
    isOrContainsDomElem(node: any, container: any): boolean;
    /**
     * restore selection when the editor is focused in
     *
     * saved selection when the editor is focused out
     */
    restoreSelection(): boolean;
    /**
     * setTimeout used for execute 'saveSelection' method in next event loop iteration
     */
    executeInNextQueueIteration(callbackFn: (...args: any[]) => any, timeout?: number): void;
    /** check any selection is made or not */
    private checkSelection;
    /**
     * Upload file to uploadUrl
     * @param file The file
     */
    uploadImage(file: File): Observable<HttpEvent<UploadResponse>>;
    /**
     * Insert image with Url
     * @param imageUrl The imageUrl.
     */
    insertImage(imageUrl: string): void;
    setDefaultParagraphSeparator(separator: string): void;
    createCustomClass(customClass: CustomClass): void;
    insertVideo(videoUrl: string): void;
    insertArbitraryHtml(html: string): void;
    private insertYouTubeVideoTag;
    private insertVimeoVideoTag;
    nextNode(node: any): any;
    getRangeSelectedNodes(range: any, includePartiallySelectedContainers: any): any[];
    getSelectedNodes(): any[];
    replaceWithOwnChildren(el: any): void;
    removeSelectedElements(tagNames: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularEditorService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularEditorService>;
}

interface SelectOption {
    label: string;
    value: string;
}
declare class AeSelectComponent implements OnInit, ControlValueAccessor {
    private elRef;
    private r;
    options: SelectOption[];
    isHidden: boolean;
    selectedOption: SelectOption;
    disabled: boolean;
    optionId: number;
    get label(): string;
    opened: boolean;
    get value(): string;
    hidden: string;
    changeEvent: EventEmitter<any>;
    labelButton: ElementRef;
    constructor(elRef: ElementRef, r: Renderer2);
    ngOnInit(): void;
    hide(): void;
    optionSelect(option: SelectOption, event: MouseEvent): void;
    toggleOpen(event: MouseEvent): void;
    onClick($event: MouseEvent): void;
    close(): void;
    get isOpen(): boolean;
    writeValue(value: any): void;
    setValue(value: any): void;
    onChange: any;
    onTouched: any;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    handleKeyDown($event: KeyboardEvent): void;
    _handleArrowDown($event: any): void;
    _handleArrowUp($event: any): void;
    _handleSpace($event: any): void;
    _handleEnter($event: any): void;
    _handleTab($event: any): void;
    _handleBackspace(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AeSelectComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AeSelectComponent, "ae-select", never, { "options": { "alias": "options"; "required": false; }; "isHidden": { "alias": "hidden"; "required": false; }; }, { "changeEvent": "change"; }, never, never, false, never>;
}

declare class ImageResizeService {
    hasBlobConstructor: boolean;
    hasArrayBufferViewSupport: boolean;
    hasToBlobSupport: boolean | ((callback: BlobCallback, type?: string, quality?: number) => void);
    hasBlobSupport: boolean | ((callback: BlobCallback, type?: string, quality?: number) => void);
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
    static ɵfac: i0.ɵɵFactoryDeclaration<ImageResizeService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ImageResizeService>;
}

declare class AEButtonIsHiddenPipe implements PipeTransform {
    transform(name: string, hiddenButtons: any): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<AEButtonIsHiddenPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<AEButtonIsHiddenPipe, "buttonIsHidden", false>;
}
declare class AeToolbarComponent {
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
    isButtonHidden(name: string): boolean;
    focus(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AeToolbarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AeToolbarComponent, "angular-editor-toolbar, ae-toolbar, div[aeToolbar]", never, { "id": { "alias": "id"; "required": false; }; "uploadUrl": { "alias": "uploadUrl"; "required": false; }; "upload": { "alias": "upload"; "required": false; }; "showToolbar": { "alias": "showToolbar"; "required": false; }; "fonts": { "alias": "fonts"; "required": false; }; "customClasses": { "alias": "customClasses"; "required": false; }; "defaultFontName": { "alias": "defaultFontName"; "required": false; }; "defaultFontSize": { "alias": "defaultFontSize"; "required": false; }; "hiddenButtons": { "alias": "hiddenButtons"; "required": false; }; "insertResourceCallback": { "alias": "insertResourceCallback"; "required": false; }; }, { "execute": "execute"; "markdownEmitter": "markdownEmitter"; }, never, ["*"], false, never>;
}

declare class AngularEditorComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {
    private r;
    private editorService;
    private doc;
    private sanitizer;
    private cdRef;
    private autoFocus;
    private onChange;
    private onTouched;
    modeVisual: boolean;
    showPlaceholder: boolean;
    disabled: boolean;
    focused: boolean;
    touched: boolean;
    changed: boolean;
    focusInstance: any;
    blurInstance: any;
    id: string;
    config: AngularEditorConfig;
    placeholder: string;
    tabIndex: number | null;
    html: any;
    markdownEmitter: EventEmitter<boolean>;
    textArea: ElementRef;
    editorWrapper: ElementRef;
    editorToolbar: AeToolbarComponent;
    customButtonsTemplateRef?: TemplateRef<any>;
    executeCommandFn: any;
    viewMode: EventEmitter<boolean>;
    /** emits `blur` event when focused out from the textarea */
    blurEvent: EventEmitter<FocusEvent>;
    /** emits `focus` event when focused in to the textarea */
    focusEvent: EventEmitter<FocusEvent>;
    tabindex: number;
    onFocus(): void;
    constructor(r: Renderer2, editorService: AngularEditorService, doc: any, sanitizer: DomSanitizer, cdRef: ChangeDetectorRef, defaultTabIndex: string, autoFocus: any);
    ngOnInit(): void;
    emitMarkdown($event: any): void;
    ngAfterViewInit(): void;
    onPaste(event: ClipboardEvent): string;
    plainPaste(e: any): void;
    doInsertHTML(name: string): void;
    /**
     * Executed command from editor header buttons
     * @param command string from triggerCommand
     * @param value
     */
    executeCommand(command: string, value?: string): void;
    /**
     * focus event
     */
    onTextAreaFocus(event: FocusEvent): void;
    /**
     * @description fires when cursor leaves textarea
     */
    onTextAreaMouseOut(event: MouseEvent): void;
    /**
     * blur event
     */
    onTextAreaBlur(event: FocusEvent): void;
    /**
     *  focus the text area when the editor is focused
     */
    focus(): void;
    /**
     * Executed from the contenteditable section while the input property changes
     * @param element html element from contenteditable
     */
    onContentChange(element: HTMLElement): void;
    /**
     * Set the function to be called
     * when the control receives a change event.
     *
     * @param fn a function
     */
    registerOnChange(fn: any): void;
    /**
     * Set the function to be called
     * when the control receives a touch event.
     *
     * @param fn a function
     */
    registerOnTouched(fn: any): void;
    /**
     * Write a new value to the element.
     *
     * @param value value to be executed when there is a change in contenteditable
     */
    writeValue(value: any): void;
    /**
     * refresh view/HTML of the editor
     *
     * @param value html string from the editor
     */
    refreshView(value: string): void;
    /**
     * toggles placeholder based on input string
     *
     * @param value A HTML string from the editor
     */
    togglePlaceholder(value: boolean): void;
    /**
     * Implements disabled state for this element
     *
     * @param isDisabled Disabled flag
     */
    setDisabledState(isDisabled: boolean): void;
    /**
     * toggles editor mode based on bToSource bool
     *
     * @param bToSource A boolean value from the editor
     */
    toggleEditorMode(bToSource: boolean): void;
    /**
     * toggles editor buttons when cursor moved or positioning
     *
     * Send a node array from the contentEditable of the editor
     */
    exec(): void;
    private configure;
    getFonts(): {
        label: string;
        value: string;
    }[];
    getCustomTags(): string;
    ngOnDestroy(): void;
    filterStyles(html: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularEditorComponent, [null, null, null, null, null, { attribute: "tabindex"; }, { attribute: "autofocus"; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AngularEditorComponent, "angular-editor", never, { "id": { "alias": "id"; "required": false; }; "config": { "alias": "config"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "tabIndex": { "alias": "tabIndex"; "required": false; }; }, { "html": "html"; "markdownEmitter": "markdownEmitter"; "viewMode": "viewMode"; "blurEvent": "blur"; "focusEvent": "focus"; }, ["customButtonsTemplateRef"], never, false, never>;
}

declare class AeButtonComponent {
    iconName: string;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<AeButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AeButtonComponent, "ae-button, button[aeButton]", never, { "iconName": { "alias": "iconName"; "required": false; }; }, {}, never, ["*"], false, never>;
}

declare class AeToolbarSetComponent {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<AeToolbarSetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AeToolbarSetComponent, "ae-toolbar-set, [aeToolbarSet]", never, {}, {}, never, ["*"], false, never>;
}

declare class AngularEditorModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularEditorModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AngularEditorModule, [typeof AngularEditorComponent, typeof AeToolbarComponent, typeof AeSelectComponent, typeof AeButtonComponent, typeof AeToolbarSetComponent, typeof AEButtonIsHiddenPipe], [typeof i6.CommonModule, typeof i7.FormsModule, typeof i7.ReactiveFormsModule], [typeof AngularEditorComponent, typeof AeToolbarComponent, typeof AeButtonComponent, typeof AeToolbarSetComponent, typeof AEButtonIsHiddenPipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AngularEditorModule>;
}

export { AEButtonIsHiddenPipe, AeButtonComponent, AeSelectComponent, AeToolbarComponent, AeToolbarSetComponent, AngularEditorComponent, AngularEditorModule, AngularEditorService };
export type { AngularEditorConfig, CustomClass, SelectOption, UploadResponse };
