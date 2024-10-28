import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-assessment-parameters',
  templateUrl: './assessment-parameters.component.html',
  styleUrls: ['./assessment-parameters.component.scss'],
  standalone: true,
  imports: [RouterModule]
})
export class AssessmentParametersComponent {

  @Output() onGuidelinesPopup = new EventEmitter();

  constructor() { }

}
