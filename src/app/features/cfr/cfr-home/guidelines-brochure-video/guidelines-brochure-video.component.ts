import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-guidelines-brochure-video',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './guidelines-brochure-video.component.html',
  styleUrl: './guidelines-brochure-video.component.scss'
})
export class GuidelinesBrochureVideoComponent {

  @Output() onGuidelinesPopup = new EventEmitter();
  @Output() onVideosPopup = new EventEmitter();

}
