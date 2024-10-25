import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-assessment-parameters',
  templateUrl: './assessment-parameters.component.html',
  styleUrls: ['./assessment-parameters.component.scss'],
  standalone: true,
})
export class AssessmentParametersComponent {

  @Output() onGuidelinesPopup = new EventEmitter();

  constructor() { }

}
