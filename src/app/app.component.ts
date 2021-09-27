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
    const fbCollection = collection(this._firestore, 'demo-todos');
    this.data$ = collectionData(fbCollection, {idField: 'id'});
  }

  async addTodo(input: IonInput) {
    console.log('add todo...');
    const id = Date.now();
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    await setDoc(fbDoc, {desc: input.value}).catch(err => {
      console.log('ERROR: ',err);
    });
    input.value = '';
    console.log('finish!');
  }

  async deleteTodo(id: string) {
    console.log('delete by id: ',id);
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    await deleteDoc(fbDoc);
    console.log('Success deleted item: ', id);
  }

  async updateTodo(id: string, value: string) {
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    updateDoc(fbDoc, {desc: value});
  }

  async presentEditTodo(todo: {id: string, desc: string}) {
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
    await ionAlert.present();
    const {data, role} = await ionAlert.onDidDismiss();
    if (role === 'ok') {
      console.log(data);
      await this.updateTodo(todo.id, data.values.desc);
    }
  }
}
