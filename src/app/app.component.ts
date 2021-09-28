import { Component, OnInit } from '@angular/core';
import { AlertController, IonInput } from '@ionic/angular';
import { Observable } from 'rxjs';
import { TodosService } from './todos.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'FireDemo';
  public data$: Observable<any[]>|undefined;

  constructor(
    private readonly _alertCtrl: AlertController,
    private readonly _todosService: TodosService
  ) {  }

  ngOnInit() {
    this._todosService.loadTodo();
    this.data$ = this._todosService.data$;
  }

  /**
   * Method to update Todo description from Firebase Firestore collection
   * @param input Ionic input field
   */
  async addTodo(input: IonInput) {
    console.log('add todo...');
    if (!input.value) {
      return;
    }
    this._todosService.addTodo(input.value.toString());
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
}
