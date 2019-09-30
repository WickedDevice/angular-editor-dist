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
export class AeSelectComponent {
    /**
     * @param {?} elRef
     * @param {?} r
     */
    constructor(elRef, r) {
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
        () => { });
        this.onTouched = (/**
         * @return {?}
         */
        () => { });
    }
    /**
     * @return {?}
     */
    get label() {
        return this.selectedOption && this.selectedOption.hasOwnProperty('label') ? this.selectedOption.label : 'Select';
    }
    /**
     * @return {?}
     */
    get value() {
        return this.selectedOption.value;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.selectedOption = this.options[0];
    }
    /**
     * @param {?} option
     * @param {?} event
     * @return {?}
     */
    optionSelect(option, event) {
        event.stopPropagation();
        this.setValue(option.value);
        this.onChange(this.selectedOption.value);
        this.changeEvent.emit(this.selectedOption.value);
        this.onTouched();
        this.opened = false;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    toggleOpen(event) {
        // event.stopPropagation();
        if (this.disabled) {
            return;
        }
        this.opened = !this.opened;
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    onClick($event) {
        if (!this.elRef.nativeElement.contains($event.target)) {
            this.close();
        }
    }
    /**
     * @return {?}
     */
    close() {
        this.opened = false;
    }
    /**
     * @return {?}
     */
    get isOpen() {
        return this.opened;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        if (!value || typeof value !== 'string') {
            return;
        }
        this.setValue(value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setValue(value) {
        /** @type {?} */
        let index = 0;
        /** @type {?} */
        const selectedEl = this.options.find((/**
         * @param {?} el
         * @param {?} i
         * @return {?}
         */
        (el, i) => {
            index = i;
            return el.value === value;
        }));
        if (selectedEl) {
            this.selectedOption = selectedEl;
            this.optionId = index;
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this.onChange = fn;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    setDisabledState(isDisabled) {
        this.labelButton.nativeElement.disabled = isDisabled;
        /** @type {?} */
        const div = this.labelButton.nativeElement;
        /** @type {?} */
        const action = isDisabled ? 'addClass' : 'removeClass';
        this.r[action](div, 'disabled');
        this.disabled = isDisabled;
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    handleKeyDown($event) {
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
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    _handleArrowDown($event) {
        if (this.optionId < this.options.length - 1) {
            this.optionId++;
        }
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    _handleArrowUp($event) {
        if (this.optionId >= 1) {
            this.optionId--;
        }
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    _handleSpace($event) {
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    _handleEnter($event) {
        this.optionSelect(this.options[this.optionId], $event);
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    _handleTab($event) {
    }
    /**
     * @return {?}
     */
    _handleBackspace() {
    }
}
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
                        () => AeSelectComponent)),
                        multi: true,
                    }
                ],
                styles: ["@charset \"UTF-8\";.ae-font.ae-picker{color:#444;display:inline-block;float:left;width:100%;position:relative;vertical-align:middle}.ae-font .ae-picker-label{cursor:pointer;display:inline-block;height:100%;padding-left:8px;padding-right:10px;position:relative;width:100%;line-height:24px;vertical-align:middle;font-size:85%;text-align:left;background-color:transparent;min-width:2rem;float:left;border:1px solid transparent;text-overflow:clip;overflow:hidden;white-space:nowrap}.ae-font .ae-picker-label:before{content:\"\";position:absolute;right:0;top:0;width:20px;height:100%;background:linear-gradient(to right,#fff,#fff 100%)}.ae-font .ae-picker-label:focus{outline:0}.ae-font .ae-picker-label:hover{cursor:pointer;background-color:#f1f1f1;transition:.2s}.ae-font .ae-picker-label:hover:before{background:linear-gradient(to right,#f5f5f5 100%,#fff 100%)}.ae-font .ae-picker-label:disabled{background-color:#f5f5f5;pointer-events:none;cursor:not-allowed}.ae-font .ae-picker-label:disabled:before{background:linear-gradient(to right,#f5f5f5 100%,#fff 100%)}.ae-font .ae-picker-label svg{position:absolute;margin-top:-9px;right:0;top:50%;width:18px}.ae-font .ae-picker-label svg:not(:root){overflow:hidden}.ae-font .ae-picker-label svg .ae-stroke{fill:none;stroke:#444;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}.ae-font .ae-picker-options{background-color:#fff;display:none;min-width:100%;position:absolute;white-space:nowrap;z-index:3;border:1px solid transparent;box-shadow:rgba(0,0,0,.2) 0 2px 8px}.ae-font .ae-picker-options .ae-picker-item{cursor:pointer;display:block;padding-bottom:5px;padding-top:5px;padding-left:5px;z-index:3;text-align:left;background-color:transparent;min-width:2rem;width:100%;border:0 solid #ddd}.ae-font .ae-picker-options .ae-picker-item.selected{color:#06c;background-color:#fff4c2}.ae-font .ae-picker-options .ae-picker-item.focused,.ae-font .ae-picker-options .ae-picker-item:hover{background-color:#fffa98}.ae-font.ae-expanded{display:block;margin-top:-1px;z-index:1}.ae-font.ae-expanded .ae-picker-label,.ae-font.ae-expanded .ae-picker-label svg{color:#ccc;z-index:2}.ae-font.ae-expanded .ae-picker-label svg .ae-stroke{stroke:#ccc}.ae-font.ae-expanded .ae-picker-options{display:block;margin-top:-1px;top:100%;z-index:3;border-color:#ccc}"]
            }] }
];
/** @nocollapse */
AeSelectComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 }
];
AeSelectComponent.propDecorators = {
    options: [{ type: Input }],
    changeEvent: [{ type: Output, args: ['change',] }],
    labelButton: [{ type: ViewChild, args: ['labelButton', { static: true },] }],
    onClick: [{ type: HostListener, args: ['document:click', ['$event'],] }],
    handleKeyDown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWUtc2VsZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Brb2xrb3YvYW5ndWxhci1lZGl0b3IvIiwic291cmNlcyI6WyJsaWIvYWUtc2VsZWN0L2FlLXNlbGVjdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxFQUFFLFNBQVMsRUFDcEIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7OztBQUV2RSxrQ0FHQzs7O0lBRkMsNkJBQWM7O0lBQ2QsNkJBQWM7O0FBZ0JoQixNQUFNLE9BQU8saUJBQWlCOzs7OztJQTBCNUIsWUFBb0IsS0FBaUIsRUFBVSxDQUFZO1FBQXZDLFVBQUssR0FBTCxLQUFLLENBQVk7UUFBVSxNQUFDLEdBQUQsQ0FBQyxDQUFXO1FBekJsRCxZQUFPLEdBQW1CLEVBQUUsQ0FBQztRQUd0QyxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFNYixXQUFNLEdBQUcsS0FBSyxDQUFDOzs7OztRQVdHLGdCQUFXLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQThEbkQsYUFBUTs7O1FBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFDO1FBQzFCLGNBQVM7OztRQUFRLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBQztJQTNEb0MsQ0FBQzs7OztJQW5CaEUsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ25I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XG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSG9zdExpc3RlbmVyLFxuICBJbnB1dCxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFJlbmRlcmVyMiwgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0T3B0aW9uIHtcbiAgbGFiZWw6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYWUtc2VsZWN0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL2FlLXNlbGVjdC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2FlLXNlbGVjdC5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEFlU2VsZWN0Q29tcG9uZW50KSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH1cbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBBZVNlbGVjdENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICBASW5wdXQoKSBvcHRpb25zOiBTZWxlY3RPcHRpb25bXSA9IFtdO1xuXG4gIHNlbGVjdGVkT3B0aW9uOiBTZWxlY3RPcHRpb247XG4gIGRpc2FibGVkID0gZmFsc2U7XG4gIG9wdGlvbklkID0gMDtcblxuICBnZXQgbGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZE9wdGlvbiAmJiB0aGlzLnNlbGVjdGVkT3B0aW9uLmhhc093blByb3BlcnR5KCdsYWJlbCcpID8gdGhpcy5zZWxlY3RlZE9wdGlvbi5sYWJlbCA6ICdTZWxlY3QnO1xuICB9XG5cbiAgb3BlbmVkID0gZmFsc2U7XG5cbiAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRPcHRpb24udmFsdWU7XG4gIH1cblxuICAvKkBIb3N0QmluZGluZygnY2xhc3MnKSBnZXQgZ2V0Q2xhc3MoKSB7XG4gICAgcmV0dXJuICdhZS1zZWxlY3QnO1xuICB9Ki9cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tb3V0cHV0LW5hdGl2ZSBuby1vdXRwdXQtcmVuYW1lXG4gIEBPdXRwdXQoJ2NoYW5nZScpIGNoYW5nZUV2ZW50ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIEBWaWV3Q2hpbGQoJ2xhYmVsQnV0dG9uJywge3N0YXRpYzogdHJ1ZX0pIGxhYmVsQnV0dG9uOiBFbGVtZW50UmVmO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgcjogUmVuZGVyZXIyKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnNlbGVjdGVkT3B0aW9uID0gdGhpcy5vcHRpb25zWzBdO1xuICB9XG5cbiAgb3B0aW9uU2VsZWN0KG9wdGlvbjogU2VsZWN0T3B0aW9uLCBldmVudDogTW91c2VFdmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHRoaXMuc2V0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgICB0aGlzLm9uQ2hhbmdlKHRoaXMuc2VsZWN0ZWRPcHRpb24udmFsdWUpO1xuICAgIHRoaXMuY2hhbmdlRXZlbnQuZW1pdCh0aGlzLnNlbGVjdGVkT3B0aW9uLnZhbHVlKTtcbiAgICB0aGlzLm9uVG91Y2hlZCgpO1xuICAgIHRoaXMub3BlbmVkID0gZmFsc2U7XG4gIH1cblxuICB0b2dnbGVPcGVuKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5vcGVuZWQgPSAhdGhpcy5vcGVuZWQ7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDpjbGljaycsIFsnJGV2ZW50J10pXG4gICAgb25DbGljaygkZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKCRldmVudC50YXJnZXQpKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIH1cbiAgfVxuXG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5vcGVuZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGdldCBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3BlbmVkO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBjb25zdCBzZWxlY3RlZEVsID0gdGhpcy5vcHRpb25zLmZpbmQoKGVsLCBpKSA9PiB7XG4gICAgICBpbmRleCA9IGk7XG4gICAgICByZXR1cm4gZWwudmFsdWUgPT09IHZhbHVlO1xuICAgIH0pO1xuICAgIGlmIChzZWxlY3RlZEVsKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkT3B0aW9uID0gc2VsZWN0ZWRFbDtcbiAgICAgIHRoaXMub3B0aW9uSWQgPSBpbmRleDtcbiAgICB9XG4gIH1cblxuICBvbkNoYW5nZTogYW55ID0gKCkgPT4geyB9O1xuICBvblRvdWNoZWQ6IGFueSA9ICgpID0+IHsgfTtcblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuKSB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm4pIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5sYWJlbEJ1dHRvbi5uYXRpdmVFbGVtZW50LmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgICBjb25zdCBkaXYgPSB0aGlzLmxhYmVsQnV0dG9uLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgYWN0aW9uID0gaXNEaXNhYmxlZCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnO1xuICAgIHRoaXMuclthY3Rpb25dKGRpdiwgJ2Rpc2FibGVkJyk7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgaGFuZGxlS2V5RG93bigkZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMub3BlbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKCRldmVudC5rZXkpO1xuICAgIC8vIGlmIChLZXlDb2RlWyRldmVudC5rZXldKSB7XG4gICAgc3dpdGNoICgkZXZlbnQua2V5KSB7XG4gICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgdGhpcy5faGFuZGxlQXJyb3dEb3duKCRldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgIHRoaXMuX2hhbmRsZUFycm93VXAoJGV2ZW50KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnU3BhY2UnOlxuICAgICAgICAgIHRoaXMuX2hhbmRsZVNwYWNlKCRldmVudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgICB0aGlzLl9oYW5kbGVFbnRlcigkZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdUYWInOlxuICAgICAgICAgIHRoaXMuX2hhbmRsZVRhYigkZXZlbnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQmFja3NwYWNlJzpcbiAgICAgICAgICB0aGlzLl9oYW5kbGVCYWNrc3BhY2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAvLyB9IGVsc2UgaWYgKCRldmVudC5rZXkgJiYgJGV2ZW50LmtleS5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIHRoaXMuX2tleVByZXNzJC5uZXh0KCRldmVudC5rZXkudG9Mb2NhbGVMb3dlckNhc2UoKSk7XG4gICAvLyB9XG4gIH1cblxuICBfaGFuZGxlQXJyb3dEb3duKCRldmVudCkge1xuICAgIGlmICh0aGlzLm9wdGlvbklkIDwgdGhpcy5vcHRpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMub3B0aW9uSWQrKztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQXJyb3dVcCgkZXZlbnQpIHtcbiAgICBpZiAodGhpcy5vcHRpb25JZCA+PSAxKSB7XG4gICAgICB0aGlzLm9wdGlvbklkLS07XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVNwYWNlKCRldmVudCkge1xuXG4gIH1cblxuICBfaGFuZGxlRW50ZXIoJGV2ZW50KSB7XG4gICAgdGhpcy5vcHRpb25TZWxlY3QodGhpcy5vcHRpb25zW3RoaXMub3B0aW9uSWRdLCAkZXZlbnQpO1xuICB9XG5cbiAgX2hhbmRsZVRhYigkZXZlbnQpIHtcblxuICB9XG5cbiAgX2hhbmRsZUJhY2tzcGFjZSgpIHtcblxuICB9XG59XG4iXX0=