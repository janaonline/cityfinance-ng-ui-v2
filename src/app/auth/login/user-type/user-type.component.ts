import { Component, EventEmitter, Output } from '@angular/core';
import { USER_TYPE } from '../../../core/models/user/userType';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-user-type',
  imports: [MatIcon],
  templateUrl: './user-type.component.html',
  styleUrl: './user-type.component.scss'
})
export class UserTypeComponent {

  @Output()
  userTypeSelected = new EventEmitter<USER_TYPE>();

  USER_TYPE = USER_TYPE;

  onSelectedUser: any;

}
