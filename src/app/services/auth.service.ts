import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { delay, map, filter, switchMap } from 'rxjs/operators';
import IUser from '../Models/user.model';
import { Router } from '@angular/router';
import { ActivatedRoute, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.usersCollection = db.collection('9aggers');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));

    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));

    this._router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => this._route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      });
  }

  public async createUsers(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided');
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email as string,
      userData.password as string
    );

    if (!userCred.user) {
      throw Error('user canot be found');
    }

    await this.usersCollection.doc(userCred.user?.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });
    await userCred.user.updateProfile({
      displayName: userData.name,
    });
  }
  public async logOut($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();
    if (this.redirect) {
      await this._router.navigateByUrl('/');
    }
  }
}
