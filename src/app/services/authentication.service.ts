import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of,  } from 'rxjs';
import { flatMap, switchMap, tap } from 'rxjs/operators';
import { Storage } from '@capacitor/storage';
const USER_ID = 'my-id';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  userId = '';

  constructor(private http: HttpClient) {
    this.loadUserId();
  }

  async loadUserId() {

    const userId = await Storage.get({key: USER_ID });
    if(userId && userId.value) {
      console.log('set userId', userId.value);

      this.userId = userId.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  login(credentials: {username, password}): Observable<any> {

    if(String(credentials.username) !== String(credentials.password)) {

      this.isAuthenticated.next(false);
      return of(false);

    } else {

      return this.http.get(`https://jsonplaceholder.typicode.com/users?username=${credentials.username}`).pipe(
        flatMap((data: any) => data),
        switchMap((user: any) => {
          console.log(user.id)
          return from(Storage.set({key: USER_ID, value: user.id}))
        }),
        tap (_ => {
          this.isAuthenticated.next(true);
        })

      )

    }

  }

  logout() {
    this.isAuthenticated.next(false);
    return Storage.remove({key: USER_ID});
  }

}
