import {Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {FileModel} from "../../models/file.model";
import {Subject} from "rxjs";

@Component({
  selector: 'app-file-carousel',
  templateUrl: './file-carousel.component.html',
  styleUrls: ['./file-carousel.component.scss']
})
export class FileCarouselComponent {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.key === 'ArrowRight'){
      this.changeCounter(1);
    }
    else if(event.key === 'ArrowLeft'){
      this.changeCounter(-1);
    }
    else if(event.key === 'Escape'){
      this.closeCarousel();
    }
  }

  IMAGE_FORMATS = [
    'image/jpeg',
    'image/png',
    'image/bmp'
  ]


  @Input() files: FileModel[] = [];
  @Input() fileCounter = 0;
  @Input() openedSubject: Subject<any> = new Subject<any>();
  opened = false;
  width = 0;
  height = 0;
  @ViewChild('img', { static: false }) pic: ElementRef | undefined;


  ngOnInit(){
    this.openedSubject.subscribe({
      next: (data) => {
        this.opened = true;
      }
    })
  }

  onImgLoad() {

    if(this.pic != undefined){
      const imgWidth = (this.pic.nativeElement as HTMLImageElement).naturalWidth;
      const imgHeight = (this.pic.nativeElement as HTMLImageElement).naturalHeight;


      /* Image size calculator
      *  1. Calculate ratio between (image height, screen height) and (image width, screen width)
      *  2. Choose higher one
      *  3. Check if image is big enough to be displayed as 80% of value from step 2 (width or height)
      *     a) if image is big enough: set one value (width or height chosen in step 2) to 80% of screen
      *     b) else: set size to original values
      *
      * */


      if(imgWidth / screen.width > imgHeight / screen.height){
        this.width = 0.8 * screen.width > imgWidth ? imgWidth : 0.8 * screen.width;
        this.height = this.width / imgWidth * imgHeight
      }
      else {
        this.height = 0.8 * screen.height > imgHeight ? imgHeight : 0.8 * screen.height;
        this.width = this.height / imgHeight * imgWidth;
      }
    }
  }

  changeCounter(value: number){
    if(this.fileCounter + value !== this.files.length && this.fileCounter + value !== -1){
      this.fileCounter += value;
      this.width = 0;
      this.height = 0;
    }

  }

  closeCarousel(){
    this.opened = false;
    this.width = 0;
    this.height = 0;
  }
}
