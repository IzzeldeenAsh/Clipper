import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/Models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOreder = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _clipService: ClipService,
    private _modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOreder);
  }

  ngOnInit(): void {
    this._route.queryParams.subscribe((params: Params) => {
      this.videoOreder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOreder);
    });

    this._clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => {
        this.clips.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;
    this._router.navigate([], {
      //to make it relative route
      relativeTo: this._route,
      queryParams: {
        sort: value,
      },
    });
  }

  openModal($event: Event, clip: IClip) {
    $event.preventDefault();

    this.activeClip = clip;
    this._modal.toggleModal('editClip');
  }

  update($event: IClip) {
    this.clips.forEach((el, index) => {
      if (el.docID == $event.docID) {
        this.clips[index].title = $event.title;
      }
    });
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();
    this._clipService.deleteClip(clip).subscribe();
    this._clipService.removeClipDatabase(clip).subscribe();
    this._clipService.removeScreenshot(clip).subscribe();
    this.clips.forEach((el, index) => {
      if (el.docID == clip.docID) {
        this.clips.splice(index, 1);
      }
    });
  }

  // async copyToClipboard($event: MouseEvent, docID: string | undefined) {
  //   $event.preventDefault();
  //   if (!docID) {
  //     return;
  //   }
  //   const url = `${location.origin}/clip /${docID}`;

  //   await navigator.clipboard.writeText(url);

  //   alert('Linked copied');
  // }
}
