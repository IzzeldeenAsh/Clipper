import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  crediental = {
    email: '',
    password: '',
  };
  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}
  showAlert = false;
  alertMsg = 'Logining in';
  alertColor = 'blue ';
  inSubmission = false;
  async loginIn() {
    this.showAlert = true;
    this.alertMsg = 'Logining in';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.crediental.email as string,
        this.crediental.password as string
      );
    } catch (e) {
      this.inSubmission = false;
      this.alertMsg = 'Error occured , try again later';
      this.alertColor = 'red';
      return;
    }

    this.alertMsg = 'Loggen In Successfuly';
    this.alertColor = 'green';
  }
}
