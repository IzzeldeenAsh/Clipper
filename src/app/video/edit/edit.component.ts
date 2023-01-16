import {
  OnChanges,
  Component,
  OnInit,
  OnDestroy,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: any = null;
  @Output() update = new EventEmitter();

  inSubmission = false;
  showAlrt = false;
  alertColor = 'blue';
  alertMag = 'Please wait , updating Clip';

  clipID = new FormControl('', {
    nonNullable: true,
  });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  });

  constructor(private modal: ModalService, private _clip: ClipService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = false;
    this.showAlrt = false;
    this.clipID.setValue(this.activeClip.docID);
    this.title.setValue(this.activeClip.title);
  }

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }
  submit() {
    if (!this.activeClip) {
      return;
    }
    this.showAlrt = true;
    this.inSubmission = true;
    this.alertColor = 'blue';
    this.alertMag = 'Please wait , updating Clip';
    this._clip.updateClip(this.clipID.value, this.title.value).subscribe({
      next: () => {
        this.inSubmission = false;
        this.alertColor = 'green';
        this.alertMag = 'Success!';
        this.activeClip.title = this.title.value;
        this.update.emit(this.activeClip);
      },
      error: (error) => {
        this.inSubmission = false;
        this.alertColor = 'red';
        this.alertMag = 'Something went wrong , try again later';
        return;
      },
    });
  }
}
