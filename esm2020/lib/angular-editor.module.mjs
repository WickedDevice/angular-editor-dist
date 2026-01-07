import { NgModule } from '@angular/core';
import { AngularEditorComponent } from './angular-editor.component';
import { AEButtonIsHiddenPipe, AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AeSelectComponent } from './ae-select/ae-select.component';
import { AeButtonComponent } from "./ae-button/ae-button.component";
import { AeToolbarSetComponent } from './ae-toolbar-set/ae-toolbar-set.component';
import * as i0 from "@angular/core";
export class AngularEditorModule {
}
AngularEditorModule.ɵfac = function AngularEditorModule_Factory(t) { return new (t || AngularEditorModule)(); };
AngularEditorModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AngularEditorModule });
AngularEditorModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [CommonModule, FormsModule, ReactiveFormsModule] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AngularEditorModule, [{
        type: NgModule,
        args: [{
                imports: [
                    CommonModule, FormsModule, ReactiveFormsModule
                ],
                declarations: [
                    AeButtonComponent,
                    AeToolbarSetComponent,
                    AngularEditorComponent,
                    AngularEditorToolbarComponent,
                    AeSelectComponent,
                    AEButtonIsHiddenPipe
                ],
                // providers: [
                //   AngularEditorService,
                //   ImageResizeService
                // ],
                exports: [
                    AeButtonComponent,
                    AeToolbarSetComponent,
                    AngularEditorComponent,
                    AngularEditorToolbarComponent
                ]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AngularEditorModule, { declarations: [AeButtonComponent,
        AeToolbarSetComponent,
        AngularEditorComponent,
        AngularEditorToolbarComponent,
        AeSelectComponent,
        AEButtonIsHiddenPipe], imports: [CommonModule, FormsModule, ReactiveFormsModule], exports: [AeButtonComponent,
        AeToolbarSetComponent,
        AngularEditorComponent,
        AngularEditorToolbarComponent] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3IubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1lZGl0b3Ivc3JjL2xpYi9hbmd1bGFyLWVkaXRvci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUN2RyxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDOztBQTRCbEYsTUFBTSxPQUFPLG1CQUFtQjs7c0ZBQW5CLG1CQUFtQjtxRUFBbkIsbUJBQW1CO3lFQXJCNUIsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUI7dUZBcUJyQyxtQkFBbUI7Y0F2Qi9CLFFBQVE7ZUFBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUI7aUJBQy9DO2dCQUNELFlBQVksRUFBRTtvQkFDWixpQkFBaUI7b0JBQ2pCLHFCQUFxQjtvQkFDckIsc0JBQXNCO29CQUN0Qiw2QkFBNkI7b0JBQzdCLGlCQUFpQjtvQkFDakIsb0JBQW9CO2lCQUNyQjtnQkFDRCxlQUFlO2dCQUNmLDBCQUEwQjtnQkFDMUIsdUJBQXVCO2dCQUN2QixLQUFLO2dCQUNMLE9BQU8sRUFBRTtvQkFDUCxpQkFBaUI7b0JBQ2pCLHFCQUFxQjtvQkFDckIsc0JBQXNCO29CQUN0Qiw2QkFBNkI7aUJBQzlCO2FBQ0Y7O3dGQUNZLG1CQUFtQixtQkFsQjVCLGlCQUFpQjtRQUNqQixxQkFBcUI7UUFDckIsc0JBQXNCO1FBQ3RCLDZCQUE2QjtRQUM3QixpQkFBaUI7UUFDakIsb0JBQW9CLGFBUnBCLFlBQVksRUFBRSxXQUFXLEVBQUUsbUJBQW1CLGFBZTlDLGlCQUFpQjtRQUNqQixxQkFBcUI7UUFDckIsc0JBQXNCO1FBQ3RCLDZCQUE2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBbmd1bGFyRWRpdG9yQ29tcG9uZW50fSBmcm9tICcuL2FuZ3VsYXItZWRpdG9yLmNvbXBvbmVudCc7XG5pbXBvcnQge0FFQnV0dG9uSXNIaWRkZW5QaXBlLCBBbmd1bGFyRWRpdG9yVG9vbGJhckNvbXBvbmVudH0gZnJvbSAnLi9hbmd1bGFyLWVkaXRvci10b29sYmFyLmNvbXBvbmVudCc7XG5pbXBvcnQge0Zvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEFlU2VsZWN0Q29tcG9uZW50IH0gZnJvbSAnLi9hZS1zZWxlY3QvYWUtc2VsZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQge0FlQnV0dG9uQ29tcG9uZW50fSBmcm9tIFwiLi9hZS1idXR0b24vYWUtYnV0dG9uLmNvbXBvbmVudFwiO1xuaW1wb3J0IHsgQWVUb29sYmFyU2V0Q29tcG9uZW50IH0gZnJvbSAnLi9hZS10b29sYmFyLXNldC9hZS10b29sYmFyLXNldC5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBBbmd1bGFyRWRpdG9yU2VydmljZSB9IGZyb20gJy4vYW5ndWxhci1lZGl0b3Iuc2VydmljZSc7XG5pbXBvcnQgeyBJbWFnZVJlc2l6ZVNlcnZpY2UgfSBmcm9tICcuL2ltYWdlLXJlc2l6ZS5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSwgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgQWVCdXR0b25Db21wb25lbnQsXG4gICAgQWVUb29sYmFyU2V0Q29tcG9uZW50LFxuICAgIEFuZ3VsYXJFZGl0b3JDb21wb25lbnQsXG4gICAgQW5ndWxhckVkaXRvclRvb2xiYXJDb21wb25lbnQsXG4gICAgQWVTZWxlY3RDb21wb25lbnQsXG4gICAgQUVCdXR0b25Jc0hpZGRlblBpcGVcbiAgXSxcbiAgLy8gcHJvdmlkZXJzOiBbXG4gIC8vICAgQW5ndWxhckVkaXRvclNlcnZpY2UsXG4gIC8vICAgSW1hZ2VSZXNpemVTZXJ2aWNlXG4gIC8vIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBBZUJ1dHRvbkNvbXBvbmVudCwgXG4gICAgQWVUb29sYmFyU2V0Q29tcG9uZW50LFxuICAgIEFuZ3VsYXJFZGl0b3JDb21wb25lbnQsXG4gICAgQW5ndWxhckVkaXRvclRvb2xiYXJDb21wb25lbnRcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRWRpdG9yTW9kdWxlIHtcbn1cbiJdfQ==