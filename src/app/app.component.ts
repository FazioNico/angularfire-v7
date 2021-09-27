import { Component, OnInit } from '@angular/core';

import { Firestore, collectionData, collection, setDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { AlertController, IonInput } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'FireDemo';
  public data$: Observable<any[]>|undefined;

  constructor(
    private readonly _firestore: Firestore,
    private readonly _alertCtrl: AlertController
  ) {  }

  ngOnInit() {
    // create firebase reference to the collection
    const fbCollection = collection(this._firestore, 'demo-todos');
    // get the data as observable with custome ID field 
    this.data$ = collectionData(fbCollection, {idField: 'id'});
  }

  /**
   * Method to update Todo description from Firebase Firestore collection
   * @param input Ionic input field
   */
  async addTodo(input: IonInput) {
    console.log('add todo...');
    const id = Date.now();
    // create firebase reference to the collection
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    // set the data with promise 
    await setDoc(fbDoc, {desc: input.value}).catch(err => {
      console.log('ERROR: ',err);
    });
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
    // create firebase reference to the collection
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    // delete the data with promise
    await deleteDoc(fbDoc);
    console.log('Success deleted item: ', id);
  }

  /**
   * Method to update Todo description from Firebase Firestore collection
   * @param id Todo ID
   * @param value Todo description to update
   */
  async updateTodo(id: string, value: string) {
    // create firebase reference to the collection
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    // update the data with promise
    await updateDoc(fbDoc, {desc: value});
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
      await this.updateTodo(todo.id, data.values.desc);
    }
  }
}
