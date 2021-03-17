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
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AngularEditorModule, { declarations: [AngularEditorComponent,
        AngularEditorToolbarComponent,
        AeSelectComponent], imports: [CommonModule, FormsModule, ReactiveFormsModule], exports: [AngularEditorComponent,
        AngularEditorToolbarComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AngularEditorModule, [{
        type: NgModule,
        args: [{
                imports: [
                    CommonModule, FormsModule, ReactiveFormsModule
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
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3IubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Ii9ob21lL2pvZW5vbGFuL2Rldi9hbmd1bGFyLWVkaXRvci9wcm9qZWN0cy9hbmd1bGFyLWVkaXRvci9zcmMvIiwic291cmNlcyI6WyJsaWIvYW5ndWxhci1lZGl0b3IubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDbEUsT0FBTyxFQUFDLDZCQUE2QixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDakYsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7QUFzQnBFLE1BQU0sT0FBTyxtQkFBbUI7O3VEQUFuQixtQkFBbUI7cUhBQW5CLG1CQUFtQixrQkFqQnJCO1lBQ1AsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUI7U0FDL0M7d0ZBZVUsbUJBQW1CLG1CQWI1QixzQkFBc0I7UUFDdEIsNkJBQTZCO1FBQzdCLGlCQUFpQixhQUxqQixZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixhQVk5QyxzQkFBc0I7UUFDdEIsNkJBQTZCO2tEQUdwQixtQkFBbUI7Y0FsQi9CLFFBQVE7ZUFBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUI7aUJBQy9DO2dCQUNELFlBQVksRUFBRTtvQkFDWixzQkFBc0I7b0JBQ3RCLDZCQUE2QjtvQkFDN0IsaUJBQWlCO2lCQUNsQjtnQkFDRCxlQUFlO2dCQUNmLDBCQUEwQjtnQkFDMUIsdUJBQXVCO2dCQUN2QixLQUFLO2dCQUNMLE9BQU8sRUFBRTtvQkFDUCxzQkFBc0I7b0JBQ3RCLDZCQUE2QjtpQkFDOUI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBbmd1bGFyRWRpdG9yQ29tcG9uZW50fSBmcm9tICcuL2FuZ3VsYXItZWRpdG9yLmNvbXBvbmVudCc7XG5pbXBvcnQge0FuZ3VsYXJFZGl0b3JUb29sYmFyQ29tcG9uZW50fSBmcm9tICcuL2FuZ3VsYXItZWRpdG9yLXRvb2xiYXIuY29tcG9uZW50JztcbmltcG9ydCB7Rm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQWVTZWxlY3RDb21wb25lbnQgfSBmcm9tICcuL2FlLXNlbGVjdC9hZS1zZWxlY3QuY29tcG9uZW50JztcbmltcG9ydCB7IEFuZ3VsYXJFZGl0b3JTZXJ2aWNlIH0gZnJvbSAnLi9hbmd1bGFyLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7IEltYWdlUmVzaXplU2VydmljZSB9IGZyb20gJy4vaW1hZ2UtcmVzaXplLnNlcnZpY2UnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBBbmd1bGFyRWRpdG9yQ29tcG9uZW50LFxuICAgIEFuZ3VsYXJFZGl0b3JUb29sYmFyQ29tcG9uZW50LFxuICAgIEFlU2VsZWN0Q29tcG9uZW50XG4gIF0sXG4gIC8vIHByb3ZpZGVyczogW1xuICAvLyAgIEFuZ3VsYXJFZGl0b3JTZXJ2aWNlLFxuICAvLyAgIEltYWdlUmVzaXplU2VydmljZVxuICAvLyBdLFxuICBleHBvcnRzOiBbXG4gICAgQW5ndWxhckVkaXRvckNvbXBvbmVudCxcbiAgICBBbmd1bGFyRWRpdG9yVG9vbGJhckNvbXBvbmVudFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJFZGl0b3JNb2R1bGUge1xufVxuIl19