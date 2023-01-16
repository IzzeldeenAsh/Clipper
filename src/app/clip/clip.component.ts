import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../Models/clip.model';
@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ClipComponent implements OnInit {
  clip?: IClip;
  player?: videojs.Player;
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef; //static will update this property before ngOnIint
  constructor(private _route: ActivatedRoute) {}

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this._route.data.subscribe((data) => {
      this.clip = data.clip as IClip;

      this.player?.src({
        src: this.clip?.url,
        type: 'video/mp4',
      });
    });
  }
}
