import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ModalConfig, ModalOutput } from '../../interfaces';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.opened = false;
    }
    if (event.key === 'Enter' && this.opened) {
      this.onSubmit();
    }
  }
  @ViewChildren('modalInput') modalInput:
    | QueryList<ElementRef<HTMLInputElement>>
    | undefined;

  Config: ModalConfig | null = null;
  opened = false;

  ngOnInit() {
    this.modalService.input.subscribe((data: ModalConfig) => {
      this.Config = data;
      this.opened = true;
    });
  }
  constructor(private modalService: ModalService) { }

  onSubmit() {
    let output: ModalOutput = {
      subjectName: this.Config?.subjectName || '',
      value: this.Config?.data,
    };

    let formValues: Record<string, any> = {};
    if (this.modalInput) {
      this.modalInput.forEach((element) => {
        formValues[element.nativeElement.name] = element.nativeElement.value;
      });

      output.formValues = formValues;
    }

    this.modalService.output.next(output);
    this.opened = false;
  }
}
