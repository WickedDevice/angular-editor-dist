/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
/**
 * @record
 */
export function SelectOption() { }
if (false) {
    /** @type {?} */
    SelectOption.prototype.label;
    /** @type {?} */
    SelectOption.prototype.value;
}
var AeSelectComponent = /** @class */ (function () {
    function AeSelectComponent(elRef, r) {
        this.elRef = elRef;
        this.r = r;
        this.options = [];
        this.disabled = false;
        this.optionId = 0;
        this.opened = false;
        /*@HostBinding('class') get getClass() {
            return 'ae-select';
          }*/
        // tslint:disable-next-line:no-output-native no-output-rename
        this.changeEvent = new EventEmitter();
        this.onChange = (/**
         * @return {?}
         */
        function () { });
        this.onTouched = (/**
         * @return {?}
         */
        function () { });
    }
    Object.defineProperty(AeSelectComponent.prototype, "label", {
        get: /**
         * @return {?}
         */
        function () {
            return this.selectedOption && this.selectedOption.hasOwnProperty('label') ? this.selectedOption.label : 'Select';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AeSelectComponent.prototype, "value", {
        get: /**
         * @return {?}
         */
        function () {
            return this.selectedOption.value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    AeSelectComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this.selectedOption = this.options[0];
    };
    /**
     * @param {?} option
     * @param {?} event
     * @return {?}
     */
    AeSelectComponent.prototype.optionSelect = /**
     * @param {?} option
     * @param {?} event
     * @return {?}
     */
    function (option, event) {
        event.stopPropagation();
        this.setValue(option.value);
        this.onChange(this.selectedOption.value);
        this.changeEvent.emit(this.selectedOption.value);
        this.onTouched();
        this.opened = false;
    };
    /**
     * @param {?} event
     * @return {?}
     */
    AeSelectComponent.prototype.toggleOpen = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        // event.stopPropagation();
        if (this.disabled) {
            return;
        }
        this.opened = !this.opened;
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype.onClick = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        if (!this.elRef.nativeElement.contains($event.target)) {
            this.close();
        }
    };
    /**
     * @return {?}
     */
    AeSelectComponent.prototype.close = /**
     * @return {?}
     */
    function () {
        this.opened = false;
    };
    Object.defineProperty(AeSelectComponent.prototype, "isOpen", {
        get: /**
         * @return {?}
         */
        function () {
            return this.opened;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} value
     * @return {?}
     */
    AeSelectComponent.prototype.writeValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        if (!value || typeof value !== 'string') {
            return;
        }
        this.setValue(value);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    AeSelectComponent.prototype.setValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var index = 0;
        /** @type {?} */
        var selectedEl = this.options.find((/**
         * @param {?} el
         * @param {?} i
         * @return {?}
         */
        function (el, i) {
            index = i;
            return el.value === value;
        }));
        if (selectedEl) {
            this.selectedOption = selectedEl;
            this.optionId = index;
        }
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    AeSelectComponent.prototype.registerOnChange = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.onChange = fn;
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    AeSelectComponent.prototype.registerOnTouched = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.onTouched = fn;
    };
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    AeSelectComponent.prototype.setDisabledState = /**
     * @param {?} isDisabled
     * @return {?}
     */
    function (isDisabled) {
        this.labelButton.nativeElement.disabled = isDisabled;
        /** @type {?} */
        var div = this.labelButton.nativeElement;
        /** @type {?} */
        var action = isDisabled ? 'addClass' : 'removeClass';
        this.r[action](div, 'disabled');
        this.disabled = isDisabled;
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype.handleKeyDown = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
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
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype._handleArrowDown = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        if (this.optionId < this.options.length - 1) {
            this.optionId++;
        }
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype._handleArrowUp = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        if (this.optionId >= 1) {
            this.optionId--;
        }
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype._handleSpace = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype._handleEnter = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        this.optionSelect(this.options[this.optionId], $event);
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    AeSelectComponent.prototype._handleTab = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
    };
    /**
     * @return {?}
     */
    AeSelectComponent.prototype._handleBackspace = /**
     * @return {?}
     */
    function () {
    };
    AeSelectComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ae-select',
                    template: "<span class=\"ae-font ae-picker\" [ngClass]=\"{'ae-expanded':isOpen}\">\n  <button [tabIndex]=\"-1\" #labelButton tabindex=\"0\" type=\"button\" role=\"button\" class=\"ae-picker-label\" (click)=\"toggleOpen($event);\">{{label}}\n    <svg viewBox=\"0 0 18 18\">\n     <!-- <use x=\"0\" y=\"0\" xlink:href=\"../assets/icons.svg#hom\"></use>-->\n      <polygon class=\"ae-stroke\" points=\"7 11 9 13 11 11 7 11\"></polygon>\n      <polygon class=\"ae-stroke\" points=\"7 7 9 5 11 7 7 7\"></polygon>\n    </svg>\n  </button>\n  <span class=\"ae-picker-options\">\n    <button tabindex=\"-1\" type=\"button\" role=\"button\" class=\"ae-picker-item\"\n          *ngFor=\"let item of options; let i = index\"\n          [ngClass]=\"{'selected': item.value === value, 'focused': i === optionId}\"\n          (click)=\"optionSelect(item, $event)\">\n          {{item.label}}\n    </button>\n    <span class=\"dropdown-item\" *ngIf=\"!options.length\">No items for select</span>\n  </span>\n</span>\n",
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef((/**
                             * @return {?}
                             */
                            function () { return AeSelectComponent; })),
                            multi: true,
                        }
                    ],
                    styles: ["@charset \"UTF-8\";.ae-font.ae-picker{color:#444;display:inline-block;float:left;width:100%;position:relative;vertical-align:middle}.ae-font .ae-picker-label{cursor:pointer;display:inline-block;height:100%;padding-left:8px;padding-right:10px;position:relative;width:100%;line-height:24px;vertical-align:middle;font-size:85%;text-align:left;background-color:transparent;min-width:2rem;float:left;border:1px solid transparent;text-overflow:clip;overflow:hidden;white-space:nowrap}.ae-font .ae-picker-label:before{content:\"\";position:absolute;right:0;top:0;width:20px;height:100%;background:linear-gradient(to right,#fff,#fff 100%)}.ae-font .ae-picker-label:focus{outline:0}.ae-font .ae-picker-label:hover{cursor:pointer;background-color:#f1f1f1;transition:.2s}.ae-font .ae-picker-label:hover:before{background:linear-gradient(to right,#f5f5f5 100%,#fff 100%)}.ae-font .ae-picker-label:disabled{background-color:#f5f5f5;pointer-events:none;cursor:not-allowed}.ae-font .ae-picker-label:disabled:before{background:linear-gradient(to right,#f5f5f5 100%,#fff 100%)}.ae-font .ae-picker-label svg{position:absolute;margin-top:-9px;right:0;top:50%;width:18px}.ae-font .ae-picker-label svg:not(:root){overflow:hidden}.ae-font .ae-picker-label svg .ae-stroke{fill:none;stroke:#444;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}.ae-font .ae-picker-options{background-color:#fff;display:none;min-width:100%;position:absolute;white-space:nowrap;z-index:3;border:1px solid transparent;box-shadow:rgba(0,0,0,.2) 0 2px 8px}.ae-font .ae-picker-options .ae-picker-item{cursor:pointer;display:block;padding-bottom:5px;padding-top:5px;padding-left:5px;z-index:3;text-align:left;background-color:transparent;min-width:2rem;width:100%;border:0 solid #ddd}.ae-font .ae-picker-options .ae-picker-item.selected{color:#06c;background-color:#fff4c2}.ae-font .ae-picker-options .ae-picker-item.focused,.ae-font .ae-picker-options .ae-picker-item:hover{background-color:#fffa98}.ae-font.ae-expanded{display:block;margin-top:-1px;z-index:1}.ae-font.ae-expanded .ae-picker-label,.ae-font.ae-expanded .ae-picker-label svg{color:#ccc;z-index:2}.ae-font.ae-expanded .ae-picker-label svg .ae-stroke{stroke:#ccc}.ae-font.ae-expanded .ae-picker-options{display:block;margin-top:-1px;top:100%;z-index:3;border-color:#ccc}"]
                }] }
    ];
    /** @nocollapse */
    AeSelectComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: Renderer2 }
    ]; };
    AeSelectComponent.propDecorators = {
        options: [{ type: Input }],
        changeEvent: [{ type: Output, args: ['change',] }],
        labelButton: [{ type: ViewChild, args: ['labelButton', { static: true },] }],
        onClick: [{ type: HostListener, args: ['document:click', ['$event'],] }],
        handleKeyDown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
    };
    return AeSelectComponent;
}());
export { AeSelectComponent };
if (false) {
    /** @type {?} */
    AeSelectComponent.prototype.options;
    /** @type {?} */
    AeSelectComponent.prototype.selectedOption;
    /** @type {?} */
    AeSelectComponent.prototype.disabled;
    /** @type {?} */
    AeSelectComponent.prototype.optionId;
    /** @type {?} */
    AeSelectComponent.prototype.opened;
    /** @type {?} */
    AeSelectComponent.prototype.changeEvent;
    /** @type {?} */
    AeSelectComponent.prototype.labelButton;
    /** @type {?} */
    AeSelectComponent.prototype.onChange;
    /** @type {?} */
    AeSelectComponent.prototype.onTouched;
    /**
     * @type {?}
     * @private
     */
    AeSelectComponent.prototype.elRef;
    /**
     * @type {?}
     * @private
     */
    AeSelectComponent.prototype.r;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWUtc2VsZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Brb2xrb3YvYW5ndWxhci1lZGl0b3IvIiwic291cmNlcyI6WyJsaWIvYWUtc2VsZWN0L2FlLXNlbGVjdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxFQUFFLFNBQVMsRUFDcEIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7OztBQUV2RSxrQ0FHQzs7O0lBRkMsNkJBQWM7O0lBQ2QsNkJBQWM7O0FBR2hCO0lBdUNFLDJCQUFvQixLQUFpQixFQUFVLENBQVk7UUFBdkMsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLE1BQUMsR0FBRCxDQUFDLENBQVc7UUF6QmxELFlBQU8sR0FBbUIsRUFBRSxDQUFDO1FBR3RDLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsYUFBUSxHQUFHLENBQUMsQ0FBQztRQU1iLFdBQU0sR0FBRyxLQUFLLENBQUM7Ozs7O1FBV0csZ0JBQVcsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBOERuRCxhQUFROzs7UUFBUSxjQUFRLENBQUMsRUFBQztRQUMxQixjQUFTOzs7UUFBUSxjQUFRLENBQUMsRUFBQztJQTNEb0MsQ0FBQztJQW5CaEUsc0JBQUksb0NBQUs7Ozs7UUFBVDtZQUNFLE9BQU8sSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUNuSCxDQUFDOzs7T0FBQTtJQUlELHNCQUFJLG9DQUFLOzs7O1FB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RXRDLDJDQUE2Qjs7SUFDN0IscUNBQWlCOztJQUNqQixxQ0FBYTs7SUFNYixtQ0FBZTs7SUFXZix3Q0FBbUQ7O0lBRW5ELHdDQUFrRTs7SUE0RGxFLHFDQUEwQjs7SUFDMUIsc0NBQTJCOzs7OztJQTNEZixrQ0FBeUI7Ozs7O0lBQUUsOEJBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSW5wdXQsXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBSZW5kZXJlcjIsIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdE9wdGlvbiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2FlLXNlbGVjdCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9hZS1zZWxlY3QuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9hZS1zZWxlY3QuY29tcG9uZW50LnNjc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBBZVNlbGVjdENvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQWVTZWxlY3RDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgQElucHV0KCkgb3B0aW9uczogU2VsZWN0T3B0aW9uW10gPSBbXTtcblxuICBzZWxlY3RlZE9wdGlvbjogU2VsZWN0T3B0aW9uO1xuICBkaXNhYmxlZCA9IGZhbHNlO1xuICBvcHRpb25JZCA9IDA7XG5cbiAgZ2V0IGxhYmVsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRPcHRpb24gJiYgdGhpcy5zZWxlY3RlZE9wdGlvbi5oYXNPd25Qcm9wZXJ0eSgnbGFiZWwnKSA/IHRoaXMuc2VsZWN0ZWRPcHRpb24ubGFiZWwgOiAnU2VsZWN0JztcbiAgfVxuXG4gIG9wZW5lZCA9IGZhbHNlO1xuXG4gIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGVkT3B0aW9uLnZhbHVlO1xuICB9XG5cbiAgLypASG9zdEJpbmRpbmcoJ2NsYXNzJykgZ2V0IGdldENsYXNzKCkge1xuICAgIHJldHVybiAnYWUtc2VsZWN0JztcbiAgfSovXG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLW91dHB1dC1uYXRpdmUgbm8tb3V0cHV0LXJlbmFtZVxuICBAT3V0cHV0KCdjaGFuZ2UnKSBjaGFuZ2VFdmVudCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBAVmlld0NoaWxkKCdsYWJlbEJ1dHRvbicsIHtzdGF0aWM6IHRydWV9KSBsYWJlbEJ1dHRvbjogRWxlbWVudFJlZjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIHI6IFJlbmRlcmVyMikgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5zZWxlY3RlZE9wdGlvbiA9IHRoaXMub3B0aW9uc1swXTtcbiAgfVxuXG4gIG9wdGlvblNlbGVjdChvcHRpb246IFNlbGVjdE9wdGlvbiwgZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnNldFZhbHVlKG9wdGlvbi52YWx1ZSk7XG4gICAgdGhpcy5vbkNoYW5nZSh0aGlzLnNlbGVjdGVkT3B0aW9uLnZhbHVlKTtcbiAgICB0aGlzLmNoYW5nZUV2ZW50LmVtaXQodGhpcy5zZWxlY3RlZE9wdGlvbi52YWx1ZSk7XG4gICAgdGhpcy5vblRvdWNoZWQoKTtcbiAgICB0aGlzLm9wZW5lZCA9IGZhbHNlO1xuICB9XG5cbiAgdG9nZ2xlT3BlbihldmVudDogTW91c2VFdmVudCkge1xuICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub3BlbmVkID0gIXRoaXMub3BlbmVkO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCddKVxuICAgIG9uQ2xpY2soJGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuZWxSZWYubmF0aXZlRWxlbWVudC5jb250YWlucygkZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9XG4gIH1cblxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMub3BlbmVkID0gZmFsc2U7XG4gIH1cblxuICBnZXQgaXNPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wZW5lZDtcbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgIGxldCBpbmRleCA9IDA7XG4gICAgY29uc3Qgc2VsZWN0ZWRFbCA9IHRoaXMub3B0aW9ucy5maW5kKChlbCwgaSkgPT4ge1xuICAgICAgaW5kZXggPSBpO1xuICAgICAgcmV0dXJuIGVsLnZhbHVlID09PSB2YWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoc2VsZWN0ZWRFbCkge1xuICAgICAgdGhpcy5zZWxlY3RlZE9wdGlvbiA9IHNlbGVjdGVkRWw7XG4gICAgICB0aGlzLm9wdGlvbklkID0gaW5kZXg7XG4gICAgfVxuICB9XG5cbiAgb25DaGFuZ2U6IGFueSA9ICgpID0+IHsgfTtcbiAgb25Ub3VjaGVkOiBhbnkgPSAoKSA9PiB7IH07XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbikge1xuICAgIHRoaXMub25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuKSB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMubGFiZWxCdXR0b24ubmF0aXZlRWxlbWVudC5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gICAgY29uc3QgZGl2ID0gdGhpcy5sYWJlbEJ1dHRvbi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGFjdGlvbiA9IGlzRGlzYWJsZWQgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJztcbiAgICB0aGlzLnJbYWN0aW9uXShkaXYsICdkaXNhYmxlZCcpO1xuICAgIHRoaXMuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIGhhbmRsZUtleURvd24oJGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLm9wZW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZygkZXZlbnQua2V5KTtcbiAgICAvLyBpZiAoS2V5Q29kZVskZXZlbnQua2V5XSkge1xuICAgIHN3aXRjaCAoJGV2ZW50LmtleSkge1xuICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgIHRoaXMuX2hhbmRsZUFycm93RG93bigkZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICB0aGlzLl9oYW5kbGVBcnJvd1VwKCRldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1NwYWNlJzpcbiAgICAgICAgICB0aGlzLl9oYW5kbGVTcGFjZSgkZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgICAgdGhpcy5faGFuZGxlRW50ZXIoJGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnVGFiJzpcbiAgICAgICAgICB0aGlzLl9oYW5kbGVUYWIoJGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0JhY2tzcGFjZSc6XG4gICAgICAgICAgdGhpcy5faGFuZGxlQmFja3NwYWNlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgLy8gfSBlbHNlIGlmICgkZXZlbnQua2V5ICYmICRldmVudC5rZXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyB0aGlzLl9rZXlQcmVzcyQubmV4dCgkZXZlbnQua2V5LnRvTG9jYWxlTG93ZXJDYXNlKCkpO1xuICAgLy8gfVxuICB9XG5cbiAgX2hhbmRsZUFycm93RG93bigkZXZlbnQpIHtcbiAgICBpZiAodGhpcy5vcHRpb25JZCA8IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICB0aGlzLm9wdGlvbklkKys7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUFycm93VXAoJGV2ZW50KSB7XG4gICAgaWYgKHRoaXMub3B0aW9uSWQgPj0gMSkge1xuICAgICAgdGhpcy5vcHRpb25JZC0tO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVTcGFjZSgkZXZlbnQpIHtcblxuICB9XG5cbiAgX2hhbmRsZUVudGVyKCRldmVudCkge1xuICAgIHRoaXMub3B0aW9uU2VsZWN0KHRoaXMub3B0aW9uc1t0aGlzLm9wdGlvbklkXSwgJGV2ZW50KTtcbiAgfVxuXG4gIF9oYW5kbGVUYWIoJGV2ZW50KSB7XG5cbiAgfVxuXG4gIF9oYW5kbGVCYWNrc3BhY2UoKSB7XG5cbiAgfVxufVxuIl19