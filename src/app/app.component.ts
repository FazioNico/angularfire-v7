import { Component, OnInit } from '@angular/core';
import { AlertController, IonInput } from '@ionic/angular';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { TodosService } from './todos.service';
import { authState, User, Auth, signInWithPopup, GoogleAuthProvider, UserCredential, signOut } from '@angular/fire/auth';
import { user } from 'rxfire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'FireDemo';
  public data$: Observable<any[]>|undefined;
  public user$: Observable<User | null> | undefined;

  constructor(
    private readonly _alertCtrl: AlertController,
    private readonly _todosService: TodosService,
    private readonly _auth: Auth

  ) {  }

  async ngOnInit() {
    this.user$ = authState(this._auth);
    // get first() stream data from user$ observable data from Firebase Auth
    const user = await this.user$.pipe(first()).toPromise();
    // if user is connected request to load todos from user uid
    if (user) {
      this._todosService.loadTodo(user?.uid);
      this.data$ = this._todosService.data$;
    }
  }

  /**
   * Method to update Todo description from Firebase Firestore collection
   * @param input Ionic input field
   */
  async addTodo(input: IonInput, uid: string) {
    console.log('add todo...');
    if (!input.value) {
      return;
    }
    this._todosService.addTodo({desc: input.value.toString(), uid});
    // clear the input value
    input.value = '';
    console.log('finish!');
  }

  /**
   * Method to delete Todo description from Firebase Firestore collection
   * @param id Todo ID
   */
  async deleteTodo(id: string) {
    console.log('delete by id: ',id);
    await this._todosService.deleteTodo(id);
  }

  /**
   * Method to update Todo description from Firebase Firestore collection
   * @param id Todo ID
   * @param value Todo description to update
   */
  async updateTodo(id: string, desc: string) {
    await this._todosService.updateTodo({id, desc});
  }

  /**
   * UI Event Method to present an alert with input field
   * to update the todo item descrition
   */
  async presentEditTodo(todo: {id: string, desc: string}) {
    // create alert with input to update the todo description
    const ionAlert = await this._alertCtrl.create({
      header: 'Edit Todo',
      inputs: [
        { name: 'desc', type: 'text', value: todo.desc }
      ],
      buttons: [
        {text: 'cancel', role: 'cancel'},
        {text: 'ok', role: 'ok'}
      ]
    });
    // display alert
    await ionAlert.present();
    // wait for user to click ok
    const {data, role} = await ionAlert.onDidDismiss();
    // only update if user clicked ok
    if (role === 'ok') {
      console.log(data);
      // request to update the todo
      await this._todosService.updateTodo({id: todo.id, desc: data.desc})
    }
  }

  /**
   * UI Event Method to toggle todo Done State
   */
   async toggleDone(todo: {id: string, done: boolean}) {
    // update the data with promise
    await this._todosService.toggleState(todo);
   }

  async signinWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credental: UserCredential = await signInWithPopup(this._auth, provider);
    console.log('>>>', credental);
    // user is connected now request to load todos from user uid
    this._todosService.loadTodo(credental.user.uid);
    this.data$ = this._todosService.data$;
  }

  async logout() {
    await signOut(this._auth);
  }
}
