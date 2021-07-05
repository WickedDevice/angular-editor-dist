import { NgModule } from '@angular/core';
import { AngularEditorComponent } from './angular-editor.component';
import { AEButtonIsHiddenPipe, AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AeSelectComponent } from './ae-select/ae-select.component';
export class AngularEditorModule {
}
AngularEditorModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule, FormsModule, ReactiveFormsModule
                ],
                declarations: [
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
                    AngularEditorComponent,
                    AngularEditorToolbarComponent
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1lZGl0b3IubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Ii9ob21lL21pdGVzaC9kZXYvYW5ndWxhci1lZGl0b3IvYW5ndWxhci1lZGl0b3IvcHJvamVjdHMvYW5ndWxhci1lZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXItZWRpdG9yLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSw2QkFBNkIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQ3ZHLE9BQU8sRUFBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUF1QnBFLE1BQU0sT0FBTyxtQkFBbUI7OztZQW5CL0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQjtpQkFDL0M7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLHNCQUFzQjtvQkFDdEIsNkJBQTZCO29CQUM3QixpQkFBaUI7b0JBQ2pCLG9CQUFvQjtpQkFDckI7Z0JBQ0QsZUFBZTtnQkFDZiwwQkFBMEI7Z0JBQzFCLHVCQUF1QjtnQkFDdkIsS0FBSztnQkFDTCxPQUFPLEVBQUU7b0JBQ1Asc0JBQXNCO29CQUN0Qiw2QkFBNkI7aUJBQzlCO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QW5ndWxhckVkaXRvckNvbXBvbmVudH0gZnJvbSAnLi9hbmd1bGFyLWVkaXRvci5jb21wb25lbnQnO1xuaW1wb3J0IHtBRUJ1dHRvbklzSGlkZGVuUGlwZSwgQW5ndWxhckVkaXRvclRvb2xiYXJDb21wb25lbnR9IGZyb20gJy4vYW5ndWxhci1lZGl0b3ItdG9vbGJhci5jb21wb25lbnQnO1xuaW1wb3J0IHtGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBBZVNlbGVjdENvbXBvbmVudCB9IGZyb20gJy4vYWUtc2VsZWN0L2FlLXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQW5ndWxhckVkaXRvclNlcnZpY2UgfSBmcm9tICcuL2FuZ3VsYXItZWRpdG9yLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW1hZ2VSZXNpemVTZXJ2aWNlIH0gZnJvbSAnLi9pbWFnZS1yZXNpemUuc2VydmljZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsIEZvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIEFuZ3VsYXJFZGl0b3JDb21wb25lbnQsXG4gICAgQW5ndWxhckVkaXRvclRvb2xiYXJDb21wb25lbnQsXG4gICAgQWVTZWxlY3RDb21wb25lbnQsXG4gICAgQUVCdXR0b25Jc0hpZGRlblBpcGVcbiAgXSxcbiAgLy8gcHJvdmlkZXJzOiBbXG4gIC8vICAgQW5ndWxhckVkaXRvclNlcnZpY2UsXG4gIC8vICAgSW1hZ2VSZXNpemVTZXJ2aWNlXG4gIC8vIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBBbmd1bGFyRWRpdG9yQ29tcG9uZW50LFxuICAgIEFuZ3VsYXJFZGl0b3JUb29sYmFyQ29tcG9uZW50XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckVkaXRvck1vZHVsZSB7XG59XG4iXX0=