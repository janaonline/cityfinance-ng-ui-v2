import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;

  constructor() { }
  ngOnInit() {
    console.log('----field table --',this.field);
    console.log('----group table --',this.group.value);

  }
  
}
