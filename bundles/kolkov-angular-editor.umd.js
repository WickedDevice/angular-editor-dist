(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('uuid'), require('@angular/common/http'), require('@angular/forms'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define('@kolkov/angular-editor', ['exports', '@angular/core', '@angular/common', 'uuid', '@angular/common/http', '@angular/forms', '@angular/platform-browser'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.kolkov = global.kolkov || {}, global.kolkov['angular-editor'] = {}), global.ng.core, global.ng.common, global.uuid, global.ng.common.http, global.ng.forms, global.ng.platformBrowser));
}(this, (function (exports, i0, i1$1, uuid, i1, forms, i2) { 'use strict';

    var AngularEditorService = /** @class */ (function () {
        function AngularEditorService(http, doc) {
            var _this = this;
            this.http = http;
            this.doc = doc;
            /**
             * save selection when the editor is focussed out
             */
            this.saveSelection = function (el) {
                if (!_this.elementContainsSelection(el.nativeElement)) {
                    return; // do not save browser selections that are outside the editor
                }
                if (_this.doc.getSelection) {
                    var sel = _this.doc.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        _this.savedSelection = sel.getRangeAt(0);
                        _this.selectedText = sel.toString();
                    }
                }
                else if (_this.doc.getSelection && _this.doc.createRange) {
                    _this.savedSelection = document.createRange();
                }
                else {
                    _this.savedSelection = null;
                }
            };
        }
        /**
         * Executed command from editor header buttons exclude toggleEditorMode
         * @param command string from triggerCommand
         */
        AngularEditorService.prototype.executeCommand = function (command, param) {
            if (param === void 0) { param = null; }
            var commands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
            if (commands.includes(command)) {
                this.editCmd('formatBlock', command);
                return;
            }
            this.editCmd(command, param);
        };
        AngularEditorService.prototype.editCmd = function (cmd, param) {
            // console.log(`executeCommand: ${command} ${param}`);
            this.restoreSelection(); // Prevent lost focus issues --JCN
            // console.log('restoring selection');
            return !!this.doc.execCommand(cmd, false, param);
        };
        /**
         * Create URL link
         * @param url string from UI prompt
         */
        AngularEditorService.prototype.createLink = function (url) {
            if (!url.includes('http')) {
                this.editCmd('createlink', url);
            }
            else {
                var newUrl = '<a href="' + url + '" target="_blank">' + this.selectedText + '</a>';
                this.insertHtml(newUrl);
            }
        };
        /**
         * insert color either font or background
         *
         * @param color color to be inserted
         * @param where where the color has to be inserted either text/background
         */
        AngularEditorService.prototype.insertColor = function (color, where) {
            var restored = this.restoreSelection();
            if (restored) {
                if (where === 'textColor') {
                    this.editCmd('foreColor', color);
                }
                else {
                    this.editCmd('hiliteColor', color);
                }
            }
        };
        /**
         * Set font name
         * @param fontName string
         */
        AngularEditorService.prototype.setFontName = function (fontName) {
            this.editCmd('fontName', fontName);
        };
        /**
         * Set font size
         * @param fontSize string
         */
        AngularEditorService.prototype.setFontSize = function (fontSize) {
            this.editCmd('fontSize', fontSize);
        };
        /**
         * Create raw HTML
         * @param html HTML string
         */
        AngularEditorService.prototype.insertHtml = function (html) {
            var isHTMLInserted = this.editCmd('insertHTML', html);
            if (!isHTMLInserted) {
                // retry...sometimes its needed
                isHTMLInserted = this.editCmd('insertHTML', html);
                if (!isHTMLInserted) {
                    throw new Error('Unable to perform the operation');
                }
            }
        };
        AngularEditorService.prototype.elementContainsSelection = function (el) {
            if (!el) {
                return false;
            }
            var view = this.doc.defaultView;
            var sel = view.getSelection();
            if (sel && sel.rangeCount > 0) {
                return this.isOrContainsDomElem(sel.getRangeAt(0).commonAncestorContainer, el);
            }
            return false;
        };
        AngularEditorService.prototype.isOrContainsDomElem = function (node, container) {
            while (node) {
                if (node === container) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        };
        /**
         * restore selection when the editor is focused in
         *
         * saved selection when the editor is focused out
         */
        AngularEditorService.prototype.restoreSelection = function () {
            if (this.savedSelection) {
                if (this.doc.getSelection) {
                    // console.log(`***Restoring selection : ${this.savedSelection.startContainer.nodeName} ${this.savedSelection.endContainer.nodeName}`);
                    var sel = this.doc.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(this.savedSelection);
                    return true;
                }
                else if (this.doc.getSelection /*&& this.savedSelection.select*/) {
                    // this.savedSelection.select();
                    return true;
                }
            }
            else {
                return false;
            }
        };
        /**
         * setTimeout used for execute 'saveSelection' method in next event loop iteration
         */
        AngularEditorService.prototype.executeInNextQueueIteration = function (callbackFn, timeout) {
            if (timeout === void 0) { timeout = 1e2; }
            setTimeout(callbackFn, timeout);
        };
        /** check any selection is made or not */
        AngularEditorService.prototype.checkSelection = function () {
            var selectedText = this.savedSelection.toString();
            if (selectedText.length === 0) {
                throw new Error('No Selection Made');
            }
            return true;
        };
        /**
         * Upload file to uploadUrl
         * @param file The file
         */
        AngularEditorService.prototype.uploadImage = function (file) {
            var uploadData = new FormData();
            uploadData.append('file', file, file.name);
            return this.http.post(this.uploadUrl, uploadData, {
                reportProgress: true,
                observe: 'events',
                withCredentials: this.uploadWithCredentials,
            });
        };
        /**
         * Insert image with Url
         * @param imageUrl The imageUrl.
         */
        AngularEditorService.prototype.insertImage = function (imageUrl) {
            var id = uuid.v4();
            var div = "\n    <figure id=" + id + " style=\"text-align:center\" contenteditable=\"false\" >\n    <img src=\"" + imageUrl + "\"   style=\"margin:0 auto\">\n    </figure>\n    <br>\n    ";
            this.insertHtml(div);
            // this.doc.getElementById(`close-${id}`).addEventListener('click', () => {
            //   const ele = this.doc.getElementById(id);
            //   if (ele) {
            //     ele.remove();
            //   }
            // })
        };
        AngularEditorService.prototype.setDefaultParagraphSeparator = function (separator) {
            this.editCmd('defaultParagraphSeparator', separator);
        };
        AngularEditorService.prototype.createCustomClass = function (customClass) {
            var newTag = this.selectedText;
            if (customClass) {
                var tagName = customClass.tag ? customClass.tag : 'span';
                newTag = '<' + tagName + ' class="' + customClass.class + '">' + this.selectedText + '</' + tagName + '>';
            }
            this.insertHtml(newTag);
        };
        AngularEditorService.prototype.insertVideo = function (videoUrl) {
            if (videoUrl.match('www.youtube.com')) {
                this.insertYouTubeVideoTag(videoUrl);
            }
            if (videoUrl.match('vimeo.com')) {
                this.insertVimeoVideoTag(videoUrl);
            }
        };
        AngularEditorService.prototype.insertYouTubeVideoTag = function (videoUrl) {
            var id = videoUrl.split('v=')[1];
            var thumbnail = "\n    <iframe width=\"560\" height=\"315\"\n    src=\"https://www.youtube.com/embed/" + id + "\"\n    frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\"\n    allowfullscreen></iframe>\n    <br>\n    ";
            this.insertHtml(thumbnail);
        };
        AngularEditorService.prototype.insertVimeoVideoTag = function (videoUrl) {
            var id = videoUrl.split('.com/')[1];
            var thumbnail = "<iframe src=\"https://player.vimeo.com/video/" + id + "\"\n    width=\"640\" height=\"360\" frameborder=\"0\" allow=\"autoplay; fullscreen; picture-in-picture\" all owfullscreen></iframe>\n    <br>";
            // const sub = this.http.get<any>(`https://vimeo.com/api/oembed.json?url=${videoUrl}`).subscribe(data => {
            //   const imageUrl = data.thumbnail_url_with_play_button;
            //   const thumbnail = `
            //   <iframe width="560" height="315"
            //   src="https://www.youtube.com/embed/${id}"
            //   frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            //   allowfullscreen></iframe>
            //   `;
            //   this.insertHtml(thumbnail);
            //   sub.unsubscribe();
            // });
            this.insertHtml(thumbnail);
        };
        AngularEditorService.prototype.nextNode = function (node) {
            if (node.hasChildNodes()) {
                return node.firstChild;
            }
            else {
                while (node && !node.nextSibling) {
                    node = node.parentNode;
                }
                if (!node) {
                    return null;
                }
                return node.nextSibling;
            }
        };
        AngularEditorService.prototype.getRangeSelectedNodes = function (range, includePartiallySelectedContainers) {
            var node = range.startContainer;
            var endNode = range.endContainer;
            var rangeNodes = [];
            // Special case for a range that is contained within a single node
            if (node === endNode) {
                rangeNodes = [node];
            }
            else {
                // Iterate nodes until we hit the end container
                while (node && node !== endNode) {
                    rangeNodes.push(node = this.nextNode(node));
                }
                // Add partially selected nodes at the start of the range
                node = range.startContainer;
                while (node && node !== range.commonAncestorContainer) {
                    rangeNodes.unshift(node);
                    node = node.parentNode;
                }
            }
            // Add ancestors of the range container, if required
            if (includePartiallySelectedContainers) {
                node = range.commonAncestorContainer;
                while (node) {
                    rangeNodes.push(node);
                    node = node.parentNode;
                }
            }
            return rangeNodes;
        };
        AngularEditorService.prototype.getSelectedNodes = function () {
            var nodes = [];
            if (this.doc.getSelection) {
                var sel = this.doc.getSelection();
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    nodes.push.apply(nodes, this.getRangeSelectedNodes(sel.getRangeAt(i), true));
                }
            }
            return nodes;
        };
        AngularEditorService.prototype.replaceWithOwnChildren = function (el) {
            var parent = el.parentNode;
            while (el.hasChildNodes()) {
                parent.insertBefore(el.firstChild, el);
            }
            parent.removeChild(el);
        };
        AngularEditorService.prototype.removeSelectedElements = function (tagNames) {
            var _this = this;
            var tagNamesArray = tagNames.toLowerCase().split(',');
            this.getSelectedNodes().forEach(function (node) {
                if (node.nodeType === 1 &&
                    tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {
                    // Remove the node and replace it with its children
                    _this.replaceWithOwnChildren(node);
                }
            });
        };
        return AngularEditorService;
    }());
    AngularEditorService.ɵfac = function AngularEditorService_Factory(t) { return new (t || AngularEditorService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i1$1.DOCUMENT)); };
    AngularEditorService.ɵprov = i0.ɵɵdefineInjectable({ token: AngularEditorService, factory: AngularEditorService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AngularEditorService, [{
                type: i0.Injectable
            }], function () {
            return [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [i1$1.DOCUMENT]
                        }] }];
        }, null);
    })();

    var angularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '0',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            { class: 'arial', name: 'Arial' },
            { class: 'times-new-roman', name: 'Times New Roman' },
            { class: 'calibri', name: 'Calibri' },
            { class: 'comic-sans-ms', name: 'Comic Sans MS' }
        ],
        uploadUrl: 'v1/image',
        uploadWithCredentials: false,
        sanitize: true,
        toolbarPosition: 'top',
        outline: true,
    };

    function isDefined(value) {
        return value !== undefined && value !== null;
    }

    var ImageResizeService = /** @class */ (function () {
        function ImageResizeService() {
            this.hasBlobConstructor = typeof (Blob) !== 'undefined' && (function () {
                try {
                    return Boolean(new Blob());
                }
                catch (e) {
                    return false;
                }
            }());
            this.hasArrayBufferViewSupport = this.hasBlobConstructor && typeof (Uint8Array) !== 'undefined' && (function () {
                try {
                    return new Blob([new Uint8Array(100)]).size === 100;
                }
                catch (e) {
                    return false;
                }
            }());
            this.hasToBlobSupport = (typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.toBlob : false);
            this.hasBlobSupport = (this.hasToBlobSupport ||
                (typeof Uint8Array !== 'undefined' && typeof ArrayBuffer !== 'undefined' && typeof atob !== 'undefined'));
            this.hasReaderSupport = (typeof FileReader !== 'undefined' || typeof URL !== 'undefined');
        }
        ImageResizeService.prototype.resize = function (file, maxDimensions, callback) {
            var _this = this;
            if (typeof maxDimensions === 'function') {
                callback = maxDimensions;
                maxDimensions = {
                    width: 640,
                    height: 480
                };
            }
            if (!this.isSupported() || !file.type.match(/image.*/)) {
                callback(file, false);
                return false;
            }
            if (file.type.match(/image\/gif/)) {
                // Not attempting, could be an animated gif
                callback(file, false);
                // TODO: use https://github.com/antimatter15/whammy to convert gif to webm
                return false;
            }
            var image = document.createElement('img');
            image.onload = function (imgEvt) {
                var width = image.width;
                var height = image.height;
                var isTooLarge = false;
                if (width >= height && width > maxDimensions.width) {
                    isTooLarge = true;
                }
                else if (height > maxDimensions.height) {
                    isTooLarge = true;
                }
                if (!isTooLarge) {
                    // early exit; no need to resize
                    callback(file, false);
                    return;
                }
                var scaleRatio = maxDimensions.width / width;
                // TODO number of resampling steps
                // const steps = Math.ceil(Math.log(width / (width * scaleRatio)) / Math.log(2));
                width *= scaleRatio;
                height *= scaleRatio;
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(image, 0, 0, width, height);
                if (_this.hasToBlobSupport) {
                    canvas.toBlob(function (blob) {
                        callback(blob, true);
                    }, file.type);
                }
                else {
                    var blob = _this._toBlob(canvas, file.type);
                    callback(blob, true);
                }
            };
            this._loadImage(image, file);
            return true;
        };
        ImageResizeService.prototype.isSupported = function () {
            return ((typeof (HTMLCanvasElement) !== 'undefined')
                && this.hasBlobSupport
                && this.hasReaderSupport);
        };
        ImageResizeService.prototype._toBlob = function (canvas, type) {
            var dataURI = canvas.toDataURL(type);
            var dataURIParts = dataURI.split(',');
            var byteString;
            if (dataURIParts[0].indexOf('base64') >= 0) {
                // Convert base64 to raw binary data held in a string:
                byteString = atob(dataURIParts[1]);
            }
            else {
                // Convert base64/URLEncoded data component to raw binary data:
                byteString = decodeURIComponent(dataURIParts[1]);
            }
            var arrayBuffer = new ArrayBuffer(byteString.length);
            var intArray = new Uint8Array(arrayBuffer);
            for (var i = 0; i < byteString.length; i += 1) {
                intArray[i] = byteString.charCodeAt(i);
            }
            var mimeString = dataURIParts[0].split(':')[1].split(';')[0];
            var blob = null;
            if (this.hasBlobConstructor) {
                blob = new Blob([this.hasArrayBufferViewSupport ? intArray : arrayBuffer], { type: mimeString });
            }
            else {
                blob = new Blob([arrayBuffer]);
            }
            return blob;
        };
        ImageResizeService.prototype._loadImage = function (image, file, callback) {
            if (typeof (URL) === 'undefined') {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    image.src = evt.target.result;
                    if (callback) {
                        callback();
                    }
                };
                reader.readAsDataURL(file);
            }
            else {
                image.src = URL.createObjectURL(file);
                if (callback) {
                    callback();
                }
            }
        };
        ImageResizeService.prototype._toFile = function (theBlob, fileName) {
            var b = theBlob;
            b.lastModifiedDate = new Date();
            b.name = fileName;
            return theBlob;
        };
        return ImageResizeService;
    }());
    ImageResizeService.ɵfac = function ImageResizeService_Factory(t) { return new (t || ImageResizeService)(); };
    ImageResizeService.ɵprov = i0.ɵɵdefineInjectable({ token: ImageResizeService, factory: ImageResizeService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(ImageResizeService, [{
                type: i0.Injectable
            }], function () { return []; }, null);
    })();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var _c0 = ["fileInput"];
    var AngularEditorToolbarComponent = /** @class */ (function () {
        function AngularEditorToolbarComponent(r, editorService, er, imageResizeSrvc, doc) {
            this.r = r;
            this.editorService = editorService;
            this.er = er;
            this.imageResizeSrvc = imageResizeSrvc;
            this.doc = doc;
            this.htmlMode = false;
            this.linkSelected = false;
            this.block = 'default';
            this.fontName = 'Times New Roman';
            this.fontSize = '3';
            this.headings = [
                {
                    label: 'Heading 1',
                    value: 'h1',
                },
                {
                    label: 'Heading 2',
                    value: 'h2',
                },
                {
                    label: 'Paragraph',
                    value: 'p',
                },
                {
                    label: 'Predefined',
                    value: 'pre'
                },
                {
                    label: 'Standard',
                    value: 'div'
                },
                {
                    label: 'default',
                    value: 'default'
                }
            ];
            this.fontSizes = [
                {
                    label: '1',
                    value: '1',
                },
                {
                    label: '2',
                    value: '2',
                },
                {
                    label: '3',
                    value: '3',
                },
                {
                    label: '4',
                    value: '4',
                },
                {
                    label: '5',
                    value: '5',
                },
                {
                    label: '6',
                    value: '6',
                },
                {
                    label: '7',
                    value: '7',
                }
            ];
            this.customClassId = '-1';
            this.customClassList = [{ label: '', value: '' }];
            // uploadUrl: string;
            this.tagMap = {
                BLOCKQUOTE: 'indent',
                A: 'link'
            };
            this.select = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'DIV'];
            // buttons = ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'justifyLeft', 'justifyCenter',
            //   'justifyRight', 'justifyFull', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'link'];
            this.buttons = ['bold', 'italic', 'underline', 'subscript', 'superscript', 'justifyLeft', 'justifyCenter',
                'justifyRight', 'justifyFull', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'link'];
            this.fonts = [{ label: '', value: '' }];
            this.execute = new i0.EventEmitter();
            this.markdownEmitter = new i0.EventEmitter();
        }
        Object.defineProperty(AngularEditorToolbarComponent.prototype, "customClasses", {
            set: function (classes) {
                if (classes) {
                    this._customClasses = classes;
                    this.customClassList = this._customClasses.map(function (x, i) { return ({ label: x.name, value: i.toString() }); });
                    this.customClassList.unshift({ label: 'Clear Class', value: '-1' });
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularEditorToolbarComponent.prototype, "defaultFontName", {
            set: function (value) {
                if (value) {
                    this.fontName = value;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularEditorToolbarComponent.prototype, "defaultFontSize", {
            set: function (value) {
                if (value) {
                    this.fontSize = value;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularEditorToolbarComponent.prototype, "isLinkButtonDisabled", {
            get: function () {
                return this.htmlMode || !Boolean(this.editorService.selectedText);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Trigger command from editor header buttons
         * @param command string from toolbar buttons
         */
        AngularEditorToolbarComponent.prototype.triggerCommand = function (command) {
            this.execute.emit(command);
        };
        /**
         * highlight editor buttons when cursor moved or positioning
         */
        AngularEditorToolbarComponent.prototype.triggerButtons = function () {
            var _this = this;
            if (!this.showToolbar) {
                return;
            }
            this.buttons.forEach(function (e) {
                var result = _this.doc.queryCommandState(e);
                var elementById = _this.doc.getElementById(e + '-' + _this.id);
                if (result && elementById) {
                    _this.r.addClass(elementById, 'active');
                }
                else {
                    _this.r.removeClass(elementById, 'active');
                }
            });
        };
        /**
         * trigger highlight editor buttons when cursor moved or positioning in block
         */
        AngularEditorToolbarComponent.prototype.triggerBlocks = function (nodes) {
            var _this = this;
            if (!this.showToolbar) {
                return;
            }
            this.linkSelected = nodes.findIndex(function (x) { return x.nodeName === 'A'; }) > -1;
            var found = false;
            this.select.forEach(function (y) {
                var node = nodes.find(function (x) { return x.nodeName === y; });
                if (node !== undefined && y === node.nodeName) {
                    if (found === false) {
                        _this.block = node.nodeName.toLowerCase();
                        found = true;
                    }
                }
                else if (found === false) {
                    _this.block = 'default';
                }
            });
            found = false;
            if (this._customClasses) {
                this._customClasses.forEach(function (y, index) {
                    var node = nodes.find(function (x) {
                        if (x instanceof Element) {
                            return x.className === y.class;
                        }
                    });
                    if (node !== undefined) {
                        if (found === false) {
                            _this.customClassId = index.toString();
                            found = true;
                        }
                    }
                    else if (found === false) {
                        _this.customClassId = '-1';
                    }
                });
            }
            Object.keys(this.tagMap).map(function (e) {
                var elementById = _this.doc.getElementById(_this.tagMap[e] + '-' + _this.id);
                var node = nodes.find(function (x) { return x.nodeName === e; });
                if (node !== undefined && e === node.nodeName) {
                    _this.r.addClass(elementById, 'active');
                }
                else {
                    _this.r.removeClass(elementById, 'active');
                }
            });
            this.foreColour = this.doc.queryCommandValue('ForeColor');
            this.fontSize = this.doc.queryCommandValue('FontSize');
            this.fontName = this.doc.queryCommandValue('FontName').replace(/"/g, '');
            this.backColor = this.doc.queryCommandValue('backColor');
        };
        /**
         * insert URL link
         */
        AngularEditorToolbarComponent.prototype.insertUrl = function () {
            var url = 'https:\/\/';
            var selection = this.editorService.savedSelection;
            if (selection && selection.commonAncestorContainer.parentElement.nodeName === 'A') {
                var parent = selection.commonAncestorContainer.parentElement;
                if (parent.href !== '') {
                    url = parent.href;
                }
            }
            url = prompt('Insert URL link', url);
            if (url && url !== '' && url !== 'https://') {
                this.editorService.createLink(url);
            }
        };
        /**
         * insert Video link
         */
        AngularEditorToolbarComponent.prototype.insertVideo = function () {
            this.execute.emit('');
            var url = prompt('Insert Video link', "https://");
            if (url && url !== '' && url !== "https://") {
                this.editorService.insertVideo(url);
            }
        };
        /** insert color */
        AngularEditorToolbarComponent.prototype.insertColor = function (color, where) {
            this.editorService.insertColor(color, where);
            this.execute.emit('');
        };
        /**
         * set font Name/family
         * @param foreColor string
         */
        AngularEditorToolbarComponent.prototype.setFontName = function (foreColor) {
            this.editorService.setFontName(foreColor);
            this.execute.emit('');
        };
        /**
         * set font Size
         * @param fontSize string
         */
        AngularEditorToolbarComponent.prototype.setFontSize = function (fontSize) {
            this.editorService.setFontSize(fontSize);
            this.execute.emit('');
        };
        /**
         * toggle editor mode (WYSIWYG or SOURCE)
         * @param m boolean
         */
        AngularEditorToolbarComponent.prototype.setEditorMode = function (m) {
            var toggleEditorModeButton = this.doc.getElementById('toggleEditorMode' + '-' + this.id);
            if (m) {
                this.r.addClass(toggleEditorModeButton, 'active');
            }
            else {
                this.r.removeClass(toggleEditorModeButton, 'active');
            }
            this.htmlMode = m;
        };
        /**
         * Upload image when file is selected.
         */
        AngularEditorToolbarComponent.prototype.onFileChanged = function (event) {
            var _this = this;
            var file = event.target.files[0];
            if (file.type.includes('image/')) {
                if (this.upload) {
                    this.upload(file).subscribe(function () { return _this.watchUploadImage; });
                }
                else if (this.uploadUrl) {
                    this.editorService.uploadImage(file).subscribe(function () { return _this.watchUploadImage; });
                }
                else {
                    this.imageResizeSrvc.resize(file, { width: 360, height: 240 }, function (blob, didItResize) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var fr = e.currentTarget;
                            _this.editorService.insertImage(fr.result.toString());
                        };
                        reader.readAsDataURL(blob);
                    });
                    //
                }
            }
            event.srcElement.value = "";
        };
        AngularEditorToolbarComponent.prototype.emitMarkdown = function () {
            this.markdownEmitter.emit(true);
        };
        AngularEditorToolbarComponent.prototype.watchUploadImage = function (response, event) {
            var imageUrl = response.body.imageUrl;
            this.editorService.insertImage(imageUrl);
            event.srcElement.value = null;
        };
        /**
         * Set custom class
         */
        AngularEditorToolbarComponent.prototype.setCustomClass = function (classId) {
            if (classId === '-1') {
                this.execute.emit('clear');
            }
            else {
                this.editorService.createCustomClass(this._customClasses[+classId]);
            }
        };
        AngularEditorToolbarComponent.prototype.isButtonHidden = function (name) {
            var e_1, _a;
            if (!name) {
                return false;
            }
            if (!(this.hiddenButtons instanceof Array)) {
                return false;
            }
            var result;
            try {
                for (var _b = __values(this.hiddenButtons), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var arr = _c.value;
                    if (arr instanceof Array) {
                        result = arr.find(function (item) { return item === name; });
                    }
                    if (result) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result !== undefined;
        };
        AngularEditorToolbarComponent.prototype.focus = function () {
            this.execute.emit('focus');
            console.log('focused');
        };
        return AngularEditorToolbarComponent;
    }());
    AngularEditorToolbarComponent.ɵfac = function AngularEditorToolbarComponent_Factory(t) { return new (t || AngularEditorToolbarComponent)(i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(AngularEditorService), i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(ImageResizeService), i0.ɵɵdirectiveInject(i1$1.DOCUMENT)); };
    AngularEditorToolbarComponent.ɵcmp = i0.ɵɵdefineComponent({ type: AngularEditorToolbarComponent, selectors: [["angular-editor-toolbar"]], viewQuery: function AngularEditorToolbarComponent_Query(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵstaticViewQuery(_c0, true);
            }
            if (rf & 2) {
                var _t;
                i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.myInputFile = _t.first);
            }
        }, inputs: { id: "id", uploadUrl: "uploadUrl", upload: "upload", showToolbar: "showToolbar", fonts: "fonts", customClasses: "customClasses", defaultFontName: "defaultFontName", defaultFontSize: "defaultFontSize", hiddenButtons: "hiddenButtons" }, outputs: { execute: "execute", markdownEmitter: "markdownEmitter" }, decls: 51, vars: 56, consts: [[1, "angular-editor-toolbar", 3, "hidden"], [2, "width", "84%"], [1, "angular-editor-toolbar-set"], ["type", "button", "title", "Undo", "tabindex", "-1", 1, "angular-editor-button", 3, "hidden", "click"], [1, "fa", "fa-undo"], ["type", "button", "title", "Redo", "tabindex", "-1", 1, "angular-editor-button", 3, "hidden", "click"], [1, "fa", "fa-repeat"], ["type", "button", "title", "Bold", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-bold"], ["type", "button", "title", "Italic", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-italic"], ["type", "button", "title", "Underline", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-underline"], ["type", "button", "title", "Subscript", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-subscript"], ["type", "button", "title", "Superscript", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-superscript"], ["type", "button", "title", "Justify Left", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-align-left"], ["type", "button", "title", "Justify Center", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-align-center"], ["type", "button", "title", "Justify Right", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-align-right"], ["type", "button", "title", "Justify Full", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-align-justify"], ["type", "button", "title", "Indent", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-indent"], ["type", "button", "title", "Outdent", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-outdent"], ["type", "button", "title", "Unordered List", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-list-ul"], ["type", "button", "title", "Ordered List", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-list-ol"], ["type", "button", "title", "Insert Link", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-link"], ["type", "button", "title", "Unlink", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-chain-broken"], ["accept", "image/*", "type", "file", 1, "inputfile", 2, "display", "none", 3, "change"], ["fileInput", ""], ["type", "button", "title", "Insert Image", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-image"], ["type", "button", "title", "Insert Video", "tabindex", "-1", 1, "angular-editor-button", 3, "id", "disabled", "hidden", "click"], [1, "fa", "fa-video-camera"], [2, "width", "130px", "padding-top", "6px", "text-align", "right"], ["type", "button", "tabindex", "-1", "data-cy", "markdown-button", 1, "markdown", 3, "id", "hidden", "click"]], template: function AngularEditorToolbarComponent_Template(rf, ctx) {
            if (rf & 1) {
                var _r1_1 = i0.ɵɵgetCurrentView();
                i0.ɵɵelementStart(0, "div", 0);
                i0.ɵɵelementStart(1, "div", 1);
                i0.ɵɵelementStart(2, "div", 2);
                i0.ɵɵelementStart(3, "button", 3);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_3_listener() { return ctx.triggerCommand("undo"); });
                i0.ɵɵelement(4, "i", 4);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(5, "button", 5);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_5_listener() { return ctx.triggerCommand("redo"); });
                i0.ɵɵelement(6, "i", 6);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(7, "div", 2);
                i0.ɵɵelementStart(8, "button", 7);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_8_listener() { return ctx.triggerCommand("bold"); });
                i0.ɵɵelement(9, "i", 8);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(10, "button", 9);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_10_listener() { return ctx.triggerCommand("italic"); });
                i0.ɵɵelement(11, "i", 10);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(12, "button", 11);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_12_listener() { return ctx.triggerCommand("underline"); });
                i0.ɵɵelement(13, "i", 12);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(14, "button", 13);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_14_listener() { return ctx.triggerCommand("subscript"); });
                i0.ɵɵelement(15, "i", 14);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(16, "button", 15);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_16_listener() { return ctx.triggerCommand("superscript"); });
                i0.ɵɵelement(17, "i", 16);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(18, "div", 2);
                i0.ɵɵelementStart(19, "button", 17);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_19_listener() { return ctx.triggerCommand("justifyLeft"); });
                i0.ɵɵelement(20, "i", 18);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(21, "button", 19);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_21_listener() { return ctx.triggerCommand("justifyCenter"); });
                i0.ɵɵelement(22, "i", 20);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(23, "button", 21);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_23_listener() { return ctx.triggerCommand("justifyRight"); });
                i0.ɵɵelement(24, "i", 22);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(25, "button", 23);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_25_listener() { return ctx.triggerCommand("justifyFull"); });
                i0.ɵɵelement(26, "i", 24);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(27, "div", 2);
                i0.ɵɵelementStart(28, "button", 25);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_28_listener() { return ctx.triggerCommand("indent"); });
                i0.ɵɵelement(29, "i", 26);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(30, "button", 27);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_30_listener() { return ctx.triggerCommand("outdent"); });
                i0.ɵɵelement(31, "i", 28);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(32, "div", 2);
                i0.ɵɵelementStart(33, "button", 29);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_33_listener() { return ctx.triggerCommand("insertUnorderedList"); });
                i0.ɵɵelement(34, "i", 30);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(35, "button", 31);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_35_listener() { return ctx.triggerCommand("insertOrderedList"); });
                i0.ɵɵelement(36, "i", 32);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(37, "div", 2);
                i0.ɵɵelementStart(38, "button", 33);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_38_listener() { return ctx.insertUrl(); });
                i0.ɵɵelement(39, "i", 34);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(40, "button", 35);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_40_listener() { return ctx.triggerCommand("unlink"); });
                i0.ɵɵelement(41, "i", 36);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(42, "input", 37, 38);
                i0.ɵɵlistener("change", function AngularEditorToolbarComponent_Template_input_change_42_listener($event) { return ctx.onFileChanged($event); });
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(44, "button", 39);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_44_listener() { i0.ɵɵrestoreView(_r1_1); var _r0 = i0.ɵɵreference(43); ctx.focus(); return _r0.click(); });
                i0.ɵɵelement(45, "i", 40);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(46, "button", 41);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_46_listener() { return ctx.insertVideo(); });
                i0.ɵɵelement(47, "i", 42);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(48, "div", 43);
                i0.ɵɵelementStart(49, "button", 44);
                i0.ɵɵlistener("click", function AngularEditorToolbarComponent_Template_button_click_49_listener() { return ctx.emitMarkdown(); });
                i0.ɵɵtext(50, " Markdown Mode ");
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
            }
            if (rf & 2) {
                i0.ɵɵproperty("hidden", !ctx.showToolbar);
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("hidden", ctx.isButtonHidden("undo"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("hidden", ctx.isButtonHidden("redo"));
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("id", "bold-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("bold"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "italic-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("italic"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "underline-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("underline"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "subscript-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("subscript"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "superscript-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("superscript"));
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("id", "justifyLeft-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("justifyLeft"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "justifyCenter-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("justifyCenter"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "justifyRight-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("justifyRight"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "justifyFull-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("justifyFull"));
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("id", "indent-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("indent"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "outdent-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("outdent"));
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("id", "insertUnorderedList-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("insertUnorderedList"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "insertOrderedList-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("insertOrderedList"));
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("id", "link-" + ctx.id)("disabled", ctx.isLinkButtonDisabled)("hidden", ctx.isButtonHidden("link"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "unlink-" + ctx.id)("disabled", ctx.htmlMode || !ctx.linkSelected)("hidden", ctx.isButtonHidden("unlink"));
                i0.ɵɵadvance(4);
                i0.ɵɵproperty("id", "insertImage-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("insertImage"));
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("id", "insertVideo-" + ctx.id)("disabled", ctx.htmlMode)("hidden", ctx.isButtonHidden("insertVideo"));
                i0.ɵɵadvance(3);
                i0.ɵɵproperty("id", "markdown-" + ctx.id)("hidden", ctx.isButtonHidden("markDown"));
            }
        }, styles: ["@charset \"UTF-8\";\n@font-face{font-family:FontAwesome;font-style:normal;font-weight:400;src:url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.eot?v=4.7.0);src:url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.eot#iefix&v=4.7.0) format(\"embedded-opentype\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0) format(\"woff2\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff?v=4.7.0) format(\"woff\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf?v=4.7.0) format(\"truetype\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.svg?v=4.7.0#fontawesomeregular) format(\"svg\")}.fa[_ngcontent-%COMP%]{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto}.fa-lg[_ngcontent-%COMP%]{font-size:1.3333333333em;line-height:.75em;vertical-align:-15%}.fa-2x[_ngcontent-%COMP%]{font-size:2em}.fa-3x[_ngcontent-%COMP%]{font-size:3em}.fa-4x[_ngcontent-%COMP%]{font-size:4em}.fa-5x[_ngcontent-%COMP%]{font-size:5em}.fa-fw[_ngcontent-%COMP%]{text-align:center;width:1.2857142857em}.fa-ul[_ngcontent-%COMP%]{list-style-type:none;margin-left:2.1428571429em;padding-left:0}.fa-ul[_ngcontent-%COMP%] > li[_ngcontent-%COMP%]{position:relative}.fa-li[_ngcontent-%COMP%]{left:-2.1428571429em;position:absolute;text-align:center;top:.1428571429em;width:2.1428571429em}.fa-li.fa-lg[_ngcontent-%COMP%]{left:-1.8571428571em}.fa-border[_ngcontent-%COMP%]{border:.08em solid #eee;border-radius:.1em;padding:.2em .25em .15em}.fa-pull-left[_ngcontent-%COMP%]{float:left}.fa-pull-right[_ngcontent-%COMP%]{float:right}.fa.fa-pull-left[_ngcontent-%COMP%]{margin-right:.3em}.fa.fa-pull-right[_ngcontent-%COMP%]{margin-left:.3em}.pull-right[_ngcontent-%COMP%]{float:right}.pull-left[_ngcontent-%COMP%]{float:left}.fa.pull-left[_ngcontent-%COMP%]{margin-right:.3em}.fa.pull-right[_ngcontent-%COMP%]{margin-left:.3em}.fa-spin[_ngcontent-%COMP%]{-webkit-animation:fa-spin 2s linear infinite;animation:fa-spin 2s linear infinite}.fa-pulse[_ngcontent-%COMP%]{-webkit-animation:fa-spin 1s steps(8) infinite;animation:fa-spin 1s steps(8) infinite}@-webkit-keyframes fa-spin{0%{transform:rotate(0deg)}to{transform:rotate(359deg)}}@keyframes fa-spin{0%{transform:rotate(0deg)}to{transform:rotate(359deg)}}.fa-rotate-90[_ngcontent-%COMP%]{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";transform:rotate(90deg)}.fa-rotate-180[_ngcontent-%COMP%]{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";transform:rotate(180deg)}.fa-rotate-270[_ngcontent-%COMP%]{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";transform:rotate(270deg)}.fa-flip-horizontal[_ngcontent-%COMP%]{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";transform:scaleX(-1)}.fa-flip-vertical[_ngcontent-%COMP%]{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";transform:scaleY(-1)}[_ngcontent-%COMP%]:root   .fa-flip-horizontal[_ngcontent-%COMP%], [_ngcontent-%COMP%]:root   .fa-flip-vertical[_ngcontent-%COMP%], [_ngcontent-%COMP%]:root   .fa-rotate-90[_ngcontent-%COMP%], [_ngcontent-%COMP%]:root   .fa-rotate-180[_ngcontent-%COMP%], [_ngcontent-%COMP%]:root   .fa-rotate-270[_ngcontent-%COMP%]{filter:none}.fa-stack[_ngcontent-%COMP%]{display:inline-block;height:2em;line-height:2em;position:relative;vertical-align:middle;width:2em}.fa-stack-1x[_ngcontent-%COMP%], .fa-stack-2x[_ngcontent-%COMP%]{left:0;position:absolute;text-align:center;width:100%}.fa-stack-1x[_ngcontent-%COMP%]{line-height:inherit}.fa-stack-2x[_ngcontent-%COMP%]{font-size:2em}.fa-inverse[_ngcontent-%COMP%]{color:#fff}.fa-glass[_ngcontent-%COMP%]:before{content:\"\uF000\"}.fa-music[_ngcontent-%COMP%]:before{content:\"\uF001\"}.fa-search[_ngcontent-%COMP%]:before{content:\"\uF002\"}.fa-envelope-o[_ngcontent-%COMP%]:before{content:\"\uF003\"}.fa-heart[_ngcontent-%COMP%]:before{content:\"\uF004\"}.fa-star[_ngcontent-%COMP%]:before{content:\"\uF005\"}.fa-star-o[_ngcontent-%COMP%]:before{content:\"\uF006\"}.fa-user[_ngcontent-%COMP%]:before{content:\"\uF007\"}.fa-film[_ngcontent-%COMP%]:before{content:\"\uF008\"}.fa-th-large[_ngcontent-%COMP%]:before{content:\"\uF009\"}.fa-th[_ngcontent-%COMP%]:before{content:\"\uF00A\"}.fa-th-list[_ngcontent-%COMP%]:before{content:\"\uF00B\"}.fa-check[_ngcontent-%COMP%]:before{content:\"\uF00C\"}.fa-close[_ngcontent-%COMP%]:before, .fa-remove[_ngcontent-%COMP%]:before, .fa-times[_ngcontent-%COMP%]:before{content:\"\uF00D\"}.fa-search-plus[_ngcontent-%COMP%]:before{content:\"\uF00E\"}.fa-search-minus[_ngcontent-%COMP%]:before{content:\"\uF010\"}.fa-power-off[_ngcontent-%COMP%]:before{content:\"\uF011\"}.fa-signal[_ngcontent-%COMP%]:before{content:\"\uF012\"}.fa-cog[_ngcontent-%COMP%]:before, .fa-gear[_ngcontent-%COMP%]:before{content:\"\uF013\"}.fa-trash-o[_ngcontent-%COMP%]:before{content:\"\uF014\"}.fa-home[_ngcontent-%COMP%]:before{content:\"\uF015\"}.fa-file-o[_ngcontent-%COMP%]:before{content:\"\uF016\"}.fa-clock-o[_ngcontent-%COMP%]:before{content:\"\uF017\"}.fa-road[_ngcontent-%COMP%]:before{content:\"\uF018\"}.fa-download[_ngcontent-%COMP%]:before{content:\"\uF019\"}.fa-arrow-circle-o-down[_ngcontent-%COMP%]:before{content:\"\uF01A\"}.fa-arrow-circle-o-up[_ngcontent-%COMP%]:before{content:\"\uF01B\"}.fa-inbox[_ngcontent-%COMP%]:before{content:\"\uF01C\"}.fa-play-circle-o[_ngcontent-%COMP%]:before{content:\"\uF01D\"}.fa-repeat[_ngcontent-%COMP%]:before, .fa-rotate-right[_ngcontent-%COMP%]:before{content:\"\uF01E\"}.fa-refresh[_ngcontent-%COMP%]:before{content:\"\uF021\"}.fa-list-alt[_ngcontent-%COMP%]:before{content:\"\uF022\"}.fa-lock[_ngcontent-%COMP%]:before{content:\"\uF023\"}.fa-flag[_ngcontent-%COMP%]:before{content:\"\uF024\"}.fa-headphones[_ngcontent-%COMP%]:before{content:\"\uF025\"}.fa-volume-off[_ngcontent-%COMP%]:before{content:\"\uF026\"}.fa-volume-down[_ngcontent-%COMP%]:before{content:\"\uF027\"}.fa-volume-up[_ngcontent-%COMP%]:before{content:\"\uF028\"}.fa-qrcode[_ngcontent-%COMP%]:before{content:\"\uF029\"}.fa-barcode[_ngcontent-%COMP%]:before{content:\"\uF02A\"}.fa-tag[_ngcontent-%COMP%]:before{content:\"\uF02B\"}.fa-tags[_ngcontent-%COMP%]:before{content:\"\uF02C\"}.fa-book[_ngcontent-%COMP%]:before{content:\"\uF02D\"}.fa-bookmark[_ngcontent-%COMP%]:before{content:\"\uF02E\"}.fa-print[_ngcontent-%COMP%]:before{content:\"\uF02F\"}.fa-camera[_ngcontent-%COMP%]:before{content:\"\uF030\"}.fa-font[_ngcontent-%COMP%]:before{content:\"\uF031\"}.fa-bold[_ngcontent-%COMP%]:before{content:\"\uF032\"}.fa-italic[_ngcontent-%COMP%]:before{content:\"\uF033\"}.fa-text-height[_ngcontent-%COMP%]:before{content:\"\uF034\"}.fa-text-width[_ngcontent-%COMP%]:before{content:\"\uF035\"}.fa-align-left[_ngcontent-%COMP%]:before{content:\"\uF036\"}.fa-align-center[_ngcontent-%COMP%]:before{content:\"\uF037\"}.fa-align-right[_ngcontent-%COMP%]:before{content:\"\uF038\"}.fa-align-justify[_ngcontent-%COMP%]:before{content:\"\uF039\"}.fa-list[_ngcontent-%COMP%]:before{content:\"\uF03A\"}.fa-dedent[_ngcontent-%COMP%]:before, .fa-outdent[_ngcontent-%COMP%]:before{content:\"\uF03B\"}.fa-indent[_ngcontent-%COMP%]:before{content:\"\uF03C\"}.fa-video-camera[_ngcontent-%COMP%]:before{content:\"\uF03D\"}.fa-image[_ngcontent-%COMP%]:before, .fa-photo[_ngcontent-%COMP%]:before, .fa-picture-o[_ngcontent-%COMP%]:before{content:\"\uF03E\"}.fa-pencil[_ngcontent-%COMP%]:before{content:\"\uF040\"}.fa-map-marker[_ngcontent-%COMP%]:before{content:\"\uF041\"}.fa-adjust[_ngcontent-%COMP%]:before{content:\"\uF042\"}.fa-tint[_ngcontent-%COMP%]:before{content:\"\uF043\"}.fa-edit[_ngcontent-%COMP%]:before, .fa-pencil-square-o[_ngcontent-%COMP%]:before{content:\"\uF044\"}.fa-share-square-o[_ngcontent-%COMP%]:before{content:\"\uF045\"}.fa-check-square-o[_ngcontent-%COMP%]:before{content:\"\uF046\"}.fa-arrows[_ngcontent-%COMP%]:before{content:\"\uF047\"}.fa-step-backward[_ngcontent-%COMP%]:before{content:\"\uF048\"}.fa-fast-backward[_ngcontent-%COMP%]:before{content:\"\uF049\"}.fa-backward[_ngcontent-%COMP%]:before{content:\"\uF04A\"}.fa-play[_ngcontent-%COMP%]:before{content:\"\uF04B\"}.fa-pause[_ngcontent-%COMP%]:before{content:\"\uF04C\"}.fa-stop[_ngcontent-%COMP%]:before{content:\"\uF04D\"}.fa-forward[_ngcontent-%COMP%]:before{content:\"\uF04E\"}.fa-fast-forward[_ngcontent-%COMP%]:before{content:\"\uF050\"}.fa-step-forward[_ngcontent-%COMP%]:before{content:\"\uF051\"}.fa-eject[_ngcontent-%COMP%]:before{content:\"\uF052\"}.fa-chevron-left[_ngcontent-%COMP%]:before{content:\"\uF053\"}.fa-chevron-right[_ngcontent-%COMP%]:before{content:\"\uF054\"}.fa-plus-circle[_ngcontent-%COMP%]:before{content:\"\uF055\"}.fa-minus-circle[_ngcontent-%COMP%]:before{content:\"\uF056\"}.fa-times-circle[_ngcontent-%COMP%]:before{content:\"\uF057\"}.fa-check-circle[_ngcontent-%COMP%]:before{content:\"\uF058\"}.fa-question-circle[_ngcontent-%COMP%]:before{content:\"\uF059\"}.fa-info-circle[_ngcontent-%COMP%]:before{content:\"\uF05A\"}.fa-crosshairs[_ngcontent-%COMP%]:before{content:\"\uF05B\"}.fa-times-circle-o[_ngcontent-%COMP%]:before{content:\"\uF05C\"}.fa-check-circle-o[_ngcontent-%COMP%]:before{content:\"\uF05D\"}.fa-ban[_ngcontent-%COMP%]:before{content:\"\uF05E\"}.fa-arrow-left[_ngcontent-%COMP%]:before{content:\"\uF060\"}.fa-arrow-right[_ngcontent-%COMP%]:before{content:\"\uF061\"}.fa-arrow-up[_ngcontent-%COMP%]:before{content:\"\uF062\"}.fa-arrow-down[_ngcontent-%COMP%]:before{content:\"\uF063\"}.fa-mail-forward[_ngcontent-%COMP%]:before, .fa-share[_ngcontent-%COMP%]:before{content:\"\uF064\"}.fa-expand[_ngcontent-%COMP%]:before{content:\"\uF065\"}.fa-compress[_ngcontent-%COMP%]:before{content:\"\uF066\"}.fa-plus[_ngcontent-%COMP%]:before{content:\"\uF067\"}.fa-minus[_ngcontent-%COMP%]:before{content:\"\uF068\"}.fa-asterisk[_ngcontent-%COMP%]:before{content:\"\uF069\"}.fa-exclamation-circle[_ngcontent-%COMP%]:before{content:\"\uF06A\"}.fa-gift[_ngcontent-%COMP%]:before{content:\"\uF06B\"}.fa-leaf[_ngcontent-%COMP%]:before{content:\"\uF06C\"}.fa-fire[_ngcontent-%COMP%]:before{content:\"\uF06D\"}.fa-eye[_ngcontent-%COMP%]:before{content:\"\uF06E\"}.fa-eye-slash[_ngcontent-%COMP%]:before{content:\"\uF070\"}.fa-exclamation-triangle[_ngcontent-%COMP%]:before, .fa-warning[_ngcontent-%COMP%]:before{content:\"\uF071\"}.fa-plane[_ngcontent-%COMP%]:before{content:\"\uF072\"}.fa-calendar[_ngcontent-%COMP%]:before{content:\"\uF073\"}.fa-random[_ngcontent-%COMP%]:before{content:\"\uF074\"}.fa-comment[_ngcontent-%COMP%]:before{content:\"\uF075\"}.fa-magnet[_ngcontent-%COMP%]:before{content:\"\uF076\"}.fa-chevron-up[_ngcontent-%COMP%]:before{content:\"\uF077\"}.fa-chevron-down[_ngcontent-%COMP%]:before{content:\"\uF078\"}.fa-retweet[_ngcontent-%COMP%]:before{content:\"\uF079\"}.fa-shopping-cart[_ngcontent-%COMP%]:before{content:\"\uF07A\"}.fa-folder[_ngcontent-%COMP%]:before{content:\"\uF07B\"}.fa-folder-open[_ngcontent-%COMP%]:before{content:\"\uF07C\"}.fa-arrows-v[_ngcontent-%COMP%]:before{content:\"\uF07D\"}.fa-arrows-h[_ngcontent-%COMP%]:before{content:\"\uF07E\"}.fa-bar-chart-o[_ngcontent-%COMP%]:before, .fa-bar-chart[_ngcontent-%COMP%]:before{content:\"\uF080\"}.fa-twitter-square[_ngcontent-%COMP%]:before{content:\"\uF081\"}.fa-facebook-square[_ngcontent-%COMP%]:before{content:\"\uF082\"}.fa-camera-retro[_ngcontent-%COMP%]:before{content:\"\uF083\"}.fa-key[_ngcontent-%COMP%]:before{content:\"\uF084\"}.fa-cogs[_ngcontent-%COMP%]:before, .fa-gears[_ngcontent-%COMP%]:before{content:\"\uF085\"}.fa-comments[_ngcontent-%COMP%]:before{content:\"\uF086\"}.fa-thumbs-o-up[_ngcontent-%COMP%]:before{content:\"\uF087\"}.fa-thumbs-o-down[_ngcontent-%COMP%]:before{content:\"\uF088\"}.fa-star-half[_ngcontent-%COMP%]:before{content:\"\uF089\"}.fa-heart-o[_ngcontent-%COMP%]:before{content:\"\uF08A\"}.fa-sign-out[_ngcontent-%COMP%]:before{content:\"\uF08B\"}.fa-linkedin-square[_ngcontent-%COMP%]:before{content:\"\uF08C\"}.fa-thumb-tack[_ngcontent-%COMP%]:before{content:\"\uF08D\"}.fa-external-link[_ngcontent-%COMP%]:before{content:\"\uF08E\"}.fa-sign-in[_ngcontent-%COMP%]:before{content:\"\uF090\"}.fa-trophy[_ngcontent-%COMP%]:before{content:\"\uF091\"}.fa-github-square[_ngcontent-%COMP%]:before{content:\"\uF092\"}.fa-upload[_ngcontent-%COMP%]:before{content:\"\uF093\"}.fa-lemon-o[_ngcontent-%COMP%]:before{content:\"\uF094\"}.fa-phone[_ngcontent-%COMP%]:before{content:\"\uF095\"}.fa-square-o[_ngcontent-%COMP%]:before{content:\"\uF096\"}.fa-bookmark-o[_ngcontent-%COMP%]:before{content:\"\uF097\"}.fa-phone-square[_ngcontent-%COMP%]:before{content:\"\uF098\"}.fa-twitter[_ngcontent-%COMP%]:before{content:\"\uF099\"}.fa-facebook-f[_ngcontent-%COMP%]:before, .fa-facebook[_ngcontent-%COMP%]:before{content:\"\uF09A\"}.fa-github[_ngcontent-%COMP%]:before{content:\"\uF09B\"}.fa-unlock[_ngcontent-%COMP%]:before{content:\"\uF09C\"}.fa-credit-card[_ngcontent-%COMP%]:before{content:\"\uF09D\"}.fa-feed[_ngcontent-%COMP%]:before, .fa-rss[_ngcontent-%COMP%]:before{content:\"\uF09E\"}.fa-hdd-o[_ngcontent-%COMP%]:before{content:\"\uF0A0\"}.fa-bullhorn[_ngcontent-%COMP%]:before{content:\"\uF0A1\"}.fa-bell[_ngcontent-%COMP%]:before{content:\"\uF0F3\"}.fa-certificate[_ngcontent-%COMP%]:before{content:\"\uF0A3\"}.fa-hand-o-right[_ngcontent-%COMP%]:before{content:\"\uF0A4\"}.fa-hand-o-left[_ngcontent-%COMP%]:before{content:\"\uF0A5\"}.fa-hand-o-up[_ngcontent-%COMP%]:before{content:\"\uF0A6\"}.fa-hand-o-down[_ngcontent-%COMP%]:before{content:\"\uF0A7\"}.fa-arrow-circle-left[_ngcontent-%COMP%]:before{content:\"\uF0A8\"}.fa-arrow-circle-right[_ngcontent-%COMP%]:before{content:\"\uF0A9\"}.fa-arrow-circle-up[_ngcontent-%COMP%]:before{content:\"\uF0AA\"}.fa-arrow-circle-down[_ngcontent-%COMP%]:before{content:\"\uF0AB\"}.fa-globe[_ngcontent-%COMP%]:before{content:\"\uF0AC\"}.fa-wrench[_ngcontent-%COMP%]:before{content:\"\uF0AD\"}.fa-tasks[_ngcontent-%COMP%]:before{content:\"\uF0AE\"}.fa-filter[_ngcontent-%COMP%]:before{content:\"\uF0B0\"}.fa-briefcase[_ngcontent-%COMP%]:before{content:\"\uF0B1\"}.fa-arrows-alt[_ngcontent-%COMP%]:before{content:\"\uF0B2\"}.fa-group[_ngcontent-%COMP%]:before, .fa-users[_ngcontent-%COMP%]:before{content:\"\uF0C0\"}.fa-chain[_ngcontent-%COMP%]:before, .fa-link[_ngcontent-%COMP%]:before{content:\"\uF0C1\"}.fa-cloud[_ngcontent-%COMP%]:before{content:\"\uF0C2\"}.fa-flask[_ngcontent-%COMP%]:before{content:\"\uF0C3\"}.fa-cut[_ngcontent-%COMP%]:before, .fa-scissors[_ngcontent-%COMP%]:before{content:\"\uF0C4\"}.fa-copy[_ngcontent-%COMP%]:before, .fa-files-o[_ngcontent-%COMP%]:before{content:\"\uF0C5\"}.fa-paperclip[_ngcontent-%COMP%]:before{content:\"\uF0C6\"}.fa-floppy-o[_ngcontent-%COMP%]:before, .fa-save[_ngcontent-%COMP%]:before{content:\"\uF0C7\"}.fa-square[_ngcontent-%COMP%]:before{content:\"\uF0C8\"}.fa-bars[_ngcontent-%COMP%]:before, .fa-navicon[_ngcontent-%COMP%]:before, .fa-reorder[_ngcontent-%COMP%]:before{content:\"\uF0C9\"}.fa-list-ul[_ngcontent-%COMP%]:before{content:\"\uF0CA\"}.fa-list-ol[_ngcontent-%COMP%]:before{content:\"\uF0CB\"}.fa-strikethrough[_ngcontent-%COMP%]:before{content:\"\uF0CC\"}.fa-underline[_ngcontent-%COMP%]:before{content:\"\uF0CD\"}.fa-table[_ngcontent-%COMP%]:before{content:\"\uF0CE\"}.fa-magic[_ngcontent-%COMP%]:before{content:\"\uF0D0\"}.fa-truck[_ngcontent-%COMP%]:before{content:\"\uF0D1\"}.fa-pinterest[_ngcontent-%COMP%]:before{content:\"\uF0D2\"}.fa-pinterest-square[_ngcontent-%COMP%]:before{content:\"\uF0D3\"}.fa-google-plus-square[_ngcontent-%COMP%]:before{content:\"\uF0D4\"}.fa-google-plus[_ngcontent-%COMP%]:before{content:\"\uF0D5\"}.fa-money[_ngcontent-%COMP%]:before{content:\"\uF0D6\"}.fa-caret-down[_ngcontent-%COMP%]:before{content:\"\uF0D7\"}.fa-caret-up[_ngcontent-%COMP%]:before{content:\"\uF0D8\"}.fa-caret-left[_ngcontent-%COMP%]:before{content:\"\uF0D9\"}.fa-caret-right[_ngcontent-%COMP%]:before{content:\"\uF0DA\"}.fa-columns[_ngcontent-%COMP%]:before{content:\"\uF0DB\"}.fa-sort[_ngcontent-%COMP%]:before, .fa-unsorted[_ngcontent-%COMP%]:before{content:\"\uF0DC\"}.fa-sort-desc[_ngcontent-%COMP%]:before, .fa-sort-down[_ngcontent-%COMP%]:before{content:\"\uF0DD\"}.fa-sort-asc[_ngcontent-%COMP%]:before, .fa-sort-up[_ngcontent-%COMP%]:before{content:\"\uF0DE\"}.fa-envelope[_ngcontent-%COMP%]:before{content:\"\uF0E0\"}.fa-linkedin[_ngcontent-%COMP%]:before{content:\"\uF0E1\"}.fa-rotate-left[_ngcontent-%COMP%]:before, .fa-undo[_ngcontent-%COMP%]:before{content:\"\uF0E2\"}.fa-gavel[_ngcontent-%COMP%]:before, .fa-legal[_ngcontent-%COMP%]:before{content:\"\uF0E3\"}.fa-dashboard[_ngcontent-%COMP%]:before, .fa-tachometer[_ngcontent-%COMP%]:before{content:\"\uF0E4\"}.fa-comment-o[_ngcontent-%COMP%]:before{content:\"\uF0E5\"}.fa-comments-o[_ngcontent-%COMP%]:before{content:\"\uF0E6\"}.fa-bolt[_ngcontent-%COMP%]:before, .fa-flash[_ngcontent-%COMP%]:before{content:\"\uF0E7\"}.fa-sitemap[_ngcontent-%COMP%]:before{content:\"\uF0E8\"}.fa-umbrella[_ngcontent-%COMP%]:before{content:\"\uF0E9\"}.fa-clipboard[_ngcontent-%COMP%]:before, .fa-paste[_ngcontent-%COMP%]:before{content:\"\uF0EA\"}.fa-lightbulb-o[_ngcontent-%COMP%]:before{content:\"\uF0EB\"}.fa-exchange[_ngcontent-%COMP%]:before{content:\"\uF0EC\"}.fa-cloud-download[_ngcontent-%COMP%]:before{content:\"\uF0ED\"}.fa-cloud-upload[_ngcontent-%COMP%]:before{content:\"\uF0EE\"}.fa-user-md[_ngcontent-%COMP%]:before{content:\"\uF0F0\"}.fa-stethoscope[_ngcontent-%COMP%]:before{content:\"\uF0F1\"}.fa-suitcase[_ngcontent-%COMP%]:before{content:\"\uF0F2\"}.fa-bell-o[_ngcontent-%COMP%]:before{content:\"\uF0A2\"}.fa-coffee[_ngcontent-%COMP%]:before{content:\"\uF0F4\"}.fa-cutlery[_ngcontent-%COMP%]:before{content:\"\uF0F5\"}.fa-file-text-o[_ngcontent-%COMP%]:before{content:\"\uF0F6\"}.fa-building-o[_ngcontent-%COMP%]:before{content:\"\uF0F7\"}.fa-hospital-o[_ngcontent-%COMP%]:before{content:\"\uF0F8\"}.fa-ambulance[_ngcontent-%COMP%]:before{content:\"\uF0F9\"}.fa-medkit[_ngcontent-%COMP%]:before{content:\"\uF0FA\"}.fa-fighter-jet[_ngcontent-%COMP%]:before{content:\"\uF0FB\"}.fa-beer[_ngcontent-%COMP%]:before{content:\"\uF0FC\"}.fa-h-square[_ngcontent-%COMP%]:before{content:\"\uF0FD\"}.fa-plus-square[_ngcontent-%COMP%]:before{content:\"\uF0FE\"}.fa-angle-double-left[_ngcontent-%COMP%]:before{content:\"\uF100\"}.fa-angle-double-right[_ngcontent-%COMP%]:before{content:\"\uF101\"}.fa-angle-double-up[_ngcontent-%COMP%]:before{content:\"\uF102\"}.fa-angle-double-down[_ngcontent-%COMP%]:before{content:\"\uF103\"}.fa-angle-left[_ngcontent-%COMP%]:before{content:\"\uF104\"}.fa-angle-right[_ngcontent-%COMP%]:before{content:\"\uF105\"}.fa-angle-up[_ngcontent-%COMP%]:before{content:\"\uF106\"}.fa-angle-down[_ngcontent-%COMP%]:before{content:\"\uF107\"}.fa-desktop[_ngcontent-%COMP%]:before{content:\"\uF108\"}.fa-laptop[_ngcontent-%COMP%]:before{content:\"\uF109\"}.fa-tablet[_ngcontent-%COMP%]:before{content:\"\uF10A\"}.fa-mobile-phone[_ngcontent-%COMP%]:before, .fa-mobile[_ngcontent-%COMP%]:before{content:\"\uF10B\"}.fa-circle-o[_ngcontent-%COMP%]:before{content:\"\uF10C\"}.fa-quote-left[_ngcontent-%COMP%]:before{content:\"\uF10D\"}.fa-quote-right[_ngcontent-%COMP%]:before{content:\"\uF10E\"}.fa-spinner[_ngcontent-%COMP%]:before{content:\"\uF110\"}.fa-circle[_ngcontent-%COMP%]:before{content:\"\uF111\"}.fa-mail-reply[_ngcontent-%COMP%]:before, .fa-reply[_ngcontent-%COMP%]:before{content:\"\uF112\"}.fa-github-alt[_ngcontent-%COMP%]:before{content:\"\uF113\"}.fa-folder-o[_ngcontent-%COMP%]:before{content:\"\uF114\"}.fa-folder-open-o[_ngcontent-%COMP%]:before{content:\"\uF115\"}.fa-smile-o[_ngcontent-%COMP%]:before{content:\"\uF118\"}.fa-frown-o[_ngcontent-%COMP%]:before{content:\"\uF119\"}.fa-meh-o[_ngcontent-%COMP%]:before{content:\"\uF11A\"}.fa-gamepad[_ngcontent-%COMP%]:before{content:\"\uF11B\"}.fa-keyboard-o[_ngcontent-%COMP%]:before{content:\"\uF11C\"}.fa-flag-o[_ngcontent-%COMP%]:before{content:\"\uF11D\"}.fa-flag-checkered[_ngcontent-%COMP%]:before{content:\"\uF11E\"}.fa-terminal[_ngcontent-%COMP%]:before{content:\"\uF120\"}.fa-code[_ngcontent-%COMP%]:before{content:\"\uF121\"}.fa-mail-reply-all[_ngcontent-%COMP%]:before, .fa-reply-all[_ngcontent-%COMP%]:before{content:\"\uF122\"}.fa-star-half-empty[_ngcontent-%COMP%]:before, .fa-star-half-full[_ngcontent-%COMP%]:before, .fa-star-half-o[_ngcontent-%COMP%]:before{content:\"\uF123\"}.fa-location-arrow[_ngcontent-%COMP%]:before{content:\"\uF124\"}.fa-crop[_ngcontent-%COMP%]:before{content:\"\uF125\"}.fa-code-fork[_ngcontent-%COMP%]:before{content:\"\uF126\"}.fa-chain-broken[_ngcontent-%COMP%]:before, .fa-unlink[_ngcontent-%COMP%]:before{content:\"\uF127\"}.fa-question[_ngcontent-%COMP%]:before{content:\"\uF128\"}.fa-info[_ngcontent-%COMP%]:before{content:\"\uF129\"}.fa-exclamation[_ngcontent-%COMP%]:before{content:\"\uF12A\"}.fa-superscript[_ngcontent-%COMP%]:before{content:\"\uF12B\"}.fa-subscript[_ngcontent-%COMP%]:before{content:\"\uF12C\"}.fa-eraser[_ngcontent-%COMP%]:before{content:\"\uF12D\"}.fa-puzzle-piece[_ngcontent-%COMP%]:before{content:\"\uF12E\"}.fa-microphone[_ngcontent-%COMP%]:before{content:\"\uF130\"}.fa-microphone-slash[_ngcontent-%COMP%]:before{content:\"\uF131\"}.fa-shield[_ngcontent-%COMP%]:before{content:\"\uF132\"}.fa-calendar-o[_ngcontent-%COMP%]:before{content:\"\uF133\"}.fa-fire-extinguisher[_ngcontent-%COMP%]:before{content:\"\uF134\"}.fa-rocket[_ngcontent-%COMP%]:before{content:\"\uF135\"}.fa-maxcdn[_ngcontent-%COMP%]:before{content:\"\uF136\"}.fa-chevron-circle-left[_ngcontent-%COMP%]:before{content:\"\uF137\"}.fa-chevron-circle-right[_ngcontent-%COMP%]:before{content:\"\uF138\"}.fa-chevron-circle-up[_ngcontent-%COMP%]:before{content:\"\uF139\"}.fa-chevron-circle-down[_ngcontent-%COMP%]:before{content:\"\uF13A\"}.fa-html5[_ngcontent-%COMP%]:before{content:\"\uF13B\"}.fa-css3[_ngcontent-%COMP%]:before{content:\"\uF13C\"}.fa-anchor[_ngcontent-%COMP%]:before{content:\"\uF13D\"}.fa-unlock-alt[_ngcontent-%COMP%]:before{content:\"\uF13E\"}.fa-bullseye[_ngcontent-%COMP%]:before{content:\"\uF140\"}.fa-ellipsis-h[_ngcontent-%COMP%]:before{content:\"\uF141\"}.fa-ellipsis-v[_ngcontent-%COMP%]:before{content:\"\uF142\"}.fa-rss-square[_ngcontent-%COMP%]:before{content:\"\uF143\"}.fa-play-circle[_ngcontent-%COMP%]:before{content:\"\uF144\"}.fa-ticket[_ngcontent-%COMP%]:before{content:\"\uF145\"}.fa-minus-square[_ngcontent-%COMP%]:before{content:\"\uF146\"}.fa-minus-square-o[_ngcontent-%COMP%]:before{content:\"\uF147\"}.fa-level-up[_ngcontent-%COMP%]:before{content:\"\uF148\"}.fa-level-down[_ngcontent-%COMP%]:before{content:\"\uF149\"}.fa-check-square[_ngcontent-%COMP%]:before{content:\"\uF14A\"}.fa-pencil-square[_ngcontent-%COMP%]:before{content:\"\uF14B\"}.fa-external-link-square[_ngcontent-%COMP%]:before{content:\"\uF14C\"}.fa-share-square[_ngcontent-%COMP%]:before{content:\"\uF14D\"}.fa-compass[_ngcontent-%COMP%]:before{content:\"\uF14E\"}.fa-caret-square-o-down[_ngcontent-%COMP%]:before, .fa-toggle-down[_ngcontent-%COMP%]:before{content:\"\uF150\"}.fa-caret-square-o-up[_ngcontent-%COMP%]:before, .fa-toggle-up[_ngcontent-%COMP%]:before{content:\"\uF151\"}.fa-caret-square-o-right[_ngcontent-%COMP%]:before, .fa-toggle-right[_ngcontent-%COMP%]:before{content:\"\uF152\"}.fa-eur[_ngcontent-%COMP%]:before, .fa-euro[_ngcontent-%COMP%]:before{content:\"\uF153\"}.fa-gbp[_ngcontent-%COMP%]:before{content:\"\uF154\"}.fa-dollar[_ngcontent-%COMP%]:before, .fa-usd[_ngcontent-%COMP%]:before{content:\"\uF155\"}.fa-inr[_ngcontent-%COMP%]:before, .fa-rupee[_ngcontent-%COMP%]:before{content:\"\uF156\"}.fa-cny[_ngcontent-%COMP%]:before, .fa-jpy[_ngcontent-%COMP%]:before, .fa-rmb[_ngcontent-%COMP%]:before, .fa-yen[_ngcontent-%COMP%]:before{content:\"\uF157\"}.fa-rouble[_ngcontent-%COMP%]:before, .fa-rub[_ngcontent-%COMP%]:before, .fa-ruble[_ngcontent-%COMP%]:before{content:\"\uF158\"}.fa-krw[_ngcontent-%COMP%]:before, .fa-won[_ngcontent-%COMP%]:before{content:\"\uF159\"}.fa-bitcoin[_ngcontent-%COMP%]:before, .fa-btc[_ngcontent-%COMP%]:before{content:\"\uF15A\"}.fa-file[_ngcontent-%COMP%]:before{content:\"\uF15B\"}.fa-file-text[_ngcontent-%COMP%]:before{content:\"\uF15C\"}.fa-sort-alpha-asc[_ngcontent-%COMP%]:before{content:\"\uF15D\"}.fa-sort-alpha-desc[_ngcontent-%COMP%]:before{content:\"\uF15E\"}.fa-sort-amount-asc[_ngcontent-%COMP%]:before{content:\"\uF160\"}.fa-sort-amount-desc[_ngcontent-%COMP%]:before{content:\"\uF161\"}.fa-sort-numeric-asc[_ngcontent-%COMP%]:before{content:\"\uF162\"}.fa-sort-numeric-desc[_ngcontent-%COMP%]:before{content:\"\uF163\"}.fa-thumbs-up[_ngcontent-%COMP%]:before{content:\"\uF164\"}.fa-thumbs-down[_ngcontent-%COMP%]:before{content:\"\uF165\"}.fa-youtube-square[_ngcontent-%COMP%]:before{content:\"\uF166\"}.fa-youtube[_ngcontent-%COMP%]:before{content:\"\uF167\"}.fa-xing[_ngcontent-%COMP%]:before{content:\"\uF168\"}.fa-xing-square[_ngcontent-%COMP%]:before{content:\"\uF169\"}.fa-youtube-play[_ngcontent-%COMP%]:before{content:\"\uF16A\"}.fa-dropbox[_ngcontent-%COMP%]:before{content:\"\uF16B\"}.fa-stack-overflow[_ngcontent-%COMP%]:before{content:\"\uF16C\"}.fa-instagram[_ngcontent-%COMP%]:before{content:\"\uF16D\"}.fa-flickr[_ngcontent-%COMP%]:before{content:\"\uF16E\"}.fa-adn[_ngcontent-%COMP%]:before{content:\"\uF170\"}.fa-bitbucket[_ngcontent-%COMP%]:before{content:\"\uF171\"}.fa-bitbucket-square[_ngcontent-%COMP%]:before{content:\"\uF172\"}.fa-tumblr[_ngcontent-%COMP%]:before{content:\"\uF173\"}.fa-tumblr-square[_ngcontent-%COMP%]:before{content:\"\uF174\"}.fa-long-arrow-down[_ngcontent-%COMP%]:before{content:\"\uF175\"}.fa-long-arrow-up[_ngcontent-%COMP%]:before{content:\"\uF176\"}.fa-long-arrow-left[_ngcontent-%COMP%]:before{content:\"\uF177\"}.fa-long-arrow-right[_ngcontent-%COMP%]:before{content:\"\uF178\"}.fa-apple[_ngcontent-%COMP%]:before{content:\"\uF179\"}.fa-windows[_ngcontent-%COMP%]:before{content:\"\uF17A\"}.fa-android[_ngcontent-%COMP%]:before{content:\"\uF17B\"}.fa-linux[_ngcontent-%COMP%]:before{content:\"\uF17C\"}.fa-dribbble[_ngcontent-%COMP%]:before{content:\"\uF17D\"}.fa-skype[_ngcontent-%COMP%]:before{content:\"\uF17E\"}.fa-foursquare[_ngcontent-%COMP%]:before{content:\"\uF180\"}.fa-trello[_ngcontent-%COMP%]:before{content:\"\uF181\"}.fa-female[_ngcontent-%COMP%]:before{content:\"\uF182\"}.fa-male[_ngcontent-%COMP%]:before{content:\"\uF183\"}.fa-gittip[_ngcontent-%COMP%]:before, .fa-gratipay[_ngcontent-%COMP%]:before{content:\"\uF184\"}.fa-sun-o[_ngcontent-%COMP%]:before{content:\"\uF185\"}.fa-moon-o[_ngcontent-%COMP%]:before{content:\"\uF186\"}.fa-archive[_ngcontent-%COMP%]:before{content:\"\uF187\"}.fa-bug[_ngcontent-%COMP%]:before{content:\"\uF188\"}.fa-vk[_ngcontent-%COMP%]:before{content:\"\uF189\"}.fa-weibo[_ngcontent-%COMP%]:before{content:\"\uF18A\"}.fa-renren[_ngcontent-%COMP%]:before{content:\"\uF18B\"}.fa-pagelines[_ngcontent-%COMP%]:before{content:\"\uF18C\"}.fa-stack-exchange[_ngcontent-%COMP%]:before{content:\"\uF18D\"}.fa-arrow-circle-o-right[_ngcontent-%COMP%]:before{content:\"\uF18E\"}.fa-arrow-circle-o-left[_ngcontent-%COMP%]:before{content:\"\uF190\"}.fa-caret-square-o-left[_ngcontent-%COMP%]:before, .fa-toggle-left[_ngcontent-%COMP%]:before{content:\"\uF191\"}.fa-dot-circle-o[_ngcontent-%COMP%]:before{content:\"\uF192\"}.fa-wheelchair[_ngcontent-%COMP%]:before{content:\"\uF193\"}.fa-vimeo-square[_ngcontent-%COMP%]:before{content:\"\uF194\"}.fa-try[_ngcontent-%COMP%]:before, .fa-turkish-lira[_ngcontent-%COMP%]:before{content:\"\uF195\"}.fa-plus-square-o[_ngcontent-%COMP%]:before{content:\"\uF196\"}.fa-space-shuttle[_ngcontent-%COMP%]:before{content:\"\uF197\"}.fa-slack[_ngcontent-%COMP%]:before{content:\"\uF198\"}.fa-envelope-square[_ngcontent-%COMP%]:before{content:\"\uF199\"}.fa-wordpress[_ngcontent-%COMP%]:before{content:\"\uF19A\"}.fa-openid[_ngcontent-%COMP%]:before{content:\"\uF19B\"}.fa-bank[_ngcontent-%COMP%]:before, .fa-institution[_ngcontent-%COMP%]:before, .fa-university[_ngcontent-%COMP%]:before{content:\"\uF19C\"}.fa-graduation-cap[_ngcontent-%COMP%]:before, .fa-mortar-board[_ngcontent-%COMP%]:before{content:\"\uF19D\"}.fa-yahoo[_ngcontent-%COMP%]:before{content:\"\uF19E\"}.fa-google[_ngcontent-%COMP%]:before{content:\"\uF1A0\"}.fa-reddit[_ngcontent-%COMP%]:before{content:\"\uF1A1\"}.fa-reddit-square[_ngcontent-%COMP%]:before{content:\"\uF1A2\"}.fa-stumbleupon-circle[_ngcontent-%COMP%]:before{content:\"\uF1A3\"}.fa-stumbleupon[_ngcontent-%COMP%]:before{content:\"\uF1A4\"}.fa-delicious[_ngcontent-%COMP%]:before{content:\"\uF1A5\"}.fa-digg[_ngcontent-%COMP%]:before{content:\"\uF1A6\"}.fa-pied-piper-pp[_ngcontent-%COMP%]:before{content:\"\uF1A7\"}.fa-pied-piper-alt[_ngcontent-%COMP%]:before{content:\"\uF1A8\"}.fa-drupal[_ngcontent-%COMP%]:before{content:\"\uF1A9\"}.fa-joomla[_ngcontent-%COMP%]:before{content:\"\uF1AA\"}.fa-language[_ngcontent-%COMP%]:before{content:\"\uF1AB\"}.fa-fax[_ngcontent-%COMP%]:before{content:\"\uF1AC\"}.fa-building[_ngcontent-%COMP%]:before{content:\"\uF1AD\"}.fa-child[_ngcontent-%COMP%]:before{content:\"\uF1AE\"}.fa-paw[_ngcontent-%COMP%]:before{content:\"\uF1B0\"}.fa-spoon[_ngcontent-%COMP%]:before{content:\"\uF1B1\"}.fa-cube[_ngcontent-%COMP%]:before{content:\"\uF1B2\"}.fa-cubes[_ngcontent-%COMP%]:before{content:\"\uF1B3\"}.fa-behance[_ngcontent-%COMP%]:before{content:\"\uF1B4\"}.fa-behance-square[_ngcontent-%COMP%]:before{content:\"\uF1B5\"}.fa-steam[_ngcontent-%COMP%]:before{content:\"\uF1B6\"}.fa-steam-square[_ngcontent-%COMP%]:before{content:\"\uF1B7\"}.fa-recycle[_ngcontent-%COMP%]:before{content:\"\uF1B8\"}.fa-automobile[_ngcontent-%COMP%]:before, .fa-car[_ngcontent-%COMP%]:before{content:\"\uF1B9\"}.fa-cab[_ngcontent-%COMP%]:before, .fa-taxi[_ngcontent-%COMP%]:before{content:\"\uF1BA\"}.fa-tree[_ngcontent-%COMP%]:before{content:\"\uF1BB\"}.fa-spotify[_ngcontent-%COMP%]:before{content:\"\uF1BC\"}.fa-deviantart[_ngcontent-%COMP%]:before{content:\"\uF1BD\"}.fa-soundcloud[_ngcontent-%COMP%]:before{content:\"\uF1BE\"}.fa-database[_ngcontent-%COMP%]:before{content:\"\uF1C0\"}.fa-file-pdf-o[_ngcontent-%COMP%]:before{content:\"\uF1C1\"}.fa-file-word-o[_ngcontent-%COMP%]:before{content:\"\uF1C2\"}.fa-file-excel-o[_ngcontent-%COMP%]:before{content:\"\uF1C3\"}.fa-file-powerpoint-o[_ngcontent-%COMP%]:before{content:\"\uF1C4\"}.fa-file-image-o[_ngcontent-%COMP%]:before, .fa-file-photo-o[_ngcontent-%COMP%]:before, .fa-file-picture-o[_ngcontent-%COMP%]:before{content:\"\uF1C5\"}.fa-file-archive-o[_ngcontent-%COMP%]:before, .fa-file-zip-o[_ngcontent-%COMP%]:before{content:\"\uF1C6\"}.fa-file-audio-o[_ngcontent-%COMP%]:before, .fa-file-sound-o[_ngcontent-%COMP%]:before{content:\"\uF1C7\"}.fa-file-movie-o[_ngcontent-%COMP%]:before, .fa-file-video-o[_ngcontent-%COMP%]:before{content:\"\uF1C8\"}.fa-file-code-o[_ngcontent-%COMP%]:before{content:\"\uF1C9\"}.fa-vine[_ngcontent-%COMP%]:before{content:\"\uF1CA\"}.fa-codepen[_ngcontent-%COMP%]:before{content:\"\uF1CB\"}.fa-jsfiddle[_ngcontent-%COMP%]:before{content:\"\uF1CC\"}.fa-life-bouy[_ngcontent-%COMP%]:before, .fa-life-buoy[_ngcontent-%COMP%]:before, .fa-life-ring[_ngcontent-%COMP%]:before, .fa-life-saver[_ngcontent-%COMP%]:before, .fa-support[_ngcontent-%COMP%]:before{content:\"\uF1CD\"}.fa-circle-o-notch[_ngcontent-%COMP%]:before{content:\"\uF1CE\"}.fa-ra[_ngcontent-%COMP%]:before, .fa-rebel[_ngcontent-%COMP%]:before, .fa-resistance[_ngcontent-%COMP%]:before{content:\"\uF1D0\"}.fa-empire[_ngcontent-%COMP%]:before, .fa-ge[_ngcontent-%COMP%]:before{content:\"\uF1D1\"}.fa-git-square[_ngcontent-%COMP%]:before{content:\"\uF1D2\"}.fa-git[_ngcontent-%COMP%]:before{content:\"\uF1D3\"}.fa-hacker-news[_ngcontent-%COMP%]:before, .fa-y-combinator-square[_ngcontent-%COMP%]:before, .fa-yc-square[_ngcontent-%COMP%]:before{content:\"\uF1D4\"}.fa-tencent-weibo[_ngcontent-%COMP%]:before{content:\"\uF1D5\"}.fa-qq[_ngcontent-%COMP%]:before{content:\"\uF1D6\"}.fa-wechat[_ngcontent-%COMP%]:before, .fa-weixin[_ngcontent-%COMP%]:before{content:\"\uF1D7\"}.fa-paper-plane[_ngcontent-%COMP%]:before, .fa-send[_ngcontent-%COMP%]:before{content:\"\uF1D8\"}.fa-paper-plane-o[_ngcontent-%COMP%]:before, .fa-send-o[_ngcontent-%COMP%]:before{content:\"\uF1D9\"}.fa-history[_ngcontent-%COMP%]:before{content:\"\uF1DA\"}.fa-circle-thin[_ngcontent-%COMP%]:before{content:\"\uF1DB\"}.fa-header[_ngcontent-%COMP%]:before{content:\"\uF1DC\"}.fa-paragraph[_ngcontent-%COMP%]:before{content:\"\uF1DD\"}.fa-sliders[_ngcontent-%COMP%]:before{content:\"\uF1DE\"}.fa-share-alt[_ngcontent-%COMP%]:before{content:\"\uF1E0\"}.fa-share-alt-square[_ngcontent-%COMP%]:before{content:\"\uF1E1\"}.fa-bomb[_ngcontent-%COMP%]:before{content:\"\uF1E2\"}.fa-futbol-o[_ngcontent-%COMP%]:before, .fa-soccer-ball-o[_ngcontent-%COMP%]:before{content:\"\uF1E3\"}.fa-tty[_ngcontent-%COMP%]:before{content:\"\uF1E4\"}.fa-binoculars[_ngcontent-%COMP%]:before{content:\"\uF1E5\"}.fa-plug[_ngcontent-%COMP%]:before{content:\"\uF1E6\"}.fa-slideshare[_ngcontent-%COMP%]:before{content:\"\uF1E7\"}.fa-twitch[_ngcontent-%COMP%]:before{content:\"\uF1E8\"}.fa-yelp[_ngcontent-%COMP%]:before{content:\"\uF1E9\"}.fa-newspaper-o[_ngcontent-%COMP%]:before{content:\"\uF1EA\"}.fa-wifi[_ngcontent-%COMP%]:before{content:\"\uF1EB\"}.fa-calculator[_ngcontent-%COMP%]:before{content:\"\uF1EC\"}.fa-paypal[_ngcontent-%COMP%]:before{content:\"\uF1ED\"}.fa-google-wallet[_ngcontent-%COMP%]:before{content:\"\uF1EE\"}.fa-cc-visa[_ngcontent-%COMP%]:before{content:\"\uF1F0\"}.fa-cc-mastercard[_ngcontent-%COMP%]:before{content:\"\uF1F1\"}.fa-cc-discover[_ngcontent-%COMP%]:before{content:\"\uF1F2\"}.fa-cc-amex[_ngcontent-%COMP%]:before{content:\"\uF1F3\"}.fa-cc-paypal[_ngcontent-%COMP%]:before{content:\"\uF1F4\"}.fa-cc-stripe[_ngcontent-%COMP%]:before{content:\"\uF1F5\"}.fa-bell-slash[_ngcontent-%COMP%]:before{content:\"\uF1F6\"}.fa-bell-slash-o[_ngcontent-%COMP%]:before{content:\"\uF1F7\"}.fa-trash[_ngcontent-%COMP%]:before{content:\"\uF1F8\"}.fa-copyright[_ngcontent-%COMP%]:before{content:\"\uF1F9\"}.fa-at[_ngcontent-%COMP%]:before{content:\"\uF1FA\"}.fa-eyedropper[_ngcontent-%COMP%]:before{content:\"\uF1FB\"}.fa-paint-brush[_ngcontent-%COMP%]:before{content:\"\uF1FC\"}.fa-birthday-cake[_ngcontent-%COMP%]:before{content:\"\uF1FD\"}.fa-area-chart[_ngcontent-%COMP%]:before{content:\"\uF1FE\"}.fa-pie-chart[_ngcontent-%COMP%]:before{content:\"\uF200\"}.fa-line-chart[_ngcontent-%COMP%]:before{content:\"\uF201\"}.fa-lastfm[_ngcontent-%COMP%]:before{content:\"\uF202\"}.fa-lastfm-square[_ngcontent-%COMP%]:before{content:\"\uF203\"}.fa-toggle-off[_ngcontent-%COMP%]:before{content:\"\uF204\"}.fa-toggle-on[_ngcontent-%COMP%]:before{content:\"\uF205\"}.fa-bicycle[_ngcontent-%COMP%]:before{content:\"\uF206\"}.fa-bus[_ngcontent-%COMP%]:before{content:\"\uF207\"}.fa-ioxhost[_ngcontent-%COMP%]:before{content:\"\uF208\"}.fa-angellist[_ngcontent-%COMP%]:before{content:\"\uF209\"}.fa-cc[_ngcontent-%COMP%]:before{content:\"\uF20A\"}.fa-ils[_ngcontent-%COMP%]:before, .fa-shekel[_ngcontent-%COMP%]:before, .fa-sheqel[_ngcontent-%COMP%]:before{content:\"\uF20B\"}.fa-meanpath[_ngcontent-%COMP%]:before{content:\"\uF20C\"}.fa-buysellads[_ngcontent-%COMP%]:before{content:\"\uF20D\"}.fa-connectdevelop[_ngcontent-%COMP%]:before{content:\"\uF20E\"}.fa-dashcube[_ngcontent-%COMP%]:before{content:\"\uF210\"}.fa-forumbee[_ngcontent-%COMP%]:before{content:\"\uF211\"}.fa-leanpub[_ngcontent-%COMP%]:before{content:\"\uF212\"}.fa-sellsy[_ngcontent-%COMP%]:before{content:\"\uF213\"}.fa-shirtsinbulk[_ngcontent-%COMP%]:before{content:\"\uF214\"}.fa-simplybuilt[_ngcontent-%COMP%]:before{content:\"\uF215\"}.fa-skyatlas[_ngcontent-%COMP%]:before{content:\"\uF216\"}.fa-cart-plus[_ngcontent-%COMP%]:before{content:\"\uF217\"}.fa-cart-arrow-down[_ngcontent-%COMP%]:before{content:\"\uF218\"}.fa-diamond[_ngcontent-%COMP%]:before{content:\"\uF219\"}.fa-ship[_ngcontent-%COMP%]:before{content:\"\uF21A\"}.fa-user-secret[_ngcontent-%COMP%]:before{content:\"\uF21B\"}.fa-motorcycle[_ngcontent-%COMP%]:before{content:\"\uF21C\"}.fa-street-view[_ngcontent-%COMP%]:before{content:\"\uF21D\"}.fa-heartbeat[_ngcontent-%COMP%]:before{content:\"\uF21E\"}.fa-venus[_ngcontent-%COMP%]:before{content:\"\uF221\"}.fa-mars[_ngcontent-%COMP%]:before{content:\"\uF222\"}.fa-mercury[_ngcontent-%COMP%]:before{content:\"\uF223\"}.fa-intersex[_ngcontent-%COMP%]:before, .fa-transgender[_ngcontent-%COMP%]:before{content:\"\uF224\"}.fa-transgender-alt[_ngcontent-%COMP%]:before{content:\"\uF225\"}.fa-venus-double[_ngcontent-%COMP%]:before{content:\"\uF226\"}.fa-mars-double[_ngcontent-%COMP%]:before{content:\"\uF227\"}.fa-venus-mars[_ngcontent-%COMP%]:before{content:\"\uF228\"}.fa-mars-stroke[_ngcontent-%COMP%]:before{content:\"\uF229\"}.fa-mars-stroke-v[_ngcontent-%COMP%]:before{content:\"\uF22A\"}.fa-mars-stroke-h[_ngcontent-%COMP%]:before{content:\"\uF22B\"}.fa-neuter[_ngcontent-%COMP%]:before{content:\"\uF22C\"}.fa-genderless[_ngcontent-%COMP%]:before{content:\"\uF22D\"}.fa-facebook-official[_ngcontent-%COMP%]:before{content:\"\uF230\"}.fa-pinterest-p[_ngcontent-%COMP%]:before{content:\"\uF231\"}.fa-whatsapp[_ngcontent-%COMP%]:before{content:\"\uF232\"}.fa-server[_ngcontent-%COMP%]:before{content:\"\uF233\"}.fa-user-plus[_ngcontent-%COMP%]:before{content:\"\uF234\"}.fa-user-times[_ngcontent-%COMP%]:before{content:\"\uF235\"}.fa-bed[_ngcontent-%COMP%]:before, .fa-hotel[_ngcontent-%COMP%]:before{content:\"\uF236\"}.fa-viacoin[_ngcontent-%COMP%]:before{content:\"\uF237\"}.fa-train[_ngcontent-%COMP%]:before{content:\"\uF238\"}.fa-subway[_ngcontent-%COMP%]:before{content:\"\uF239\"}.fa-medium[_ngcontent-%COMP%]:before{content:\"\uF23A\"}.fa-y-combinator[_ngcontent-%COMP%]:before, .fa-yc[_ngcontent-%COMP%]:before{content:\"\uF23B\"}.fa-optin-monster[_ngcontent-%COMP%]:before{content:\"\uF23C\"}.fa-opencart[_ngcontent-%COMP%]:before{content:\"\uF23D\"}.fa-expeditedssl[_ngcontent-%COMP%]:before{content:\"\uF23E\"}.fa-battery-4[_ngcontent-%COMP%]:before, .fa-battery-full[_ngcontent-%COMP%]:before, .fa-battery[_ngcontent-%COMP%]:before{content:\"\uF240\"}.fa-battery-3[_ngcontent-%COMP%]:before, .fa-battery-three-quarters[_ngcontent-%COMP%]:before{content:\"\uF241\"}.fa-battery-2[_ngcontent-%COMP%]:before, .fa-battery-half[_ngcontent-%COMP%]:before{content:\"\uF242\"}.fa-battery-1[_ngcontent-%COMP%]:before, .fa-battery-quarter[_ngcontent-%COMP%]:before{content:\"\uF243\"}.fa-battery-0[_ngcontent-%COMP%]:before, .fa-battery-empty[_ngcontent-%COMP%]:before{content:\"\uF244\"}.fa-mouse-pointer[_ngcontent-%COMP%]:before{content:\"\uF245\"}.fa-i-cursor[_ngcontent-%COMP%]:before{content:\"\uF246\"}.fa-object-group[_ngcontent-%COMP%]:before{content:\"\uF247\"}.fa-object-ungroup[_ngcontent-%COMP%]:before{content:\"\uF248\"}.fa-sticky-note[_ngcontent-%COMP%]:before{content:\"\uF249\"}.fa-sticky-note-o[_ngcontent-%COMP%]:before{content:\"\uF24A\"}.fa-cc-jcb[_ngcontent-%COMP%]:before{content:\"\uF24B\"}.fa-cc-diners-club[_ngcontent-%COMP%]:before{content:\"\uF24C\"}.fa-clone[_ngcontent-%COMP%]:before{content:\"\uF24D\"}.fa-balance-scale[_ngcontent-%COMP%]:before{content:\"\uF24E\"}.fa-hourglass-o[_ngcontent-%COMP%]:before{content:\"\uF250\"}.fa-hourglass-1[_ngcontent-%COMP%]:before, .fa-hourglass-start[_ngcontent-%COMP%]:before{content:\"\uF251\"}.fa-hourglass-2[_ngcontent-%COMP%]:before, .fa-hourglass-half[_ngcontent-%COMP%]:before{content:\"\uF252\"}.fa-hourglass-3[_ngcontent-%COMP%]:before, .fa-hourglass-end[_ngcontent-%COMP%]:before{content:\"\uF253\"}.fa-hourglass[_ngcontent-%COMP%]:before{content:\"\uF254\"}.fa-hand-grab-o[_ngcontent-%COMP%]:before, .fa-hand-rock-o[_ngcontent-%COMP%]:before{content:\"\uF255\"}.fa-hand-paper-o[_ngcontent-%COMP%]:before, .fa-hand-stop-o[_ngcontent-%COMP%]:before{content:\"\uF256\"}.fa-hand-scissors-o[_ngcontent-%COMP%]:before{content:\"\uF257\"}.fa-hand-lizard-o[_ngcontent-%COMP%]:before{content:\"\uF258\"}.fa-hand-spock-o[_ngcontent-%COMP%]:before{content:\"\uF259\"}.fa-hand-pointer-o[_ngcontent-%COMP%]:before{content:\"\uF25A\"}.fa-hand-peace-o[_ngcontent-%COMP%]:before{content:\"\uF25B\"}.fa-trademark[_ngcontent-%COMP%]:before{content:\"\uF25C\"}.fa-registered[_ngcontent-%COMP%]:before{content:\"\uF25D\"}.fa-creative-commons[_ngcontent-%COMP%]:before{content:\"\uF25E\"}.fa-gg[_ngcontent-%COMP%]:before{content:\"\uF260\"}.fa-gg-circle[_ngcontent-%COMP%]:before{content:\"\uF261\"}.fa-tripadvisor[_ngcontent-%COMP%]:before{content:\"\uF262\"}.fa-odnoklassniki[_ngcontent-%COMP%]:before{content:\"\uF263\"}.fa-odnoklassniki-square[_ngcontent-%COMP%]:before{content:\"\uF264\"}.fa-get-pocket[_ngcontent-%COMP%]:before{content:\"\uF265\"}.fa-wikipedia-w[_ngcontent-%COMP%]:before{content:\"\uF266\"}.fa-safari[_ngcontent-%COMP%]:before{content:\"\uF267\"}.fa-chrome[_ngcontent-%COMP%]:before{content:\"\uF268\"}.fa-firefox[_ngcontent-%COMP%]:before{content:\"\uF269\"}.fa-opera[_ngcontent-%COMP%]:before{content:\"\uF26A\"}.fa-internet-explorer[_ngcontent-%COMP%]:before{content:\"\uF26B\"}.fa-television[_ngcontent-%COMP%]:before, .fa-tv[_ngcontent-%COMP%]:before{content:\"\uF26C\"}.fa-contao[_ngcontent-%COMP%]:before{content:\"\uF26D\"}.fa-500px[_ngcontent-%COMP%]:before{content:\"\uF26E\"}.fa-amazon[_ngcontent-%COMP%]:before{content:\"\uF270\"}.fa-calendar-plus-o[_ngcontent-%COMP%]:before{content:\"\uF271\"}.fa-calendar-minus-o[_ngcontent-%COMP%]:before{content:\"\uF272\"}.fa-calendar-times-o[_ngcontent-%COMP%]:before{content:\"\uF273\"}.fa-calendar-check-o[_ngcontent-%COMP%]:before{content:\"\uF274\"}.fa-industry[_ngcontent-%COMP%]:before{content:\"\uF275\"}.fa-map-pin[_ngcontent-%COMP%]:before{content:\"\uF276\"}.fa-map-signs[_ngcontent-%COMP%]:before{content:\"\uF277\"}.fa-map-o[_ngcontent-%COMP%]:before{content:\"\uF278\"}.fa-map[_ngcontent-%COMP%]:before{content:\"\uF279\"}.fa-commenting[_ngcontent-%COMP%]:before{content:\"\uF27A\"}.fa-commenting-o[_ngcontent-%COMP%]:before{content:\"\uF27B\"}.fa-houzz[_ngcontent-%COMP%]:before{content:\"\uF27C\"}.fa-vimeo[_ngcontent-%COMP%]:before{content:\"\uF27D\"}.fa-black-tie[_ngcontent-%COMP%]:before{content:\"\uF27E\"}.fa-fonticons[_ngcontent-%COMP%]:before{content:\"\uF280\"}.fa-reddit-alien[_ngcontent-%COMP%]:before{content:\"\uF281\"}.fa-edge[_ngcontent-%COMP%]:before{content:\"\uF282\"}.fa-credit-card-alt[_ngcontent-%COMP%]:before{content:\"\uF283\"}.fa-codiepie[_ngcontent-%COMP%]:before{content:\"\uF284\"}.fa-modx[_ngcontent-%COMP%]:before{content:\"\uF285\"}.fa-fort-awesome[_ngcontent-%COMP%]:before{content:\"\uF286\"}.fa-usb[_ngcontent-%COMP%]:before{content:\"\uF287\"}.fa-product-hunt[_ngcontent-%COMP%]:before{content:\"\uF288\"}.fa-mixcloud[_ngcontent-%COMP%]:before{content:\"\uF289\"}.fa-scribd[_ngcontent-%COMP%]:before{content:\"\uF28A\"}.fa-pause-circle[_ngcontent-%COMP%]:before{content:\"\uF28B\"}.fa-pause-circle-o[_ngcontent-%COMP%]:before{content:\"\uF28C\"}.fa-stop-circle[_ngcontent-%COMP%]:before{content:\"\uF28D\"}.fa-stop-circle-o[_ngcontent-%COMP%]:before{content:\"\uF28E\"}.fa-shopping-bag[_ngcontent-%COMP%]:before{content:\"\uF290\"}.fa-shopping-basket[_ngcontent-%COMP%]:before{content:\"\uF291\"}.fa-hashtag[_ngcontent-%COMP%]:before{content:\"\uF292\"}.fa-bluetooth[_ngcontent-%COMP%]:before{content:\"\uF293\"}.fa-bluetooth-b[_ngcontent-%COMP%]:before{content:\"\uF294\"}.fa-percent[_ngcontent-%COMP%]:before{content:\"\uF295\"}.fa-gitlab[_ngcontent-%COMP%]:before{content:\"\uF296\"}.fa-wpbeginner[_ngcontent-%COMP%]:before{content:\"\uF297\"}.fa-wpforms[_ngcontent-%COMP%]:before{content:\"\uF298\"}.fa-envira[_ngcontent-%COMP%]:before{content:\"\uF299\"}.fa-universal-access[_ngcontent-%COMP%]:before{content:\"\uF29A\"}.fa-wheelchair-alt[_ngcontent-%COMP%]:before{content:\"\uF29B\"}.fa-question-circle-o[_ngcontent-%COMP%]:before{content:\"\uF29C\"}.fa-blind[_ngcontent-%COMP%]:before{content:\"\uF29D\"}.fa-audio-description[_ngcontent-%COMP%]:before{content:\"\uF29E\"}.fa-volume-control-phone[_ngcontent-%COMP%]:before{content:\"\uF2A0\"}.fa-braille[_ngcontent-%COMP%]:before{content:\"\uF2A1\"}.fa-assistive-listening-systems[_ngcontent-%COMP%]:before{content:\"\uF2A2\"}.fa-american-sign-language-interpreting[_ngcontent-%COMP%]:before, .fa-asl-interpreting[_ngcontent-%COMP%]:before{content:\"\uF2A3\"}.fa-deaf[_ngcontent-%COMP%]:before, .fa-deafness[_ngcontent-%COMP%]:before, .fa-hard-of-hearing[_ngcontent-%COMP%]:before{content:\"\uF2A4\"}.fa-glide[_ngcontent-%COMP%]:before{content:\"\uF2A5\"}.fa-glide-g[_ngcontent-%COMP%]:before{content:\"\uF2A6\"}.fa-sign-language[_ngcontent-%COMP%]:before, .fa-signing[_ngcontent-%COMP%]:before{content:\"\uF2A7\"}.fa-low-vision[_ngcontent-%COMP%]:before{content:\"\uF2A8\"}.fa-viadeo[_ngcontent-%COMP%]:before{content:\"\uF2A9\"}.fa-viadeo-square[_ngcontent-%COMP%]:before{content:\"\uF2AA\"}.fa-snapchat[_ngcontent-%COMP%]:before{content:\"\uF2AB\"}.fa-snapchat-ghost[_ngcontent-%COMP%]:before{content:\"\uF2AC\"}.fa-snapchat-square[_ngcontent-%COMP%]:before{content:\"\uF2AD\"}.fa-pied-piper[_ngcontent-%COMP%]:before{content:\"\uF2AE\"}.fa-first-order[_ngcontent-%COMP%]:before{content:\"\uF2B0\"}.fa-yoast[_ngcontent-%COMP%]:before{content:\"\uF2B1\"}.fa-themeisle[_ngcontent-%COMP%]:before{content:\"\uF2B2\"}.fa-google-plus-circle[_ngcontent-%COMP%]:before, .fa-google-plus-official[_ngcontent-%COMP%]:before{content:\"\uF2B3\"}.fa-fa[_ngcontent-%COMP%]:before, .fa-font-awesome[_ngcontent-%COMP%]:before{content:\"\uF2B4\"}.fa-handshake-o[_ngcontent-%COMP%]:before{content:\"\uF2B5\"}.fa-envelope-open[_ngcontent-%COMP%]:before{content:\"\uF2B6\"}.fa-envelope-open-o[_ngcontent-%COMP%]:before{content:\"\uF2B7\"}.fa-linode[_ngcontent-%COMP%]:before{content:\"\uF2B8\"}.fa-address-book[_ngcontent-%COMP%]:before{content:\"\uF2B9\"}.fa-address-book-o[_ngcontent-%COMP%]:before{content:\"\uF2BA\"}.fa-address-card[_ngcontent-%COMP%]:before, .fa-vcard[_ngcontent-%COMP%]:before{content:\"\uF2BB\"}.fa-address-card-o[_ngcontent-%COMP%]:before, .fa-vcard-o[_ngcontent-%COMP%]:before{content:\"\uF2BC\"}.fa-user-circle[_ngcontent-%COMP%]:before{content:\"\uF2BD\"}.fa-user-circle-o[_ngcontent-%COMP%]:before{content:\"\uF2BE\"}.fa-user-o[_ngcontent-%COMP%]:before{content:\"\uF2C0\"}.fa-id-badge[_ngcontent-%COMP%]:before{content:\"\uF2C1\"}.fa-drivers-license[_ngcontent-%COMP%]:before, .fa-id-card[_ngcontent-%COMP%]:before{content:\"\uF2C2\"}.fa-drivers-license-o[_ngcontent-%COMP%]:before, .fa-id-card-o[_ngcontent-%COMP%]:before{content:\"\uF2C3\"}.fa-quora[_ngcontent-%COMP%]:before{content:\"\uF2C4\"}.fa-free-code-camp[_ngcontent-%COMP%]:before{content:\"\uF2C5\"}.fa-telegram[_ngcontent-%COMP%]:before{content:\"\uF2C6\"}.fa-thermometer-4[_ngcontent-%COMP%]:before, .fa-thermometer-full[_ngcontent-%COMP%]:before, .fa-thermometer[_ngcontent-%COMP%]:before{content:\"\uF2C7\"}.fa-thermometer-3[_ngcontent-%COMP%]:before, .fa-thermometer-three-quarters[_ngcontent-%COMP%]:before{content:\"\uF2C8\"}.fa-thermometer-2[_ngcontent-%COMP%]:before, .fa-thermometer-half[_ngcontent-%COMP%]:before{content:\"\uF2C9\"}.fa-thermometer-1[_ngcontent-%COMP%]:before, .fa-thermometer-quarter[_ngcontent-%COMP%]:before{content:\"\uF2CA\"}.fa-thermometer-0[_ngcontent-%COMP%]:before, .fa-thermometer-empty[_ngcontent-%COMP%]:before{content:\"\uF2CB\"}.fa-shower[_ngcontent-%COMP%]:before{content:\"\uF2CC\"}.fa-bath[_ngcontent-%COMP%]:before, .fa-bathtub[_ngcontent-%COMP%]:before, .fa-s15[_ngcontent-%COMP%]:before{content:\"\uF2CD\"}.fa-podcast[_ngcontent-%COMP%]:before{content:\"\uF2CE\"}.fa-window-maximize[_ngcontent-%COMP%]:before{content:\"\uF2D0\"}.fa-window-minimize[_ngcontent-%COMP%]:before{content:\"\uF2D1\"}.fa-window-restore[_ngcontent-%COMP%]:before{content:\"\uF2D2\"}.fa-times-rectangle[_ngcontent-%COMP%]:before, .fa-window-close[_ngcontent-%COMP%]:before{content:\"\uF2D3\"}.fa-times-rectangle-o[_ngcontent-%COMP%]:before, .fa-window-close-o[_ngcontent-%COMP%]:before{content:\"\uF2D4\"}.fa-bandcamp[_ngcontent-%COMP%]:before{content:\"\uF2D5\"}.fa-grav[_ngcontent-%COMP%]:before{content:\"\uF2D6\"}.fa-etsy[_ngcontent-%COMP%]:before{content:\"\uF2D7\"}.fa-imdb[_ngcontent-%COMP%]:before{content:\"\uF2D8\"}.fa-ravelry[_ngcontent-%COMP%]:before{content:\"\uF2D9\"}.fa-eercast[_ngcontent-%COMP%]:before{content:\"\uF2DA\"}.fa-microchip[_ngcontent-%COMP%]:before{content:\"\uF2DB\"}.fa-snowflake-o[_ngcontent-%COMP%]:before{content:\"\uF2DC\"}.fa-superpowers[_ngcontent-%COMP%]:before{content:\"\uF2DD\"}.fa-wpexplorer[_ngcontent-%COMP%]:before{content:\"\uF2DE\"}.fa-meetup[_ngcontent-%COMP%]:before{content:\"\uF2E0\"}.sr-only[_ngcontent-%COMP%]{border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.sr-only-focusable[_ngcontent-%COMP%]:active, .sr-only-focusable[_ngcontent-%COMP%]:focus{clip:auto;height:auto;margin:0;overflow:visible;position:static;width:auto}.added-image[_ngcontent-%COMP%], a[_ngcontent-%COMP%]{cursor:pointer}.added-image[_ngcontent-%COMP%]{border:2px solid transparent;margin:0 auto;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content}.close[_ngcontent-%COMP%]{background:#d0d0d0;border-radius:50%;color:grey;cursor:pointer;display:none;font-size:18px;padding:1px 0;position:absolute;right:-17px;top:0;transform:translateY(-50%);width:25px;z-index:999}.added-image[_ngcontent-%COMP%]:hover{border:2px solid #4caa60;border-radius:5px;box-shadow:0 0 0 1px #d0d0d0;margin-bottom:0;padding:0}.added-image[_ngcontent-%COMP%]:hover   .close[_ngcontent-%COMP%]{display:block}.angular-editor-textarea[_ngcontent-%COMP%]{margin-top:5px;min-height:150px;overflow:auto;resize:vertical}.angular-editor-textarea[_ngcontent-%COMP%]:after{background-color:hsla(0,0%,100%,.5);bottom:0;content:\"\";cursor:nwse-resize;display:block;height:8px;position:absolute;right:0;width:8px}.angular-editor-textarea[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:2px 0}.inputfile[_ngcontent-%COMP%]{height:.1px;opacity:0;overflow:hidden;position:absolute;width:.1px;z-index:-1}.inputfile[_ngcontent-%COMP%] + label[_ngcontent-%COMP%]{cursor:pointer;display:inline-block}.angular-editor-toolbar[_ngcontent-%COMP%]{background-color:#f5f5f5;border:1px solid #ddd;display:flex;font:100 14px/15px Roboto,Arial,sans-serif;font-size:.8rem;padding:.2rem}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]{background-color:#fff;border:1px solid #ddd;border-radius:5px;display:inline-block;height:28px;margin-bottom:3px;margin-right:5px;vertical-align:middle}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]{background-color:transparent;border:0 solid #ddd;float:left;min-width:2rem;padding:.4rem}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:first-child{border-radius:5px 0 0 5px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:last-child{border-radius:0 5px 5px 0}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:first-child:last-child{border-radius:5px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button.focus[_ngcontent-%COMP%], .angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:focus{outline:0}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:disabled > .color-label[_ngcontent-%COMP%]{cursor:not-allowed;pointer-events:none}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:disabled > .color-label.background[_ngcontent-%COMP%], .angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button[_ngcontent-%COMP%]:disabled > .color-label.foreground[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:after{background:#555}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button.active[_ngcontent-%COMP%]{background:#fff5b9}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .angular-editor-button.active[_ngcontent-%COMP%]:hover{background-color:#fffa98}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]{background-color:transparent;border:.5px solid hsla(0,0%,100%,0);border-radius:5px;cursor:pointer;font-size:11px;outline:none;padding:.4rem;vertical-align:middle;width:90px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]{display:inline-block;height:24px;width:90px}@supports not (-moz-appearance:none){.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   optgroup[_ngcontent-%COMP%]{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]{background-color:#fff;border:1px solid}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .default[_ngcontent-%COMP%]{font-size:16px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .h1[_ngcontent-%COMP%]{font-size:24px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .h2[_ngcontent-%COMP%]{font-size:20px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .h3[_ngcontent-%COMP%]{font-size:16px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .h4[_ngcontent-%COMP%]{font-size:15px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .h5[_ngcontent-%COMP%]{font-size:14px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .h6[_ngcontent-%COMP%]{font-size:13px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .div[_ngcontent-%COMP%], .angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]   .pre[_ngcontent-%COMP%]{font-size:12px}}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-heading[_ngcontent-%COMP%]:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font[_ngcontent-%COMP%]{display:inline-block;height:24px;width:90px}@supports not (-moz-appearance:none){.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font[_ngcontent-%COMP%]   optgroup[_ngcontent-%COMP%]{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]{background-color:#fff;border:1px solid}}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font[_ngcontent-%COMP%]:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font[_ngcontent-%COMP%]:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]{display:inline-block;height:24px;width:50px}@supports not (-moz-appearance:none){.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   optgroup[_ngcontent-%COMP%]{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]{background-color:#fff;border:1px solid}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size1[_ngcontent-%COMP%]{font-size:10px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size2[_ngcontent-%COMP%]{font-size:12px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size3[_ngcontent-%COMP%]{font-size:14px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size4[_ngcontent-%COMP%]{font-size:16px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size5[_ngcontent-%COMP%]{font-size:18px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size6[_ngcontent-%COMP%]{font-size:20px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]   .size7[_ngcontent-%COMP%]{font-size:22px}}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-font-size[_ngcontent-%COMP%]:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-custom-style[_ngcontent-%COMP%]{display:inline-block;height:24px;width:90px}@supports not (-moz-appearance:none){.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-custom-style[_ngcontent-%COMP%]   optgroup[_ngcontent-%COMP%]{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-custom-style[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]{background-color:#fff;border:1px solid}}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-custom-style[_ngcontent-%COMP%]:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .select-custom-style[_ngcontent-%COMP%]:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .color-label[_ngcontent-%COMP%]{cursor:pointer;position:relative}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .background[_ngcontent-%COMP%]{background:#1b1b1b;color:#fff;font-size:smaller;padding:3px}.angular-editor-toolbar[_ngcontent-%COMP%]   .angular-editor-toolbar-set[_ngcontent-%COMP%]   .foreground[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:after{background:#1b1b1b;bottom:-3px;content:\"\";height:2px;left:-1px;position:absolute;right:auto;top:auto;width:15px;z-index:0}.select-button[_ngcontent-%COMP%]{display:inline-block}.select-button.disabled[_ngcontent-%COMP%]{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.markdown[_ngcontent-%COMP%]{color:#274959;cursor:pointer;font-weight:700;outline:none!important}"] });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AngularEditorToolbarComponent, [{
                type: i0.Component,
                args: [{
                        selector: 'angular-editor-toolbar',
                        templateUrl: './angular-editor-toolbar.component.html',
                        styleUrls: ['./angular-editor-toolbar.component.scss'],
                    }]
            }], function () {
            return [{ type: i0.Renderer2 }, { type: AngularEditorService }, { type: i0.ElementRef }, { type: ImageResizeService }, { type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [i1$1.DOCUMENT]
                        }] }];
        }, { id: [{
                    type: i0.Input
                }], uploadUrl: [{
                    type: i0.Input
                }], upload: [{
                    type: i0.Input
                }], showToolbar: [{
                    type: i0.Input
                }], fonts: [{
                    type: i0.Input
                }], customClasses: [{
                    type: i0.Input
                }], defaultFontName: [{
                    type: i0.Input
                }], defaultFontSize: [{
                    type: i0.Input
                }], hiddenButtons: [{
                    type: i0.Input
                }], execute: [{
                    type: i0.Output
                }], markdownEmitter: [{
                    type: i0.Output
                }], myInputFile: [{
                    type: i0.ViewChild,
                    args: ['fileInput', { static: true }]
                }] });
    })();

    var _c0$1 = ["editor"];
    var _c1 = ["editorWrapper"];
    var _c2 = ["editorToolbar"];
    function AngularEditorComponent_angular_editor_toolbar_2_Template(rf, ctx) {
        if (rf & 1) {
            var _r7_1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "angular-editor-toolbar", 8, 9);
            i0.ɵɵlistener("execute", function AngularEditorComponent_angular_editor_toolbar_2_Template_angular_editor_toolbar_execute_0_listener($event) { i0.ɵɵrestoreView(_r7_1); var ctx_r6 = i0.ɵɵnextContext(); return ctx_r6.executeCommand($event); })("markdownEmitter", function AngularEditorComponent_angular_editor_toolbar_2_Template_angular_editor_toolbar_markdownEmitter_0_listener($event) { i0.ɵɵrestoreView(_r7_1); var ctx_r8 = i0.ɵɵnextContext(); return ctx_r8.emitMarkdown($event); });
            i0.ɵɵelementEnd();
        }
        if (rf & 2) {
            var ctx_r1 = i0.ɵɵnextContext();
            i0.ɵɵproperty("id", ctx_r1.id)("uploadUrl", ctx_r1.config.uploadUrl)("upload", ctx_r1.config.upload)("showToolbar", ctx_r1.config.showToolbar !== undefined ? ctx_r1.config.showToolbar : true)("fonts", ctx_r1.getFonts())("customClasses", ctx_r1.config.customClasses)("defaultFontName", ctx_r1.config.defaultFontName)("defaultFontSize", ctx_r1.config.defaultFontSize)("hiddenButtons", ctx_r1.config.toolbarHiddenButtons);
        }
    }
    function AngularEditorComponent_angular_editor_toolbar_9_Template(rf, ctx) {
        if (rf & 1) {
            var _r11_1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "angular-editor-toolbar", 8, 9);
            i0.ɵɵlistener("execute", function AngularEditorComponent_angular_editor_toolbar_9_Template_angular_editor_toolbar_execute_0_listener($event) { i0.ɵɵrestoreView(_r11_1); var ctx_r10 = i0.ɵɵnextContext(); return ctx_r10.executeCommand($event); })("markdownEmitter", function AngularEditorComponent_angular_editor_toolbar_9_Template_angular_editor_toolbar_markdownEmitter_0_listener($event) { i0.ɵɵrestoreView(_r11_1); var ctx_r12 = i0.ɵɵnextContext(); return ctx_r12.emitMarkdown($event); });
            i0.ɵɵelementEnd();
        }
        if (rf & 2) {
            var ctx_r4 = i0.ɵɵnextContext();
            i0.ɵɵproperty("id", ctx_r4.id)("uploadUrl", ctx_r4.config.uploadUrl)("upload", ctx_r4.config.upload)("showToolbar", ctx_r4.config.showToolbar !== undefined ? ctx_r4.config.showToolbar : true)("fonts", ctx_r4.getFonts())("customClasses", ctx_r4.config.customClasses)("defaultFontName", ctx_r4.config.defaultFontName)("defaultFontSize", ctx_r4.config.defaultFontSize)("hiddenButtons", ctx_r4.config.toolbarHiddenButtons);
        }
    }
    var AngularEditorComponent = /** @class */ (function () {
        function AngularEditorComponent(r, editorService, doc, sanitizer, cdRef, defaultTabIndex, autoFocus) {
            this.r = r;
            this.editorService = editorService;
            this.doc = doc;
            this.sanitizer = sanitizer;
            this.cdRef = cdRef;
            this.autoFocus = autoFocus;
            this.modeVisual = true;
            this.showPlaceholder = false;
            this.disabled = false;
            this.focused = false;
            this.touched = false;
            this.changed = false;
            this.id = '';
            this.config = angularEditorConfig;
            this.placeholder = '';
            this.markdownEmitter = new i0.EventEmitter();
            this.viewMode = new i0.EventEmitter();
            /** emits `blur` event when focused out from the textarea */
            // tslint:disable-next-line:no-output-native no-output-rename
            this.blurEvent = new i0.EventEmitter();
            /** emits `focus` event when focused in to the textarea */
            // tslint:disable-next-line:no-output-rename no-output-native
            this.focusEvent = new i0.EventEmitter();
            this.tabindex = -1;
            var parsedTabIndex = Number(defaultTabIndex);
            this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
        }
        AngularEditorComponent.prototype.onFocus = function () {
            this.focus();
        };
        AngularEditorComponent.prototype.ngOnInit = function () {
            this.config.toolbarPosition = this.config.toolbarPosition ? this.config.toolbarPosition : angularEditorConfig.toolbarPosition;
        };
        AngularEditorComponent.prototype.emitMarkdown = function ($event) {
            this.markdownEmitter.emit($event);
        };
        AngularEditorComponent.prototype.ngAfterViewInit = function () {
            // Replace normal Paste with Paste Plain Text to simplify UX --JCN
            this.textArea.nativeElement.addEventListener('paste', this.plainPaste.bind(this));
            if (isDefined(this.autoFocus)) {
                this.focus();
            }
        };
        AngularEditorComponent.prototype.plainPaste = function (e) {
            console.log();
            e.preventDefault();
            var text = '';
            if (e.clipboardData && e.clipboardData.getData) {
                text = e.clipboardData.getData('text/plain');
                this.doc.execCommand('insertHTML', false, text);
            }
            else if (this.doc.defaultView.clipboardData && this.doc.defaultView.clipboardData.getData) {
                text = this.doc.defaultView.clipboardData.getData('Text');
                if (this.doc.defaultView.getSelection) {
                    var sel = this.doc.defaultView.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        var range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(this.doc.createTextNode(text));
                    }
                }
                else if (this.doc.selection && this.doc.selection.createRange) {
                    this.doc.selection.createRange().text = text;
                }
            }
        };
        AngularEditorComponent.prototype.doInsertHTML = function (name) {
            this.editorService.executeCommand('insertHTML', name);
        };
        /**
         * Executed command from editor header buttons
         * @param command string from triggerCommand
         */
        AngularEditorComponent.prototype.executeCommand = function (command) {
            console.log("***Execute command: " + command);
            this.focus();
            if (command === 'focus') {
                return;
            }
            if (command === 'toggleEditorMode') {
                this.toggleEditorMode(this.modeVisual);
            }
            else if (command !== '') {
                if (command === 'clear') {
                    this.editorService.removeSelectedElements(this.getCustomTags());
                    this.onContentChange(this.textArea.nativeElement);
                }
                else if (command === 'default') {
                    this.editorService.removeSelectedElements('h1,h2,h3,h4,h5,h6,p,pre');
                    this.onContentChange(this.textArea.nativeElement);
                }
                else {
                    this.editorService.executeCommand(command);
                }
                this.exec();
            }
        };
        /**
         * focus event
         */
        AngularEditorComponent.prototype.onTextAreaFocus = function (event) {
            var _this = this;
            // this.focusEvent.emit(event);  // Hack: I think I need this --JCN
            if (this.focused) {
                event.stopPropagation();
                return;
            }
            this.focused = true;
            // console.log(`onTextAreaFocus() setting focused to ${this.focused} for id ${this.id}`);
            this.focusEvent.emit(event);
            if (!this.touched || !this.changed) {
                this.editorService.executeInNextQueueIteration(function () {
                    _this.configure();
                    _this.touched = true;
                });
            }
        };
        /**
         * @description fires when cursor leaves textarea
         */
        AngularEditorComponent.prototype.onTextAreaMouseOut = function (event) {
            this.editorService.saveSelection(this.textArea);
        };
        /**
         * blur event
         */
        AngularEditorComponent.prototype.onTextAreaBlur = function (event) {
            /**
             * save selection if focussed out
             */
            // this.editorService.executeInNextQueueIteration(this.editorService.saveSelection);
            // Changing from async to sync here seemed to fix an "unfocused" problem
            this.editorService.saveSelection(this.textArea);
            if (typeof this.onTouched === 'function') {
                this.onTouched();
            }
            if (event.relatedTarget !== null) {
                var parent = event.relatedTarget.parentElement;
                if (!parent.classList.contains('angular-editor-toolbar-set') && !parent.classList.contains('ae-picker')) {
                    this.blurEvent.emit(event);
                    this.focused = false;
                    // console.log(`onTextAreaBlur() setting focused to ${this.focused} for id ${this.id}`);
                }
            }
            else { // Added by JCN (user clicked on random surface somewhere)
                this.blurEvent.emit(event);
                this.focused = false;
                // console.log(`onTextAreaBlur() setting focused to ${this.focused} for id ${this.id} (related target null)`);
            }
        };
        /**
         *  focus the text area when the editor is focused
         */
        AngularEditorComponent.prototype.focus = function () {
            if (this.modeVisual) {
                this.editorService.restoreSelection();
                this.textArea.nativeElement.focus();
            }
            else {
                var sourceText = this.doc.getElementById('sourceText' + this.id);
                sourceText.focus();
                this.focused = true;
                // console.log(`focus() setting focused to ${this.focused} for id ${this.id}`);
            }
        };
        /**
         * Executed from the contenteditable section while the input property changes
         * @param element html element from contenteditable
         */
        AngularEditorComponent.prototype.onContentChange = function (element) {
            var html = '';
            if (this.modeVisual) {
                html = element.innerHTML;
            }
            else {
                html = element.innerText;
            }
            if ((!html || html === '<br>')) {
                html = '';
            }
            if (typeof this.onChange === 'function') {
                this.onChange(this.config.sanitize || this.config.sanitize === undefined ?
                    this.sanitizer.sanitize(i0.SecurityContext.HTML, html) : html);
                if ((!html) !== this.showPlaceholder) {
                    this.togglePlaceholder(this.showPlaceholder);
                }
            }
            this.changed = true;
        };
        /**
         * Set the function to be called
         * when the control receives a change event.
         *
         * @param fn a function
         */
        AngularEditorComponent.prototype.registerOnChange = function (fn) {
            this.onChange = function (e) { return (e === '<br>' ? fn('') : fn(e)); };
        };
        /**
         * Set the function to be called
         * when the control receives a touch event.
         *
         * @param fn a function
         */
        AngularEditorComponent.prototype.registerOnTouched = function (fn) {
            this.onTouched = fn;
        };
        /**
         * Write a new value to the element.
         *
         * @param value value to be executed when there is a change in contenteditable
         */
        AngularEditorComponent.prototype.writeValue = function (value) {
            if ((!value || value === '<br>' || value === '') !== this.showPlaceholder) {
                this.togglePlaceholder(this.showPlaceholder);
            }
            if (value === undefined || value === '' || value === '<br>') {
                value = null;
            }
            this.refreshView(value);
        };
        /**
         * refresh view/HTML of the editor
         *
         * @param value html string from the editor
         */
        AngularEditorComponent.prototype.refreshView = function (value) {
            var normalizedValue = value === null ? '' : value;
            this.r.setProperty(this.textArea.nativeElement, 'innerHTML', normalizedValue);
            return;
        };
        /**
         * toggles placeholder based on input string
         *
         * @param value A HTML string from the editor
         */
        AngularEditorComponent.prototype.togglePlaceholder = function (value) {
            if (!value) {
                this.r.addClass(this.editorWrapper.nativeElement, 'show-placeholder');
                this.showPlaceholder = true;
            }
            else {
                this.r.removeClass(this.editorWrapper.nativeElement, 'show-placeholder');
                this.showPlaceholder = false;
            }
        };
        /**
         * Implements disabled state for this element
         *
         * @param isDisabled Disabled flag
         */
        AngularEditorComponent.prototype.setDisabledState = function (isDisabled) {
            var div = this.textArea.nativeElement;
            var action = isDisabled ? 'addClass' : 'removeClass';
            this.r[action](div, 'disabled');
            this.disabled = isDisabled;
        };
        /**
         * toggles editor mode based on bToSource bool
         *
         * @param bToSource A boolean value from the editor
         */
        AngularEditorComponent.prototype.toggleEditorMode = function (bToSource) {
            var _this = this;
            var oContent;
            var editableElement = this.textArea.nativeElement;
            if (bToSource) {
                oContent = this.r.createText(editableElement.innerHTML);
                this.r.setProperty(editableElement, 'innerHTML', '');
                this.r.setProperty(editableElement, 'contentEditable', false);
                var oPre = this.r.createElement('pre');
                this.r.setStyle(oPre, 'margin', '0');
                this.r.setStyle(oPre, 'outline', 'none');
                var oCode = this.r.createElement('code');
                this.r.setProperty(oCode, 'id', 'sourceText' + this.id);
                this.r.setStyle(oCode, 'display', 'block');
                this.r.setStyle(oCode, 'white-space', 'pre-wrap');
                this.r.setStyle(oCode, 'word-break', 'keep-all');
                this.r.setStyle(oCode, 'outline', 'none');
                this.r.setStyle(oCode, 'margin', '0');
                this.r.setStyle(oCode, 'background-color', '#fff5b9');
                this.r.setProperty(oCode, 'contentEditable', true);
                this.r.appendChild(oCode, oContent);
                this.focusInstance = this.r.listen(oCode, 'focus', function (event) { return _this.onTextAreaFocus(event); });
                this.blurInstance = this.r.listen(oCode, 'blur', function (event) { return _this.onTextAreaBlur(event); });
                this.r.appendChild(oPre, oCode);
                this.r.appendChild(editableElement, oPre);
                // ToDo move to service
                // paragraph seems better --JN
                this.doc.execCommand('defaultParagraphSeparator', false, 'p');
                // this.doc.execCommand('defaultParagraphSeparator', false, 'div');
                this.modeVisual = false;
                this.viewMode.emit(false);
                oCode.focus();
            }
            else {
                if (this.doc.querySelectorAll) {
                    this.r.setProperty(editableElement, 'innerHTML', editableElement.innerText);
                }
                else {
                    oContent = this.doc.createRange();
                    oContent.selectNodeContents(editableElement.firstChild);
                    this.r.setProperty(editableElement, 'innerHTML', oContent.toString());
                }
                this.r.setProperty(editableElement, 'contentEditable', true);
                this.modeVisual = true;
                this.viewMode.emit(true);
                this.onContentChange(editableElement);
                editableElement.focus();
            }
            this.editorToolbar.setEditorMode(!this.modeVisual);
        };
        /**
         * toggles editor buttons when cursor moved or positioning
         *
         * Send a node array from the contentEditable of the editor
         */
        AngularEditorComponent.prototype.exec = function () {
            if (this.editorToolbar && this.editorToolbar.triggerButtons) {
                this.editorToolbar.triggerButtons();
            }
            var userSelection;
            if (this.doc.getSelection) {
                userSelection = this.doc.getSelection();
                this.editorService.executeInNextQueueIteration(this.editorService.saveSelection.bind(this, this.textArea));
            }
            var a = userSelection.focusNode;
            var els = [];
            while (a && a.id !== 'editor') {
                els.unshift(a);
                a = a.parentNode;
            }
            if (this.editorToolbar && this.editorToolbar.triggerBlocks) {
                this.editorToolbar.triggerBlocks(els);
            }
        };
        AngularEditorComponent.prototype.configure = function () {
            this.editorService.uploadUrl = this.config.uploadUrl;
            this.editorService.uploadWithCredentials = this.config.uploadWithCredentials;
            if (this.config.defaultParagraphSeparator) {
                this.editorService.setDefaultParagraphSeparator(this.config.defaultParagraphSeparator);
            }
            if (this.config.defaultFontName) {
                this.editorService.setFontName(this.config.defaultFontName);
            }
            if (this.config.defaultFontSize) {
                this.editorService.setFontSize(this.config.defaultFontSize);
            }
        };
        AngularEditorComponent.prototype.getFonts = function () {
            var fonts = this.config.fonts ? this.config.fonts : angularEditorConfig.fonts;
            return fonts.map(function (x) {
                return { label: x.name, value: x.name };
            });
        };
        AngularEditorComponent.prototype.getCustomTags = function () {
            var tags = ['span'];
            this.config.customClasses.forEach(function (x) {
                if (x.tag !== undefined) {
                    if (!tags.includes(x.tag)) {
                        tags.push(x.tag);
                    }
                }
            });
            return tags.join(',');
        };
        AngularEditorComponent.prototype.ngOnDestroy = function () {
            if (this.blurInstance) {
                this.blurInstance();
            }
            if (this.focusInstance) {
                this.focusInstance();
            }
        };
        AngularEditorComponent.prototype.filterStyles = function (html) {
            html = html.replace('position: fixed;', '');
            return html;
        };
        return AngularEditorComponent;
    }());
    AngularEditorComponent.ɵfac = function AngularEditorComponent_Factory(t) { return new (t || AngularEditorComponent)(i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(AngularEditorService), i0.ɵɵdirectiveInject(i1$1.DOCUMENT), i0.ɵɵdirectiveInject(i2.DomSanitizer), i0.ɵɵdirectiveInject(i0.ChangeDetectorRef), i0.ɵɵinjectAttribute('tabindex'), i0.ɵɵinjectAttribute('autofocus')); };
    AngularEditorComponent.ɵcmp = i0.ɵɵdefineComponent({ type: AngularEditorComponent, selectors: [["angular-editor"]], viewQuery: function AngularEditorComponent_Query(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵstaticViewQuery(_c0$1, true);
                i0.ɵɵstaticViewQuery(_c1, true);
                i0.ɵɵstaticViewQuery(_c2, true);
            }
            if (rf & 2) {
                var _t;
                i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.textArea = _t.first);
                i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.editorWrapper = _t.first);
                i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.editorToolbar = _t.first);
            }
        }, hostVars: 1, hostBindings: function AngularEditorComponent_HostBindings(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵlistener("focus", function AngularEditorComponent_focus_HostBindingHandler() { return ctx.onFocus(); });
            }
            if (rf & 2) {
                i0.ɵɵattribute("tabindex", ctx.tabindex);
            }
        }, inputs: { id: "id", config: "config", placeholder: "placeholder", tabIndex: "tabIndex" }, outputs: { html: "html", markdownEmitter: "markdownEmitter", viewMode: "viewMode", blurEvent: "blur", focusEvent: "focus" }, features: [i0.ɵɵProvidersFeature([
                {
                    provide: forms.NG_VALUE_ACCESSOR,
                    useExisting: i0.forwardRef(function () { return AngularEditorComponent; }),
                    multi: true
                },
                AngularEditorService,
                ImageResizeService
            ])], decls: 10, vars: 19, consts: [[1, "angular-editor"], ["angularEditor", ""], [3, "id", "uploadUrl", "upload", "showToolbar", "fonts", "customClasses", "defaultFontName", "defaultFontSize", "hiddenButtons", "execute", "markdownEmitter", 4, "ngIf"], [1, "angular-editor-wrapper"], ["editorWrapper", ""], [1, "angular-editor-textarea", 3, "input", "focus", "blur", "click", "keyup", "mouseout"], ["editor", ""], [1, "angular-editor-placeholder"], [3, "id", "uploadUrl", "upload", "showToolbar", "fonts", "customClasses", "defaultFontName", "defaultFontSize", "hiddenButtons", "execute", "markdownEmitter"], ["editorToolbar", ""]], template: function AngularEditorComponent_Template(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵelementStart(0, "div", 0, 1);
                i0.ɵɵtemplate(2, AngularEditorComponent_angular_editor_toolbar_2_Template, 2, 9, "angular-editor-toolbar", 2);
                i0.ɵɵelementStart(3, "div", 3, 4);
                i0.ɵɵelementStart(5, "div", 5, 6);
                i0.ɵɵlistener("input", function AngularEditorComponent_Template_div_input_5_listener($event) { return ctx.onContentChange($event.target); })("focus", function AngularEditorComponent_Template_div_focus_5_listener($event) { return ctx.onTextAreaFocus($event); })("blur", function AngularEditorComponent_Template_div_blur_5_listener($event) { return ctx.onTextAreaBlur($event); })("click", function AngularEditorComponent_Template_div_click_5_listener() { return ctx.exec(); })("keyup", function AngularEditorComponent_Template_div_keyup_5_listener() { return ctx.exec(); })("mouseout", function AngularEditorComponent_Template_div_mouseout_5_listener($event) { return ctx.onTextAreaMouseOut($event); });
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(7, "span", 7);
                i0.ɵɵtext(8);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵtemplate(9, AngularEditorComponent_angular_editor_toolbar_9_Template, 2, 9, "angular-editor-toolbar", 2);
                i0.ɵɵelementEnd();
            }
            if (rf & 2) {
                i0.ɵɵstyleProp("width", ctx.config.width)("min-width", ctx.config.minWidth);
                i0.ɵɵadvance(2);
                i0.ɵɵproperty("ngIf", ctx.config.toolbarPosition === "top");
                i0.ɵɵadvance(3);
                i0.ɵɵstyleProp("height", ctx.config.height)("min-height", ctx.config.minHeight)("max-height", ctx.config.maxHeight)("outline", ctx.config.outline === false ? "none" : undefined);
                i0.ɵɵattribute("contenteditable", ctx.config.editable)("tabindex", ctx.disabled ? -1 : ctx.tabIndex)("translate", ctx.config.translate)("spellcheck", ctx.config.spellcheck);
                i0.ɵɵadvance(3);
                i0.ɵɵtextInterpolate(ctx.placeholder || ctx.config["placeholder"]);
                i0.ɵɵadvance(1);
                i0.ɵɵproperty("ngIf", ctx.config.toolbarPosition === "bottom");
            }
        }, directives: [i1$1.NgIf, AngularEditorToolbarComponent], styles: ["@charset \"UTF-8\";\n/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */@font-face{font-family:FontAwesome;font-style:normal;font-weight:400;src:url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.eot?v=4.7.0);src:url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.eot#iefix&v=4.7.0) format(\"embedded-opentype\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0) format(\"woff2\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff?v=4.7.0) format(\"woff\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf?v=4.7.0) format(\"truetype\"),url(https://netdna.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.svg?v=4.7.0#fontawesomeregular) format(\"svg\")}.fa{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto}.fa-lg{font-size:1.3333333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{text-align:center;width:1.2857142857em}.fa-ul{list-style-type:none;margin-left:2.1428571429em;padding-left:0}.fa-ul>li{position:relative}.fa-li{left:-2.1428571429em;position:absolute;text-align:center;top:.1428571429em;width:2.1428571429em}.fa-li.fa-lg{left:-1.8571428571em}.fa-border{border:.08em solid #eee;border-radius:.1em;padding:.2em .25em .15em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left{margin-right:.3em}.fa.fa-pull-right{margin-left:.3em}.pull-right{float:right}.pull-left{float:left}.fa.pull-left{margin-right:.3em}.fa.pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s linear infinite;animation:fa-spin 2s linear infinite}.fa-pulse{-webkit-animation:fa-spin 1s steps(8) infinite;animation:fa-spin 1s steps(8) infinite}@-webkit-keyframes fa-spin{0%{transform:rotate(0deg)}to{transform:rotate(359deg)}}@keyframes fa-spin{0%{transform:rotate(0deg)}to{transform:rotate(359deg)}}.fa-rotate-90{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";transform:rotate(90deg)}.fa-rotate-180{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";transform:rotate(180deg)}.fa-rotate-270{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";transform:rotate(270deg)}.fa-flip-horizontal{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";transform:scaleX(-1)}.fa-flip-vertical{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";transform:scaleY(-1)}:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-90,:root .fa-rotate-180,:root .fa-rotate-270{filter:none}.fa-stack{display:inline-block;height:2em;line-height:2em;position:relative;vertical-align:middle;width:2em}.fa-stack-1x,.fa-stack-2x{left:0;position:absolute;text-align:center;width:100%}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-glass:before{content:\"\uF000\"}.fa-music:before{content:\"\uF001\"}.fa-search:before{content:\"\uF002\"}.fa-envelope-o:before{content:\"\uF003\"}.fa-heart:before{content:\"\uF004\"}.fa-star:before{content:\"\uF005\"}.fa-star-o:before{content:\"\uF006\"}.fa-user:before{content:\"\uF007\"}.fa-film:before{content:\"\uF008\"}.fa-th-large:before{content:\"\uF009\"}.fa-th:before{content:\"\uF00A\"}.fa-th-list:before{content:\"\uF00B\"}.fa-check:before{content:\"\uF00C\"}.fa-close:before,.fa-remove:before,.fa-times:before{content:\"\uF00D\"}.fa-search-plus:before{content:\"\uF00E\"}.fa-search-minus:before{content:\"\uF010\"}.fa-power-off:before{content:\"\uF011\"}.fa-signal:before{content:\"\uF012\"}.fa-cog:before,.fa-gear:before{content:\"\uF013\"}.fa-trash-o:before{content:\"\uF014\"}.fa-home:before{content:\"\uF015\"}.fa-file-o:before{content:\"\uF016\"}.fa-clock-o:before{content:\"\uF017\"}.fa-road:before{content:\"\uF018\"}.fa-download:before{content:\"\uF019\"}.fa-arrow-circle-o-down:before{content:\"\uF01A\"}.fa-arrow-circle-o-up:before{content:\"\uF01B\"}.fa-inbox:before{content:\"\uF01C\"}.fa-play-circle-o:before{content:\"\uF01D\"}.fa-repeat:before,.fa-rotate-right:before{content:\"\uF01E\"}.fa-refresh:before{content:\"\uF021\"}.fa-list-alt:before{content:\"\uF022\"}.fa-lock:before{content:\"\uF023\"}.fa-flag:before{content:\"\uF024\"}.fa-headphones:before{content:\"\uF025\"}.fa-volume-off:before{content:\"\uF026\"}.fa-volume-down:before{content:\"\uF027\"}.fa-volume-up:before{content:\"\uF028\"}.fa-qrcode:before{content:\"\uF029\"}.fa-barcode:before{content:\"\uF02A\"}.fa-tag:before{content:\"\uF02B\"}.fa-tags:before{content:\"\uF02C\"}.fa-book:before{content:\"\uF02D\"}.fa-bookmark:before{content:\"\uF02E\"}.fa-print:before{content:\"\uF02F\"}.fa-camera:before{content:\"\uF030\"}.fa-font:before{content:\"\uF031\"}.fa-bold:before{content:\"\uF032\"}.fa-italic:before{content:\"\uF033\"}.fa-text-height:before{content:\"\uF034\"}.fa-text-width:before{content:\"\uF035\"}.fa-align-left:before{content:\"\uF036\"}.fa-align-center:before{content:\"\uF037\"}.fa-align-right:before{content:\"\uF038\"}.fa-align-justify:before{content:\"\uF039\"}.fa-list:before{content:\"\uF03A\"}.fa-dedent:before,.fa-outdent:before{content:\"\uF03B\"}.fa-indent:before{content:\"\uF03C\"}.fa-video-camera:before{content:\"\uF03D\"}.fa-image:before,.fa-photo:before,.fa-picture-o:before{content:\"\uF03E\"}.fa-pencil:before{content:\"\uF040\"}.fa-map-marker:before{content:\"\uF041\"}.fa-adjust:before{content:\"\uF042\"}.fa-tint:before{content:\"\uF043\"}.fa-edit:before,.fa-pencil-square-o:before{content:\"\uF044\"}.fa-share-square-o:before{content:\"\uF045\"}.fa-check-square-o:before{content:\"\uF046\"}.fa-arrows:before{content:\"\uF047\"}.fa-step-backward:before{content:\"\uF048\"}.fa-fast-backward:before{content:\"\uF049\"}.fa-backward:before{content:\"\uF04A\"}.fa-play:before{content:\"\uF04B\"}.fa-pause:before{content:\"\uF04C\"}.fa-stop:before{content:\"\uF04D\"}.fa-forward:before{content:\"\uF04E\"}.fa-fast-forward:before{content:\"\uF050\"}.fa-step-forward:before{content:\"\uF051\"}.fa-eject:before{content:\"\uF052\"}.fa-chevron-left:before{content:\"\uF053\"}.fa-chevron-right:before{content:\"\uF054\"}.fa-plus-circle:before{content:\"\uF055\"}.fa-minus-circle:before{content:\"\uF056\"}.fa-times-circle:before{content:\"\uF057\"}.fa-check-circle:before{content:\"\uF058\"}.fa-question-circle:before{content:\"\uF059\"}.fa-info-circle:before{content:\"\uF05A\"}.fa-crosshairs:before{content:\"\uF05B\"}.fa-times-circle-o:before{content:\"\uF05C\"}.fa-check-circle-o:before{content:\"\uF05D\"}.fa-ban:before{content:\"\uF05E\"}.fa-arrow-left:before{content:\"\uF060\"}.fa-arrow-right:before{content:\"\uF061\"}.fa-arrow-up:before{content:\"\uF062\"}.fa-arrow-down:before{content:\"\uF063\"}.fa-mail-forward:before,.fa-share:before{content:\"\uF064\"}.fa-expand:before{content:\"\uF065\"}.fa-compress:before{content:\"\uF066\"}.fa-plus:before{content:\"\uF067\"}.fa-minus:before{content:\"\uF068\"}.fa-asterisk:before{content:\"\uF069\"}.fa-exclamation-circle:before{content:\"\uF06A\"}.fa-gift:before{content:\"\uF06B\"}.fa-leaf:before{content:\"\uF06C\"}.fa-fire:before{content:\"\uF06D\"}.fa-eye:before{content:\"\uF06E\"}.fa-eye-slash:before{content:\"\uF070\"}.fa-exclamation-triangle:before,.fa-warning:before{content:\"\uF071\"}.fa-plane:before{content:\"\uF072\"}.fa-calendar:before{content:\"\uF073\"}.fa-random:before{content:\"\uF074\"}.fa-comment:before{content:\"\uF075\"}.fa-magnet:before{content:\"\uF076\"}.fa-chevron-up:before{content:\"\uF077\"}.fa-chevron-down:before{content:\"\uF078\"}.fa-retweet:before{content:\"\uF079\"}.fa-shopping-cart:before{content:\"\uF07A\"}.fa-folder:before{content:\"\uF07B\"}.fa-folder-open:before{content:\"\uF07C\"}.fa-arrows-v:before{content:\"\uF07D\"}.fa-arrows-h:before{content:\"\uF07E\"}.fa-bar-chart-o:before,.fa-bar-chart:before{content:\"\uF080\"}.fa-twitter-square:before{content:\"\uF081\"}.fa-facebook-square:before{content:\"\uF082\"}.fa-camera-retro:before{content:\"\uF083\"}.fa-key:before{content:\"\uF084\"}.fa-cogs:before,.fa-gears:before{content:\"\uF085\"}.fa-comments:before{content:\"\uF086\"}.fa-thumbs-o-up:before{content:\"\uF087\"}.fa-thumbs-o-down:before{content:\"\uF088\"}.fa-star-half:before{content:\"\uF089\"}.fa-heart-o:before{content:\"\uF08A\"}.fa-sign-out:before{content:\"\uF08B\"}.fa-linkedin-square:before{content:\"\uF08C\"}.fa-thumb-tack:before{content:\"\uF08D\"}.fa-external-link:before{content:\"\uF08E\"}.fa-sign-in:before{content:\"\uF090\"}.fa-trophy:before{content:\"\uF091\"}.fa-github-square:before{content:\"\uF092\"}.fa-upload:before{content:\"\uF093\"}.fa-lemon-o:before{content:\"\uF094\"}.fa-phone:before{content:\"\uF095\"}.fa-square-o:before{content:\"\uF096\"}.fa-bookmark-o:before{content:\"\uF097\"}.fa-phone-square:before{content:\"\uF098\"}.fa-twitter:before{content:\"\uF099\"}.fa-facebook-f:before,.fa-facebook:before{content:\"\uF09A\"}.fa-github:before{content:\"\uF09B\"}.fa-unlock:before{content:\"\uF09C\"}.fa-credit-card:before{content:\"\uF09D\"}.fa-feed:before,.fa-rss:before{content:\"\uF09E\"}.fa-hdd-o:before{content:\"\uF0A0\"}.fa-bullhorn:before{content:\"\uF0A1\"}.fa-bell:before{content:\"\uF0F3\"}.fa-certificate:before{content:\"\uF0A3\"}.fa-hand-o-right:before{content:\"\uF0A4\"}.fa-hand-o-left:before{content:\"\uF0A5\"}.fa-hand-o-up:before{content:\"\uF0A6\"}.fa-hand-o-down:before{content:\"\uF0A7\"}.fa-arrow-circle-left:before{content:\"\uF0A8\"}.fa-arrow-circle-right:before{content:\"\uF0A9\"}.fa-arrow-circle-up:before{content:\"\uF0AA\"}.fa-arrow-circle-down:before{content:\"\uF0AB\"}.fa-globe:before{content:\"\uF0AC\"}.fa-wrench:before{content:\"\uF0AD\"}.fa-tasks:before{content:\"\uF0AE\"}.fa-filter:before{content:\"\uF0B0\"}.fa-briefcase:before{content:\"\uF0B1\"}.fa-arrows-alt:before{content:\"\uF0B2\"}.fa-group:before,.fa-users:before{content:\"\uF0C0\"}.fa-chain:before,.fa-link:before{content:\"\uF0C1\"}.fa-cloud:before{content:\"\uF0C2\"}.fa-flask:before{content:\"\uF0C3\"}.fa-cut:before,.fa-scissors:before{content:\"\uF0C4\"}.fa-copy:before,.fa-files-o:before{content:\"\uF0C5\"}.fa-paperclip:before{content:\"\uF0C6\"}.fa-floppy-o:before,.fa-save:before{content:\"\uF0C7\"}.fa-square:before{content:\"\uF0C8\"}.fa-bars:before,.fa-navicon:before,.fa-reorder:before{content:\"\uF0C9\"}.fa-list-ul:before{content:\"\uF0CA\"}.fa-list-ol:before{content:\"\uF0CB\"}.fa-strikethrough:before{content:\"\uF0CC\"}.fa-underline:before{content:\"\uF0CD\"}.fa-table:before{content:\"\uF0CE\"}.fa-magic:before{content:\"\uF0D0\"}.fa-truck:before{content:\"\uF0D1\"}.fa-pinterest:before{content:\"\uF0D2\"}.fa-pinterest-square:before{content:\"\uF0D3\"}.fa-google-plus-square:before{content:\"\uF0D4\"}.fa-google-plus:before{content:\"\uF0D5\"}.fa-money:before{content:\"\uF0D6\"}.fa-caret-down:before{content:\"\uF0D7\"}.fa-caret-up:before{content:\"\uF0D8\"}.fa-caret-left:before{content:\"\uF0D9\"}.fa-caret-right:before{content:\"\uF0DA\"}.fa-columns:before{content:\"\uF0DB\"}.fa-sort:before,.fa-unsorted:before{content:\"\uF0DC\"}.fa-sort-desc:before,.fa-sort-down:before{content:\"\uF0DD\"}.fa-sort-asc:before,.fa-sort-up:before{content:\"\uF0DE\"}.fa-envelope:before{content:\"\uF0E0\"}.fa-linkedin:before{content:\"\uF0E1\"}.fa-rotate-left:before,.fa-undo:before{content:\"\uF0E2\"}.fa-gavel:before,.fa-legal:before{content:\"\uF0E3\"}.fa-dashboard:before,.fa-tachometer:before{content:\"\uF0E4\"}.fa-comment-o:before{content:\"\uF0E5\"}.fa-comments-o:before{content:\"\uF0E6\"}.fa-bolt:before,.fa-flash:before{content:\"\uF0E7\"}.fa-sitemap:before{content:\"\uF0E8\"}.fa-umbrella:before{content:\"\uF0E9\"}.fa-clipboard:before,.fa-paste:before{content:\"\uF0EA\"}.fa-lightbulb-o:before{content:\"\uF0EB\"}.fa-exchange:before{content:\"\uF0EC\"}.fa-cloud-download:before{content:\"\uF0ED\"}.fa-cloud-upload:before{content:\"\uF0EE\"}.fa-user-md:before{content:\"\uF0F0\"}.fa-stethoscope:before{content:\"\uF0F1\"}.fa-suitcase:before{content:\"\uF0F2\"}.fa-bell-o:before{content:\"\uF0A2\"}.fa-coffee:before{content:\"\uF0F4\"}.fa-cutlery:before{content:\"\uF0F5\"}.fa-file-text-o:before{content:\"\uF0F6\"}.fa-building-o:before{content:\"\uF0F7\"}.fa-hospital-o:before{content:\"\uF0F8\"}.fa-ambulance:before{content:\"\uF0F9\"}.fa-medkit:before{content:\"\uF0FA\"}.fa-fighter-jet:before{content:\"\uF0FB\"}.fa-beer:before{content:\"\uF0FC\"}.fa-h-square:before{content:\"\uF0FD\"}.fa-plus-square:before{content:\"\uF0FE\"}.fa-angle-double-left:before{content:\"\uF100\"}.fa-angle-double-right:before{content:\"\uF101\"}.fa-angle-double-up:before{content:\"\uF102\"}.fa-angle-double-down:before{content:\"\uF103\"}.fa-angle-left:before{content:\"\uF104\"}.fa-angle-right:before{content:\"\uF105\"}.fa-angle-up:before{content:\"\uF106\"}.fa-angle-down:before{content:\"\uF107\"}.fa-desktop:before{content:\"\uF108\"}.fa-laptop:before{content:\"\uF109\"}.fa-tablet:before{content:\"\uF10A\"}.fa-mobile-phone:before,.fa-mobile:before{content:\"\uF10B\"}.fa-circle-o:before{content:\"\uF10C\"}.fa-quote-left:before{content:\"\uF10D\"}.fa-quote-right:before{content:\"\uF10E\"}.fa-spinner:before{content:\"\uF110\"}.fa-circle:before{content:\"\uF111\"}.fa-mail-reply:before,.fa-reply:before{content:\"\uF112\"}.fa-github-alt:before{content:\"\uF113\"}.fa-folder-o:before{content:\"\uF114\"}.fa-folder-open-o:before{content:\"\uF115\"}.fa-smile-o:before{content:\"\uF118\"}.fa-frown-o:before{content:\"\uF119\"}.fa-meh-o:before{content:\"\uF11A\"}.fa-gamepad:before{content:\"\uF11B\"}.fa-keyboard-o:before{content:\"\uF11C\"}.fa-flag-o:before{content:\"\uF11D\"}.fa-flag-checkered:before{content:\"\uF11E\"}.fa-terminal:before{content:\"\uF120\"}.fa-code:before{content:\"\uF121\"}.fa-mail-reply-all:before,.fa-reply-all:before{content:\"\uF122\"}.fa-star-half-empty:before,.fa-star-half-full:before,.fa-star-half-o:before{content:\"\uF123\"}.fa-location-arrow:before{content:\"\uF124\"}.fa-crop:before{content:\"\uF125\"}.fa-code-fork:before{content:\"\uF126\"}.fa-chain-broken:before,.fa-unlink:before{content:\"\uF127\"}.fa-question:before{content:\"\uF128\"}.fa-info:before{content:\"\uF129\"}.fa-exclamation:before{content:\"\uF12A\"}.fa-superscript:before{content:\"\uF12B\"}.fa-subscript:before{content:\"\uF12C\"}.fa-eraser:before{content:\"\uF12D\"}.fa-puzzle-piece:before{content:\"\uF12E\"}.fa-microphone:before{content:\"\uF130\"}.fa-microphone-slash:before{content:\"\uF131\"}.fa-shield:before{content:\"\uF132\"}.fa-calendar-o:before{content:\"\uF133\"}.fa-fire-extinguisher:before{content:\"\uF134\"}.fa-rocket:before{content:\"\uF135\"}.fa-maxcdn:before{content:\"\uF136\"}.fa-chevron-circle-left:before{content:\"\uF137\"}.fa-chevron-circle-right:before{content:\"\uF138\"}.fa-chevron-circle-up:before{content:\"\uF139\"}.fa-chevron-circle-down:before{content:\"\uF13A\"}.fa-html5:before{content:\"\uF13B\"}.fa-css3:before{content:\"\uF13C\"}.fa-anchor:before{content:\"\uF13D\"}.fa-unlock-alt:before{content:\"\uF13E\"}.fa-bullseye:before{content:\"\uF140\"}.fa-ellipsis-h:before{content:\"\uF141\"}.fa-ellipsis-v:before{content:\"\uF142\"}.fa-rss-square:before{content:\"\uF143\"}.fa-play-circle:before{content:\"\uF144\"}.fa-ticket:before{content:\"\uF145\"}.fa-minus-square:before{content:\"\uF146\"}.fa-minus-square-o:before{content:\"\uF147\"}.fa-level-up:before{content:\"\uF148\"}.fa-level-down:before{content:\"\uF149\"}.fa-check-square:before{content:\"\uF14A\"}.fa-pencil-square:before{content:\"\uF14B\"}.fa-external-link-square:before{content:\"\uF14C\"}.fa-share-square:before{content:\"\uF14D\"}.fa-compass:before{content:\"\uF14E\"}.fa-caret-square-o-down:before,.fa-toggle-down:before{content:\"\uF150\"}.fa-caret-square-o-up:before,.fa-toggle-up:before{content:\"\uF151\"}.fa-caret-square-o-right:before,.fa-toggle-right:before{content:\"\uF152\"}.fa-eur:before,.fa-euro:before{content:\"\uF153\"}.fa-gbp:before{content:\"\uF154\"}.fa-dollar:before,.fa-usd:before{content:\"\uF155\"}.fa-inr:before,.fa-rupee:before{content:\"\uF156\"}.fa-cny:before,.fa-jpy:before,.fa-rmb:before,.fa-yen:before{content:\"\uF157\"}.fa-rouble:before,.fa-rub:before,.fa-ruble:before{content:\"\uF158\"}.fa-krw:before,.fa-won:before{content:\"\uF159\"}.fa-bitcoin:before,.fa-btc:before{content:\"\uF15A\"}.fa-file:before{content:\"\uF15B\"}.fa-file-text:before{content:\"\uF15C\"}.fa-sort-alpha-asc:before{content:\"\uF15D\"}.fa-sort-alpha-desc:before{content:\"\uF15E\"}.fa-sort-amount-asc:before{content:\"\uF160\"}.fa-sort-amount-desc:before{content:\"\uF161\"}.fa-sort-numeric-asc:before{content:\"\uF162\"}.fa-sort-numeric-desc:before{content:\"\uF163\"}.fa-thumbs-up:before{content:\"\uF164\"}.fa-thumbs-down:before{content:\"\uF165\"}.fa-youtube-square:before{content:\"\uF166\"}.fa-youtube:before{content:\"\uF167\"}.fa-xing:before{content:\"\uF168\"}.fa-xing-square:before{content:\"\uF169\"}.fa-youtube-play:before{content:\"\uF16A\"}.fa-dropbox:before{content:\"\uF16B\"}.fa-stack-overflow:before{content:\"\uF16C\"}.fa-instagram:before{content:\"\uF16D\"}.fa-flickr:before{content:\"\uF16E\"}.fa-adn:before{content:\"\uF170\"}.fa-bitbucket:before{content:\"\uF171\"}.fa-bitbucket-square:before{content:\"\uF172\"}.fa-tumblr:before{content:\"\uF173\"}.fa-tumblr-square:before{content:\"\uF174\"}.fa-long-arrow-down:before{content:\"\uF175\"}.fa-long-arrow-up:before{content:\"\uF176\"}.fa-long-arrow-left:before{content:\"\uF177\"}.fa-long-arrow-right:before{content:\"\uF178\"}.fa-apple:before{content:\"\uF179\"}.fa-windows:before{content:\"\uF17A\"}.fa-android:before{content:\"\uF17B\"}.fa-linux:before{content:\"\uF17C\"}.fa-dribbble:before{content:\"\uF17D\"}.fa-skype:before{content:\"\uF17E\"}.fa-foursquare:before{content:\"\uF180\"}.fa-trello:before{content:\"\uF181\"}.fa-female:before{content:\"\uF182\"}.fa-male:before{content:\"\uF183\"}.fa-gittip:before,.fa-gratipay:before{content:\"\uF184\"}.fa-sun-o:before{content:\"\uF185\"}.fa-moon-o:before{content:\"\uF186\"}.fa-archive:before{content:\"\uF187\"}.fa-bug:before{content:\"\uF188\"}.fa-vk:before{content:\"\uF189\"}.fa-weibo:before{content:\"\uF18A\"}.fa-renren:before{content:\"\uF18B\"}.fa-pagelines:before{content:\"\uF18C\"}.fa-stack-exchange:before{content:\"\uF18D\"}.fa-arrow-circle-o-right:before{content:\"\uF18E\"}.fa-arrow-circle-o-left:before{content:\"\uF190\"}.fa-caret-square-o-left:before,.fa-toggle-left:before{content:\"\uF191\"}.fa-dot-circle-o:before{content:\"\uF192\"}.fa-wheelchair:before{content:\"\uF193\"}.fa-vimeo-square:before{content:\"\uF194\"}.fa-try:before,.fa-turkish-lira:before{content:\"\uF195\"}.fa-plus-square-o:before{content:\"\uF196\"}.fa-space-shuttle:before{content:\"\uF197\"}.fa-slack:before{content:\"\uF198\"}.fa-envelope-square:before{content:\"\uF199\"}.fa-wordpress:before{content:\"\uF19A\"}.fa-openid:before{content:\"\uF19B\"}.fa-bank:before,.fa-institution:before,.fa-university:before{content:\"\uF19C\"}.fa-graduation-cap:before,.fa-mortar-board:before{content:\"\uF19D\"}.fa-yahoo:before{content:\"\uF19E\"}.fa-google:before{content:\"\uF1A0\"}.fa-reddit:before{content:\"\uF1A1\"}.fa-reddit-square:before{content:\"\uF1A2\"}.fa-stumbleupon-circle:before{content:\"\uF1A3\"}.fa-stumbleupon:before{content:\"\uF1A4\"}.fa-delicious:before{content:\"\uF1A5\"}.fa-digg:before{content:\"\uF1A6\"}.fa-pied-piper-pp:before{content:\"\uF1A7\"}.fa-pied-piper-alt:before{content:\"\uF1A8\"}.fa-drupal:before{content:\"\uF1A9\"}.fa-joomla:before{content:\"\uF1AA\"}.fa-language:before{content:\"\uF1AB\"}.fa-fax:before{content:\"\uF1AC\"}.fa-building:before{content:\"\uF1AD\"}.fa-child:before{content:\"\uF1AE\"}.fa-paw:before{content:\"\uF1B0\"}.fa-spoon:before{content:\"\uF1B1\"}.fa-cube:before{content:\"\uF1B2\"}.fa-cubes:before{content:\"\uF1B3\"}.fa-behance:before{content:\"\uF1B4\"}.fa-behance-square:before{content:\"\uF1B5\"}.fa-steam:before{content:\"\uF1B6\"}.fa-steam-square:before{content:\"\uF1B7\"}.fa-recycle:before{content:\"\uF1B8\"}.fa-automobile:before,.fa-car:before{content:\"\uF1B9\"}.fa-cab:before,.fa-taxi:before{content:\"\uF1BA\"}.fa-tree:before{content:\"\uF1BB\"}.fa-spotify:before{content:\"\uF1BC\"}.fa-deviantart:before{content:\"\uF1BD\"}.fa-soundcloud:before{content:\"\uF1BE\"}.fa-database:before{content:\"\uF1C0\"}.fa-file-pdf-o:before{content:\"\uF1C1\"}.fa-file-word-o:before{content:\"\uF1C2\"}.fa-file-excel-o:before{content:\"\uF1C3\"}.fa-file-powerpoint-o:before{content:\"\uF1C4\"}.fa-file-image-o:before,.fa-file-photo-o:before,.fa-file-picture-o:before{content:\"\uF1C5\"}.fa-file-archive-o:before,.fa-file-zip-o:before{content:\"\uF1C6\"}.fa-file-audio-o:before,.fa-file-sound-o:before{content:\"\uF1C7\"}.fa-file-movie-o:before,.fa-file-video-o:before{content:\"\uF1C8\"}.fa-file-code-o:before{content:\"\uF1C9\"}.fa-vine:before{content:\"\uF1CA\"}.fa-codepen:before{content:\"\uF1CB\"}.fa-jsfiddle:before{content:\"\uF1CC\"}.fa-life-bouy:before,.fa-life-buoy:before,.fa-life-ring:before,.fa-life-saver:before,.fa-support:before{content:\"\uF1CD\"}.fa-circle-o-notch:before{content:\"\uF1CE\"}.fa-ra:before,.fa-rebel:before,.fa-resistance:before{content:\"\uF1D0\"}.fa-empire:before,.fa-ge:before{content:\"\uF1D1\"}.fa-git-square:before{content:\"\uF1D2\"}.fa-git:before{content:\"\uF1D3\"}.fa-hacker-news:before,.fa-y-combinator-square:before,.fa-yc-square:before{content:\"\uF1D4\"}.fa-tencent-weibo:before{content:\"\uF1D5\"}.fa-qq:before{content:\"\uF1D6\"}.fa-wechat:before,.fa-weixin:before{content:\"\uF1D7\"}.fa-paper-plane:before,.fa-send:before{content:\"\uF1D8\"}.fa-paper-plane-o:before,.fa-send-o:before{content:\"\uF1D9\"}.fa-history:before{content:\"\uF1DA\"}.fa-circle-thin:before{content:\"\uF1DB\"}.fa-header:before{content:\"\uF1DC\"}.fa-paragraph:before{content:\"\uF1DD\"}.fa-sliders:before{content:\"\uF1DE\"}.fa-share-alt:before{content:\"\uF1E0\"}.fa-share-alt-square:before{content:\"\uF1E1\"}.fa-bomb:before{content:\"\uF1E2\"}.fa-futbol-o:before,.fa-soccer-ball-o:before{content:\"\uF1E3\"}.fa-tty:before{content:\"\uF1E4\"}.fa-binoculars:before{content:\"\uF1E5\"}.fa-plug:before{content:\"\uF1E6\"}.fa-slideshare:before{content:\"\uF1E7\"}.fa-twitch:before{content:\"\uF1E8\"}.fa-yelp:before{content:\"\uF1E9\"}.fa-newspaper-o:before{content:\"\uF1EA\"}.fa-wifi:before{content:\"\uF1EB\"}.fa-calculator:before{content:\"\uF1EC\"}.fa-paypal:before{content:\"\uF1ED\"}.fa-google-wallet:before{content:\"\uF1EE\"}.fa-cc-visa:before{content:\"\uF1F0\"}.fa-cc-mastercard:before{content:\"\uF1F1\"}.fa-cc-discover:before{content:\"\uF1F2\"}.fa-cc-amex:before{content:\"\uF1F3\"}.fa-cc-paypal:before{content:\"\uF1F4\"}.fa-cc-stripe:before{content:\"\uF1F5\"}.fa-bell-slash:before{content:\"\uF1F6\"}.fa-bell-slash-o:before{content:\"\uF1F7\"}.fa-trash:before{content:\"\uF1F8\"}.fa-copyright:before{content:\"\uF1F9\"}.fa-at:before{content:\"\uF1FA\"}.fa-eyedropper:before{content:\"\uF1FB\"}.fa-paint-brush:before{content:\"\uF1FC\"}.fa-birthday-cake:before{content:\"\uF1FD\"}.fa-area-chart:before{content:\"\uF1FE\"}.fa-pie-chart:before{content:\"\uF200\"}.fa-line-chart:before{content:\"\uF201\"}.fa-lastfm:before{content:\"\uF202\"}.fa-lastfm-square:before{content:\"\uF203\"}.fa-toggle-off:before{content:\"\uF204\"}.fa-toggle-on:before{content:\"\uF205\"}.fa-bicycle:before{content:\"\uF206\"}.fa-bus:before{content:\"\uF207\"}.fa-ioxhost:before{content:\"\uF208\"}.fa-angellist:before{content:\"\uF209\"}.fa-cc:before{content:\"\uF20A\"}.fa-ils:before,.fa-shekel:before,.fa-sheqel:before{content:\"\uF20B\"}.fa-meanpath:before{content:\"\uF20C\"}.fa-buysellads:before{content:\"\uF20D\"}.fa-connectdevelop:before{content:\"\uF20E\"}.fa-dashcube:before{content:\"\uF210\"}.fa-forumbee:before{content:\"\uF211\"}.fa-leanpub:before{content:\"\uF212\"}.fa-sellsy:before{content:\"\uF213\"}.fa-shirtsinbulk:before{content:\"\uF214\"}.fa-simplybuilt:before{content:\"\uF215\"}.fa-skyatlas:before{content:\"\uF216\"}.fa-cart-plus:before{content:\"\uF217\"}.fa-cart-arrow-down:before{content:\"\uF218\"}.fa-diamond:before{content:\"\uF219\"}.fa-ship:before{content:\"\uF21A\"}.fa-user-secret:before{content:\"\uF21B\"}.fa-motorcycle:before{content:\"\uF21C\"}.fa-street-view:before{content:\"\uF21D\"}.fa-heartbeat:before{content:\"\uF21E\"}.fa-venus:before{content:\"\uF221\"}.fa-mars:before{content:\"\uF222\"}.fa-mercury:before{content:\"\uF223\"}.fa-intersex:before,.fa-transgender:before{content:\"\uF224\"}.fa-transgender-alt:before{content:\"\uF225\"}.fa-venus-double:before{content:\"\uF226\"}.fa-mars-double:before{content:\"\uF227\"}.fa-venus-mars:before{content:\"\uF228\"}.fa-mars-stroke:before{content:\"\uF229\"}.fa-mars-stroke-v:before{content:\"\uF22A\"}.fa-mars-stroke-h:before{content:\"\uF22B\"}.fa-neuter:before{content:\"\uF22C\"}.fa-genderless:before{content:\"\uF22D\"}.fa-facebook-official:before{content:\"\uF230\"}.fa-pinterest-p:before{content:\"\uF231\"}.fa-whatsapp:before{content:\"\uF232\"}.fa-server:before{content:\"\uF233\"}.fa-user-plus:before{content:\"\uF234\"}.fa-user-times:before{content:\"\uF235\"}.fa-bed:before,.fa-hotel:before{content:\"\uF236\"}.fa-viacoin:before{content:\"\uF237\"}.fa-train:before{content:\"\uF238\"}.fa-subway:before{content:\"\uF239\"}.fa-medium:before{content:\"\uF23A\"}.fa-y-combinator:before,.fa-yc:before{content:\"\uF23B\"}.fa-optin-monster:before{content:\"\uF23C\"}.fa-opencart:before{content:\"\uF23D\"}.fa-expeditedssl:before{content:\"\uF23E\"}.fa-battery-4:before,.fa-battery-full:before,.fa-battery:before{content:\"\uF240\"}.fa-battery-3:before,.fa-battery-three-quarters:before{content:\"\uF241\"}.fa-battery-2:before,.fa-battery-half:before{content:\"\uF242\"}.fa-battery-1:before,.fa-battery-quarter:before{content:\"\uF243\"}.fa-battery-0:before,.fa-battery-empty:before{content:\"\uF244\"}.fa-mouse-pointer:before{content:\"\uF245\"}.fa-i-cursor:before{content:\"\uF246\"}.fa-object-group:before{content:\"\uF247\"}.fa-object-ungroup:before{content:\"\uF248\"}.fa-sticky-note:before{content:\"\uF249\"}.fa-sticky-note-o:before{content:\"\uF24A\"}.fa-cc-jcb:before{content:\"\uF24B\"}.fa-cc-diners-club:before{content:\"\uF24C\"}.fa-clone:before{content:\"\uF24D\"}.fa-balance-scale:before{content:\"\uF24E\"}.fa-hourglass-o:before{content:\"\uF250\"}.fa-hourglass-1:before,.fa-hourglass-start:before{content:\"\uF251\"}.fa-hourglass-2:before,.fa-hourglass-half:before{content:\"\uF252\"}.fa-hourglass-3:before,.fa-hourglass-end:before{content:\"\uF253\"}.fa-hourglass:before{content:\"\uF254\"}.fa-hand-grab-o:before,.fa-hand-rock-o:before{content:\"\uF255\"}.fa-hand-paper-o:before,.fa-hand-stop-o:before{content:\"\uF256\"}.fa-hand-scissors-o:before{content:\"\uF257\"}.fa-hand-lizard-o:before{content:\"\uF258\"}.fa-hand-spock-o:before{content:\"\uF259\"}.fa-hand-pointer-o:before{content:\"\uF25A\"}.fa-hand-peace-o:before{content:\"\uF25B\"}.fa-trademark:before{content:\"\uF25C\"}.fa-registered:before{content:\"\uF25D\"}.fa-creative-commons:before{content:\"\uF25E\"}.fa-gg:before{content:\"\uF260\"}.fa-gg-circle:before{content:\"\uF261\"}.fa-tripadvisor:before{content:\"\uF262\"}.fa-odnoklassniki:before{content:\"\uF263\"}.fa-odnoklassniki-square:before{content:\"\uF264\"}.fa-get-pocket:before{content:\"\uF265\"}.fa-wikipedia-w:before{content:\"\uF266\"}.fa-safari:before{content:\"\uF267\"}.fa-chrome:before{content:\"\uF268\"}.fa-firefox:before{content:\"\uF269\"}.fa-opera:before{content:\"\uF26A\"}.fa-internet-explorer:before{content:\"\uF26B\"}.fa-television:before,.fa-tv:before{content:\"\uF26C\"}.fa-contao:before{content:\"\uF26D\"}.fa-500px:before{content:\"\uF26E\"}.fa-amazon:before{content:\"\uF270\"}.fa-calendar-plus-o:before{content:\"\uF271\"}.fa-calendar-minus-o:before{content:\"\uF272\"}.fa-calendar-times-o:before{content:\"\uF273\"}.fa-calendar-check-o:before{content:\"\uF274\"}.fa-industry:before{content:\"\uF275\"}.fa-map-pin:before{content:\"\uF276\"}.fa-map-signs:before{content:\"\uF277\"}.fa-map-o:before{content:\"\uF278\"}.fa-map:before{content:\"\uF279\"}.fa-commenting:before{content:\"\uF27A\"}.fa-commenting-o:before{content:\"\uF27B\"}.fa-houzz:before{content:\"\uF27C\"}.fa-vimeo:before{content:\"\uF27D\"}.fa-black-tie:before{content:\"\uF27E\"}.fa-fonticons:before{content:\"\uF280\"}.fa-reddit-alien:before{content:\"\uF281\"}.fa-edge:before{content:\"\uF282\"}.fa-credit-card-alt:before{content:\"\uF283\"}.fa-codiepie:before{content:\"\uF284\"}.fa-modx:before{content:\"\uF285\"}.fa-fort-awesome:before{content:\"\uF286\"}.fa-usb:before{content:\"\uF287\"}.fa-product-hunt:before{content:\"\uF288\"}.fa-mixcloud:before{content:\"\uF289\"}.fa-scribd:before{content:\"\uF28A\"}.fa-pause-circle:before{content:\"\uF28B\"}.fa-pause-circle-o:before{content:\"\uF28C\"}.fa-stop-circle:before{content:\"\uF28D\"}.fa-stop-circle-o:before{content:\"\uF28E\"}.fa-shopping-bag:before{content:\"\uF290\"}.fa-shopping-basket:before{content:\"\uF291\"}.fa-hashtag:before{content:\"\uF292\"}.fa-bluetooth:before{content:\"\uF293\"}.fa-bluetooth-b:before{content:\"\uF294\"}.fa-percent:before{content:\"\uF295\"}.fa-gitlab:before{content:\"\uF296\"}.fa-wpbeginner:before{content:\"\uF297\"}.fa-wpforms:before{content:\"\uF298\"}.fa-envira:before{content:\"\uF299\"}.fa-universal-access:before{content:\"\uF29A\"}.fa-wheelchair-alt:before{content:\"\uF29B\"}.fa-question-circle-o:before{content:\"\uF29C\"}.fa-blind:before{content:\"\uF29D\"}.fa-audio-description:before{content:\"\uF29E\"}.fa-volume-control-phone:before{content:\"\uF2A0\"}.fa-braille:before{content:\"\uF2A1\"}.fa-assistive-listening-systems:before{content:\"\uF2A2\"}.fa-american-sign-language-interpreting:before,.fa-asl-interpreting:before{content:\"\uF2A3\"}.fa-deaf:before,.fa-deafness:before,.fa-hard-of-hearing:before{content:\"\uF2A4\"}.fa-glide:before{content:\"\uF2A5\"}.fa-glide-g:before{content:\"\uF2A6\"}.fa-sign-language:before,.fa-signing:before{content:\"\uF2A7\"}.fa-low-vision:before{content:\"\uF2A8\"}.fa-viadeo:before{content:\"\uF2A9\"}.fa-viadeo-square:before{content:\"\uF2AA\"}.fa-snapchat:before{content:\"\uF2AB\"}.fa-snapchat-ghost:before{content:\"\uF2AC\"}.fa-snapchat-square:before{content:\"\uF2AD\"}.fa-pied-piper:before{content:\"\uF2AE\"}.fa-first-order:before{content:\"\uF2B0\"}.fa-yoast:before{content:\"\uF2B1\"}.fa-themeisle:before{content:\"\uF2B2\"}.fa-google-plus-circle:before,.fa-google-plus-official:before{content:\"\uF2B3\"}.fa-fa:before,.fa-font-awesome:before{content:\"\uF2B4\"}.fa-handshake-o:before{content:\"\uF2B5\"}.fa-envelope-open:before{content:\"\uF2B6\"}.fa-envelope-open-o:before{content:\"\uF2B7\"}.fa-linode:before{content:\"\uF2B8\"}.fa-address-book:before{content:\"\uF2B9\"}.fa-address-book-o:before{content:\"\uF2BA\"}.fa-address-card:before,.fa-vcard:before{content:\"\uF2BB\"}.fa-address-card-o:before,.fa-vcard-o:before{content:\"\uF2BC\"}.fa-user-circle:before{content:\"\uF2BD\"}.fa-user-circle-o:before{content:\"\uF2BE\"}.fa-user-o:before{content:\"\uF2C0\"}.fa-id-badge:before{content:\"\uF2C1\"}.fa-drivers-license:before,.fa-id-card:before{content:\"\uF2C2\"}.fa-drivers-license-o:before,.fa-id-card-o:before{content:\"\uF2C3\"}.fa-quora:before{content:\"\uF2C4\"}.fa-free-code-camp:before{content:\"\uF2C5\"}.fa-telegram:before{content:\"\uF2C6\"}.fa-thermometer-4:before,.fa-thermometer-full:before,.fa-thermometer:before{content:\"\uF2C7\"}.fa-thermometer-3:before,.fa-thermometer-three-quarters:before{content:\"\uF2C8\"}.fa-thermometer-2:before,.fa-thermometer-half:before{content:\"\uF2C9\"}.fa-thermometer-1:before,.fa-thermometer-quarter:before{content:\"\uF2CA\"}.fa-thermometer-0:before,.fa-thermometer-empty:before{content:\"\uF2CB\"}.fa-shower:before{content:\"\uF2CC\"}.fa-bath:before,.fa-bathtub:before,.fa-s15:before{content:\"\uF2CD\"}.fa-podcast:before{content:\"\uF2CE\"}.fa-window-maximize:before{content:\"\uF2D0\"}.fa-window-minimize:before{content:\"\uF2D1\"}.fa-window-restore:before{content:\"\uF2D2\"}.fa-times-rectangle:before,.fa-window-close:before{content:\"\uF2D3\"}.fa-times-rectangle-o:before,.fa-window-close-o:before{content:\"\uF2D4\"}.fa-bandcamp:before{content:\"\uF2D5\"}.fa-grav:before{content:\"\uF2D6\"}.fa-etsy:before{content:\"\uF2D7\"}.fa-imdb:before{content:\"\uF2D8\"}.fa-ravelry:before{content:\"\uF2D9\"}.fa-eercast:before{content:\"\uF2DA\"}.fa-microchip:before{content:\"\uF2DB\"}.fa-snowflake-o:before{content:\"\uF2DC\"}.fa-superpowers:before{content:\"\uF2DD\"}.fa-wpexplorer:before{content:\"\uF2DE\"}.fa-meetup:before{content:\"\uF2E0\"}.sr-only{border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.sr-only-focusable:active,.sr-only-focusable:focus{clip:auto;height:auto;margin:0;overflow:visible;position:static;width:auto}.added-image,a{cursor:pointer}.added-image{border:2px solid transparent;margin:0 auto;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content}.close{background:#d0d0d0;border-radius:50%;color:grey;cursor:pointer;display:none;font-size:18px;padding:1px 0;position:absolute;right:-17px;top:0;transform:translateY(-50%);width:25px;z-index:999}.added-image:hover{border:2px solid #4caa60;border-radius:5px;box-shadow:0 0 0 1px #d0d0d0;margin-bottom:0;padding:0}.added-image:hover .close{display:block}.angular-editor-textarea{margin-top:5px;min-height:150px;overflow:auto;resize:vertical}.angular-editor-textarea:after{background-color:hsla(0,0%,100%,.5);bottom:0;content:\"\";cursor:nwse-resize;display:block;height:8px;position:absolute;right:0;width:8px}.angular-editor-textarea p{margin:2px 0}.inputfile{height:.1px;opacity:0;overflow:hidden;position:absolute;width:.1px;z-index:-1}.inputfile+label{cursor:pointer;display:inline-block}.angular-editor-toolbar{background-color:#f5f5f5;border:1px solid #ddd;display:flex;font:100 14px/15px Roboto,Arial,sans-serif;font-size:.8rem;padding:.2rem}.angular-editor-toolbar .angular-editor-toolbar-set{background-color:#fff;border:1px solid #ddd;border-radius:5px;display:inline-block;height:28px;margin-bottom:3px;margin-right:5px;vertical-align:middle}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button{background-color:transparent;border:0 solid #ddd;float:left;min-width:2rem;padding:.4rem}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:first-child{border-radius:5px 0 0 5px}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:last-child{border-radius:0 5px 5px 0}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:first-child:last-child{border-radius:5px}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button.focus,.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:focus{outline:0}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:disabled>.color-label{cursor:not-allowed;pointer-events:none}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:disabled>.color-label.background,.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button:disabled>.color-label.foreground :after{background:#555}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button.active{background:#fff5b9}.angular-editor-toolbar .angular-editor-toolbar-set .angular-editor-button.active:hover{background-color:#fffa98}.angular-editor-toolbar .angular-editor-toolbar-set select{background-color:transparent;border:.5px solid hsla(0,0%,100%,0);border-radius:5px;cursor:pointer;font-size:11px;outline:none;padding:.4rem;vertical-align:middle;width:90px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading{display:inline-block;height:24px;width:90px}@supports not (-moz-appearance:none){.angular-editor-toolbar .angular-editor-toolbar-set .select-heading optgroup{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading option{background-color:#fff;border:1px solid}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .default{font-size:16px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .h1{font-size:24px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .h2{font-size:20px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .h3{font-size:16px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .h4{font-size:15px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .h5{font-size:14px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .h6{font-size:13px}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .div,.angular-editor-toolbar .angular-editor-toolbar-set .select-heading .pre{font-size:12px}}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar .angular-editor-toolbar-set .select-heading:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar .angular-editor-toolbar-set .select-font{display:inline-block;height:24px;width:90px}@supports not (-moz-appearance:none){.angular-editor-toolbar .angular-editor-toolbar-set .select-font optgroup{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font option{background-color:#fff;border:1px solid}}.angular-editor-toolbar .angular-editor-toolbar-set .select-font:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar .angular-editor-toolbar-set .select-font:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size{display:inline-block;height:24px;width:50px}@supports not (-moz-appearance:none){.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size optgroup{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size option{background-color:#fff;border:1px solid}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size1{font-size:10px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size2{font-size:12px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size3{font-size:14px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size4{font-size:16px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size5{font-size:18px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size6{font-size:20px}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size .size7{font-size:22px}}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar .angular-editor-toolbar-set .select-font-size:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar .angular-editor-toolbar-set .select-custom-style{display:inline-block;height:24px;width:90px}@supports not (-moz-appearance:none){.angular-editor-toolbar .angular-editor-toolbar-set .select-custom-style optgroup{background-color:#f4f4f4;font-size:12px;padding:5px}.angular-editor-toolbar .angular-editor-toolbar-set .select-custom-style option{background-color:#fff;border:1px solid}}.angular-editor-toolbar .angular-editor-toolbar-set .select-custom-style:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.angular-editor-toolbar .angular-editor-toolbar-set .select-custom-style:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.angular-editor-toolbar .angular-editor-toolbar-set .color-label{cursor:pointer;position:relative}.angular-editor-toolbar .angular-editor-toolbar-set .background{background:#1b1b1b;color:#fff;font-size:smaller;padding:3px}.angular-editor-toolbar .angular-editor-toolbar-set .foreground :after{background:#1b1b1b;bottom:-3px;content:\"\";height:2px;left:-1px;position:absolute;right:auto;top:auto;width:15px;z-index:0}.angular-editor{position:relative}.angular-editor ::ng-deep [contenteditable=true]:empty:before{color:#868e96;content:attr(placeholder);opacity:1}.angular-editor .angular-editor-wrapper{position:relative}.angular-editor .angular-editor-wrapper .angular-editor-textarea:focus{border-color:#ddd}.angular-editor .angular-editor-wrapper .angular-editor-textarea{background-color:transparent;border:1px solid transparent;min-height:5rem;overflow-x:hidden;overflow-y:auto;padding:.5rem .8rem 1rem;position:relative}.angular-editor .angular-editor-wrapper .angular-editor-textarea ::ng-deep blockquote{border-left:.2em solid #dfe2e5;margin-left:1rem;padding-left:.5rem}.angular-editor .angular-editor-wrapper ::ng-deep p{margin-bottom:0}.angular-editor .angular-editor-wrapper .angular-editor-placeholder{color:#6c757d;display:none;opacity:.75;padding:.5rem .8rem 1rem .9rem;position:absolute;top:0}.angular-editor .angular-editor-wrapper.show-placeholder .angular-editor-placeholder{display:block}.angular-editor .angular-editor-wrapper.disabled{cursor:not-allowed;opacity:.5;pointer-events:none}"], encapsulation: 2 });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AngularEditorComponent, [{
                type: i0.Component,
                args: [{
                        selector: 'angular-editor',
                        templateUrl: './angular-editor.component.html',
                        styleUrls: ['./angular-editor.component.scss'],
                        encapsulation: i0.ViewEncapsulation.None,
                        providers: [
                            {
                                provide: forms.NG_VALUE_ACCESSOR,
                                useExisting: i0.forwardRef(function () { return AngularEditorComponent; }),
                                multi: true
                            },
                            AngularEditorService,
                            ImageResizeService
                        ]
                    }]
            }], function () {
            return [{ type: i0.Renderer2 }, { type: AngularEditorService }, { type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [i1$1.DOCUMENT]
                        }] }, { type: i2.DomSanitizer }, { type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                            type: i0.Attribute,
                            args: ['tabindex']
                        }] }, { type: undefined, decorators: [{
                            type: i0.Attribute,
                            args: ['autofocus']
                        }] }];
        }, { id: [{
                    type: i0.Input
                }], config: [{
                    type: i0.Input
                }], placeholder: [{
                    type: i0.Input
                }], tabIndex: [{
                    type: i0.Input
                }], html: [{
                    type: i0.Output
                }], markdownEmitter: [{
                    type: i0.Output
                }], textArea: [{
                    type: i0.ViewChild,
                    args: ['editor', { static: true }]
                }], editorWrapper: [{
                    type: i0.ViewChild,
                    args: ['editorWrapper', { static: true }]
                }], editorToolbar: [{
                    type: i0.ViewChild,
                    args: ['editorToolbar', { static: true }]
                }], viewMode: [{
                    type: i0.Output
                }], blurEvent: [{
                    type: i0.Output,
                    args: ['blur']
                }], focusEvent: [{
                    type: i0.Output,
                    args: ['focus']
                }], tabindex: [{
                    type: i0.HostBinding,
                    args: ['attr.tabindex']
                }], onFocus: [{
                    type: i0.HostListener,
                    args: ['focus']
                }] });
    })();

    var _c0$2 = ["labelButton"];
    var _c1$1 = function (a0, a1) { return { "selected": a0, "focused": a1 }; };
    function AeSelectComponent_button_8_Template(rf, ctx) {
        if (rf & 1) {
            var _r6_1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "button", 9);
            i0.ɵɵlistener("click", function AeSelectComponent_button_8_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r6_1); var item_r3 = ctx.$implicit; var ctx_r5 = i0.ɵɵnextContext(); return ctx_r5.optionSelect(item_r3, $event); });
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
        }
        if (rf & 2) {
            var item_r3 = ctx.$implicit;
            var i_r4 = ctx.index;
            var ctx_r1 = i0.ɵɵnextContext();
            i0.ɵɵproperty("ngClass", i0.ɵɵpureFunction2(2, _c1$1, item_r3.value === ctx_r1.value, i_r4 === ctx_r1.optionId));
            i0.ɵɵadvance(1);
            i0.ɵɵtextInterpolate1(" ", item_r3.label, " ");
        }
    }
    function AeSelectComponent_span_9_Template(rf, ctx) {
        if (rf & 1) {
            i0.ɵɵelementStart(0, "span", 10);
            i0.ɵɵtext(1, "No items for select");
            i0.ɵɵelementEnd();
        }
    }
    var _c2$1 = function (a0) { return { "ae-expanded": a0 }; };
    var AeSelectComponent = /** @class */ (function () {
        function AeSelectComponent(elRef, r) {
            this.elRef = elRef;
            this.r = r;
            this.options = [];
            this.disabled = false;
            this.optionId = 0;
            this.opened = false;
            this.hidden = 'inline-block';
            // tslint:disable-next-line:no-output-native no-output-rename
            this.changeEvent = new i0.EventEmitter();
            this.onChange = function () {
            };
            this.onTouched = function () {
            };
        }
        Object.defineProperty(AeSelectComponent.prototype, "label", {
            get: function () {
                return this.selectedOption && this.selectedOption.hasOwnProperty('label') ? this.selectedOption.label : 'Select';
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AeSelectComponent.prototype, "value", {
            get: function () {
                return this.selectedOption.value;
            },
            enumerable: false,
            configurable: true
        });
        AeSelectComponent.prototype.ngOnInit = function () {
            this.selectedOption = this.options[0];
            if (isDefined(this.isHidden) && this.isHidden) {
                this.hide();
            }
        };
        AeSelectComponent.prototype.hide = function () {
            this.hidden = 'none';
        };
        AeSelectComponent.prototype.optionSelect = function (option, event) {
            event.stopPropagation();
            this.setValue(option.value);
            this.onChange(this.selectedOption.value);
            this.changeEvent.emit(this.selectedOption.value);
            this.onTouched();
            this.opened = false;
        };
        AeSelectComponent.prototype.toggleOpen = function (event) {
            // event.stopPropagation();
            if (this.disabled) {
                return;
            }
            this.opened = !this.opened;
        };
        AeSelectComponent.prototype.onClick = function ($event) {
            if (!this.elRef.nativeElement.contains($event.target)) {
                this.close();
            }
        };
        AeSelectComponent.prototype.close = function () {
            this.opened = false;
        };
        Object.defineProperty(AeSelectComponent.prototype, "isOpen", {
            get: function () {
                return this.opened;
            },
            enumerable: false,
            configurable: true
        });
        AeSelectComponent.prototype.writeValue = function (value) {
            if (!value || typeof value !== 'string') {
                return;
            }
            this.setValue(value);
        };
        AeSelectComponent.prototype.setValue = function (value) {
            var index = 0;
            var selectedEl = this.options.find(function (el, i) {
                index = i;
                return el.value === value;
            });
            if (selectedEl) {
                this.selectedOption = selectedEl;
                this.optionId = index;
            }
        };
        AeSelectComponent.prototype.registerOnChange = function (fn) {
            this.onChange = fn;
        };
        AeSelectComponent.prototype.registerOnTouched = function (fn) {
            this.onTouched = fn;
        };
        AeSelectComponent.prototype.setDisabledState = function (isDisabled) {
            this.labelButton.nativeElement.disabled = isDisabled;
            var div = this.labelButton.nativeElement;
            var action = isDisabled ? 'addClass' : 'removeClass';
            this.r[action](div, 'disabled');
            this.disabled = isDisabled;
        };
        AeSelectComponent.prototype.handleKeyDown = function ($event) {
            if (!this.opened) {
                return;
            }
            // console.log($event.key);
            // if (KeyCode[$event.key]) {
            switch ($event.key) {
                case 'ArrowDown':
                    this._handleArrowDown($event);
                    break;
                case 'ArrowUp':
                    this._handleArrowUp($event);
                    break;
                case 'Space':
                    this._handleSpace($event);
                    break;
                case 'Enter':
                    this._handleEnter($event);
                    break;
                case 'Tab':
                    this._handleTab($event);
                    break;
                case 'Escape':
                    this.close();
                    $event.preventDefault();
                    break;
                case 'Backspace':
                    this._handleBackspace();
                    break;
            }
            // } else if ($event.key && $event.key.length === 1) {
            // this._keyPress$.next($event.key.toLocaleLowerCase());
            // }
        };
        AeSelectComponent.prototype._handleArrowDown = function ($event) {
            if (this.optionId < this.options.length - 1) {
                this.optionId++;
            }
        };
        AeSelectComponent.prototype._handleArrowUp = function ($event) {
            if (this.optionId >= 1) {
                this.optionId--;
            }
        };
        AeSelectComponent.prototype._handleSpace = function ($event) {
        };
        AeSelectComponent.prototype._handleEnter = function ($event) {
            this.optionSelect(this.options[this.optionId], $event);
        };
        AeSelectComponent.prototype._handleTab = function ($event) {
        };
        AeSelectComponent.prototype._handleBackspace = function () {
        };
        return AeSelectComponent;
    }());
    AeSelectComponent.ɵfac = function AeSelectComponent_Factory(t) { return new (t || AeSelectComponent)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Renderer2)); };
    AeSelectComponent.ɵcmp = i0.ɵɵdefineComponent({ type: AeSelectComponent, selectors: [["ae-select"]], viewQuery: function AeSelectComponent_Query(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵstaticViewQuery(_c0$2, true);
            }
            if (rf & 2) {
                var _t;
                i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.labelButton = _t.first);
            }
        }, hostVars: 2, hostBindings: function AeSelectComponent_HostBindings(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵlistener("click", function AeSelectComponent_click_HostBindingHandler($event) { return ctx.onClick($event); }, false, i0.ɵɵresolveDocument)("keydown", function AeSelectComponent_keydown_HostBindingHandler($event) { return ctx.handleKeyDown($event); });
            }
            if (rf & 2) {
                i0.ɵɵstyleProp("display", ctx.hidden);
            }
        }, inputs: { options: "options", isHidden: ["hidden", "isHidden"] }, outputs: { changeEvent: "change" }, features: [i0.ɵɵProvidersFeature([
                {
                    provide: forms.NG_VALUE_ACCESSOR,
                    useExisting: i0.forwardRef(function () { return AeSelectComponent; }),
                    multi: true,
                }
            ])], decls: 10, vars: 7, consts: [[1, "ae-font", "ae-picker", 3, "ngClass"], ["tabindex", "0", "type", "button", "role", "button", 1, "ae-picker-label", 3, "tabIndex", "click"], ["labelButton", ""], ["viewBox", "0 0 18 18"], ["points", "7 11 9 13 11 11 7 11", 1, "ae-stroke"], ["points", "7 7 9 5 11 7 7 7", 1, "ae-stroke"], [1, "ae-picker-options"], ["tabindex", "-1", "type", "button", "role", "button", "class", "ae-picker-item", 3, "ngClass", "click", 4, "ngFor", "ngForOf"], ["class", "dropdown-item", 4, "ngIf"], ["tabindex", "-1", "type", "button", "role", "button", 1, "ae-picker-item", 3, "ngClass", "click"], [1, "dropdown-item"]], template: function AeSelectComponent_Template(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵelementStart(0, "span", 0);
                i0.ɵɵelementStart(1, "button", 1, 2);
                i0.ɵɵlistener("click", function AeSelectComponent_Template_button_click_1_listener($event) { return ctx.toggleOpen($event); });
                i0.ɵɵtext(3);
                i0.ɵɵnamespaceSVG();
                i0.ɵɵelementStart(4, "svg", 3);
                i0.ɵɵelement(5, "polygon", 4);
                i0.ɵɵelement(6, "polygon", 5);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
                i0.ɵɵnamespaceHTML();
                i0.ɵɵelementStart(7, "span", 6);
                i0.ɵɵtemplate(8, AeSelectComponent_button_8_Template, 2, 5, "button", 7);
                i0.ɵɵtemplate(9, AeSelectComponent_span_9_Template, 2, 0, "span", 8);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
            }
            if (rf & 2) {
                i0.ɵɵproperty("ngClass", i0.ɵɵpureFunction1(5, _c2$1, ctx.isOpen));
                i0.ɵɵadvance(1);
                i0.ɵɵproperty("tabIndex", -1);
                i0.ɵɵadvance(2);
                i0.ɵɵtextInterpolate1("", ctx.label, " ");
                i0.ɵɵadvance(5);
                i0.ɵɵproperty("ngForOf", ctx.options);
                i0.ɵɵadvance(1);
                i0.ɵɵproperty("ngIf", !ctx.options.length);
            }
        }, directives: [i1$1.NgClass, i1$1.NgForOf, i1$1.NgIf], styles: [".ae-font.ae-picker{color:#444}.ae-font.ae-picker,.ae-font .ae-picker-label{float:left;position:relative;vertical-align:middle;width:100%}.ae-font .ae-picker-label{background-color:#fff;border:1px solid #ddd;cursor:pointer;font-size:85%;height:100%;line-height:26px;min-width:2rem;overflow:hidden;padding-left:8px;padding-right:10px;text-align:left;text-overflow:clip;white-space:nowrap}.ae-font .ae-picker-label:before{background:linear-gradient(90deg,#fff,#fff);content:\"\";height:100%;position:absolute;right:0;top:0;width:20px}.ae-font .ae-picker-label:focus{outline:none}.ae-font .ae-picker-label:hover{background-color:#f1f1f1;cursor:pointer;transition:.2s ease}.ae-font .ae-picker-label:hover:before{background:linear-gradient(90deg,#f5f5f5 100%,#fff 0)}.ae-font .ae-picker-label:disabled{background-color:#f5f5f5;cursor:not-allowed;pointer-events:none}.ae-font .ae-picker-label:disabled:before{background:linear-gradient(90deg,#f5f5f5 100%,#fff 0)}.ae-font .ae-picker-label svg{margin-top:-9px;position:absolute;right:0;top:50%;width:18px}.ae-font .ae-picker-label svg:not(:root){overflow:hidden}.ae-font .ae-picker-label svg .ae-stroke{fill:none;stroke:#444;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}.ae-font .ae-picker-options{background-color:#fff;border:1px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.2);display:none;min-width:100%;position:absolute;white-space:nowrap;z-index:23}.ae-font .ae-picker-options .ae-picker-item{background-color:transparent;border:0 solid #ddd;cursor:pointer;display:block;min-width:2rem;padding-bottom:5px;padding-left:5px;padding-top:5px;text-align:left;width:100%;z-index:23}.ae-font .ae-picker-options .ae-picker-item.selected{background-color:#fff4c2;color:#06c}.ae-font .ae-picker-options .ae-picker-item.focused,.ae-font .ae-picker-options .ae-picker-item:hover{background-color:#fffa98}.ae-font.ae-expanded{display:block;margin-top:-1px;z-index:21}.ae-font.ae-expanded .ae-picker-label,.ae-font.ae-expanded .ae-picker-label svg{color:#ccc;z-index:22}.ae-font.ae-expanded .ae-picker-label svg .ae-stroke{stroke:#ccc}.ae-font.ae-expanded .ae-picker-options{border-color:#ccc;display:block;margin-top:-1px;top:100%;z-index:23}"], encapsulation: 2 });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AeSelectComponent, [{
                type: i0.Component,
                args: [{
                        selector: 'ae-select',
                        templateUrl: './ae-select.component.html',
                        styleUrls: ['./ae-select.component.scss'],
                        encapsulation: i0.ViewEncapsulation.None,
                        providers: [
                            {
                                provide: forms.NG_VALUE_ACCESSOR,
                                useExisting: i0.forwardRef(function () { return AeSelectComponent; }),
                                multi: true,
                            }
                        ]
                    }]
            }], function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }]; }, { options: [{
                    type: i0.Input
                }], isHidden: [{
                    type: i0.Input,
                    args: ['hidden']
                }], hidden: [{
                    type: i0.HostBinding,
                    args: ['style.display']
                }], changeEvent: [{
                    type: i0.Output,
                    args: ['change']
                }], labelButton: [{
                    type: i0.ViewChild,
                    args: ['labelButton', { static: true }]
                }], onClick: [{
                    type: i0.HostListener,
                    args: ['document:click', ['$event']]
                }], handleKeyDown: [{
                    type: i0.HostListener,
                    args: ['keydown', ['$event']]
                }] });
    })();

    var AngularEditorModule = /** @class */ (function () {
        function AngularEditorModule() {
        }
        return AngularEditorModule;
    }());
    AngularEditorModule.ɵmod = i0.ɵɵdefineNgModule({ type: AngularEditorModule });
    AngularEditorModule.ɵinj = i0.ɵɵdefineInjector({ factory: function AngularEditorModule_Factory(t) { return new (t || AngularEditorModule)(); }, imports: [[
                i1$1.CommonModule, forms.FormsModule, forms.ReactiveFormsModule
            ]] });
    (function () {
        (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AngularEditorModule, { declarations: [AngularEditorComponent,
                AngularEditorToolbarComponent,
                AeSelectComponent], imports: [i1$1.CommonModule, forms.FormsModule, forms.ReactiveFormsModule], exports: [AngularEditorComponent,
                AngularEditorToolbarComponent] });
    })();
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AngularEditorModule, [{
                type: i0.NgModule,
                args: [{
                        imports: [
                            i1$1.CommonModule, forms.FormsModule, forms.ReactiveFormsModule
                        ],
                        declarations: [
                            AngularEditorComponent,
                            AngularEditorToolbarComponent,
                            AeSelectComponent
                        ],
                        // providers: [
                        //   AngularEditorService,
                        //   ImageResizeService
                        // ],
                        exports: [
                            AngularEditorComponent,
                            AngularEditorToolbarComponent
                        ]
                    }]
            }], null, null);
    })();

    /*
     * Public API Surface of angular-editor
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AngularEditorComponent = AngularEditorComponent;
    exports.AngularEditorModule = AngularEditorModule;
    exports.AngularEditorService = AngularEditorService;
    exports.AngularEditorToolbarComponent = AngularEditorToolbarComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=kolkov-angular-editor.umd.js.map
