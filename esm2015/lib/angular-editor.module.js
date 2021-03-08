import { NgModule } from '@angular/core';
import { AngularEditorComponent } from './angular-editor.component';
import { AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AeSelectComponent } from './ae-select/ae-select.component';
import * as i0 from "@angular/core";
export class AngularEditorModule {
}
AngularEditorModule.ɵmod = i0.ɵɵdefineNgModule({ type: AngularEditorModule });
AngularEditorModule.ɵinj = i0.ɵɵdefineInjector({ factory: function AngularEditorModule_Factory(t) { return new (t || AngularEditorModule)(); }, imports: [[
            CommonModule, FormsModule, ReactiveFormsModule
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AngularEditorModule, { declarations: [AngularEditorComponent, AngularEditorToolbarComponent, AeSelectComponent], imports: [CommonModule, FormsModule, ReactiveFormsModule], exports: [AngularEditorComponent, AngularEditorToolbarComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AngularEditorModule, [{
        type: NgModule,
        args: [{
                imports: [
                    CommonModule, FormsModule, ReactiveFormsModule
                ],
                declarations: [AngularEditorComponent, AngularEditorToolbarComponent, AeSelectComponent],
                exports: [AngularEditorComponent, AngularEditorToolbarComponent]
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3IubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Ii9ob21lL3ZpYy9kZXYvYW5ndWxhci1lZGl0b3IvcHJvamVjdHMvYW5ndWxhci1lZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXItZWRpdG9yLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ2xFLE9BQU8sRUFBQyw2QkFBNkIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQ2pGLE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7O0FBU3BFLE1BQU0sT0FBTyxtQkFBbUI7O3VEQUFuQixtQkFBbUI7cUhBQW5CLG1CQUFtQixrQkFOckI7WUFDUCxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQjtTQUMvQzt3RkFJVSxtQkFBbUIsbUJBSGYsc0JBQXNCLEVBQUUsNkJBQTZCLEVBQUUsaUJBQWlCLGFBRnJGLFlBQVksRUFBRSxXQUFXLEVBQUUsbUJBQW1CLGFBR3RDLHNCQUFzQixFQUFFLDZCQUE2QjtrREFFcEQsbUJBQW1CO2NBUC9CLFFBQVE7ZUFBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUI7aUJBQy9DO2dCQUNELFlBQVksRUFBRSxDQUFDLHNCQUFzQixFQUFFLDZCQUE2QixFQUFFLGlCQUFpQixDQUFDO2dCQUN4RixPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSw2QkFBNkIsQ0FBQzthQUNqRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBbmd1bGFyRWRpdG9yQ29tcG9uZW50fSBmcm9tICcuL2FuZ3VsYXItZWRpdG9yLmNvbXBvbmVudCc7XG5pbXBvcnQge0FuZ3VsYXJFZGl0b3JUb29sYmFyQ29tcG9uZW50fSBmcm9tICcuL2FuZ3VsYXItZWRpdG9yLXRvb2xiYXIuY29tcG9uZW50JztcbmltcG9ydCB7Rm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQWVTZWxlY3RDb21wb25lbnQgfSBmcm9tICcuL2FlLXNlbGVjdC9hZS1zZWxlY3QuY29tcG9uZW50JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSwgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbQW5ndWxhckVkaXRvckNvbXBvbmVudCwgQW5ndWxhckVkaXRvclRvb2xiYXJDb21wb25lbnQsIEFlU2VsZWN0Q29tcG9uZW50XSxcbiAgZXhwb3J0czogW0FuZ3VsYXJFZGl0b3JDb21wb25lbnQsIEFuZ3VsYXJFZGl0b3JUb29sYmFyQ29tcG9uZW50XVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRWRpdG9yTW9kdWxlIHtcbn1cbiJdfQ==