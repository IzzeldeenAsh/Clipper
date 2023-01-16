import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import IClip from '../Models/clip.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  Resolve,
  ActivatedRoute,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private _firestorage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip): Observable<DocumentReference<IClip>> {
    return from(this.clipsCollection.add(data));
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }
        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');
        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }
  updateClip(id: string, title: string): Observable<any> {
    return from(
      this.clipsCollection.doc(id).update({
        title,
      })
    );
  }
  deleteClip(clip: IClip): Observable<any> {
    const clipRef = this._firestorage.ref(`clips/${clip.fileName}`);
    return from(clipRef.delete());
  }
  removeClipDatabase(clip: IClip): Observable<any> {
    return from(this.clipsCollection.doc(clip.docID).delete());
  }

  removeScreenshot(clip: IClip): Observable<any> {
    const screenshotRef = this._firestorage.ref(
      `screenshots/${clip.screenshotFileName}`
    );
    return from(screenshotRef.delete());
  }

  async getClips() {
    if (this.pendingReq) {
      return;
    }
    this.pendingReq = true;

    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
    const { length } = this.pageClips;
    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsCollection
        .doc(lastDocID)
        .get()
        .toPromise();
      query = query.startAfter(lastDoc);
    }
    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data(),
      });
    });

    this.pendingReq = false;
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params.id)
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();

          if (!data) {
            this.router.navigate(['/']);
            return null;
          }

          return data;
        })
      );
  }
}
