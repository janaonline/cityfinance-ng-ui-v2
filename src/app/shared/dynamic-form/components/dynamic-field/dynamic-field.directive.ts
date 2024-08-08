import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnInit,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { SelectComponent } from '../select/select.component';
import { DateComponent } from '../date/date.component';
import { RadiobuttonComponent } from '../radiobutton/radiobutton.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { ChildFormComponent } from '../child-form/child-form.component';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject, mergeMap, takeUntil, tap } from 'rxjs';
// const componentMapper: Record<any, Type<any>>  = {
//   input: InputComponent,
//   button: ButtonComponent,
//   select: SelectComponent,
//   date: DateComponent,
//   radiobutton: RadiobuttonComponent,
//   checkbox: CheckboxComponent,
//   childform: ChildFormComponent
// };

// export type ServiceComponentType = InputComponent
// | ButtonComponent
// | DateComponent;

// export const servicesComponentFactory:
//   Record<string, Type<Component>>
// = {
//   [ServiceTypes.consultancy]: ConsultancyComponent,
//   [ServiceTypes.trainings]: TrainingsComponent,
//   [ServiceTypes.engineering]: SoftwareEngineeringComponent,
// };

// export const servicesComponentFactory:
//   Record<ServiceTypes, Type<ServiceComponentType>>
// = {
//   [ServiceTypes.consultancy]: ConsultancyComponent,
//   [ServiceTypes.trainings]: TrainingsComponent,
//   [ServiceTypes.engineering]: SoftwareEngineeringComponent,
// };

@Directive({
  selector: '[dynamicField]',
  standalone: true,
})
export class DynamicFieldDirective {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  //@Input() className:string;
  componentRef: any;
  destroy: Subject<void> = new Subject<void>();

  constructor(
    // private resolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private readonly route: ActivatedRoute,
    // private readonly servicesDataService: ServicesDataService,
  ) {}

  ngOnInit() {
    // const factory = this.resolver.resolveComponentFactory(
    //   componentMapper[this.field.type]
    // );
    // const component = this.viewContainerRef.createComponent(YourElement);
    // this.componentRef = this.container.createComponent(factory);
    console.log('this.field.type', this.field.type);

    if (this.field.type) {
      // this.componentRef = this.viewContainerRef.createComponent(this.field.type);
      // this.componentRef = this.viewContainerRef.createComponent(InputComponent);
      // this.componentRef.changeDetectorRef.detectChanges();
      // this.componentRef.instance.field = this.field;
      // this.componentRef.instance.group = this.group;
    }
    //this.componentRef.instance.className = this.className;
  }

  ngOnDestroy(): void {
    this.destroy.next();
  }
}
