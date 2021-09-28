import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, setDoc, doc, deleteDoc, updateDoc, limit, QueryConstraint, where,  } from '@angular/fire/firestore';
import { query } from '@firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodosService {

  public data$: Observable<any>|undefined;

  constructor(
    private readonly _firestore: Firestore,
  ) {}

  /**
   * Method to load todo from Firebase
   */
  loadTodo(): void {
    // create firebase reference to the collection
    const fbCollection = collection(this._firestore, 'demo-todos');
    // create query Constraints
    const limitTo: QueryConstraint = limit(2);
    const isTodo: QueryConstraint = where('done' , '==', false);
    // build query with constraints
    const q = query(fbCollection, limitTo, isTodo);
    // get the data as observable with custome ID field 
    this.data$ = collectionData(q, {idField: 'id'});
  }

  /**
   * Method to creat Todo and save to Firebase Firestore collection
   * @param value Todo description data
   */
  async addTodo(value: string): Promise<void> {
    const id = Date.now();
    // create firebase reference to the collection
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    // set the data with promise 
    await setDoc(fbDoc, {desc: value, done: false}).catch(err => {
      console.log('ERROR: ',err);
    });
  }

  /**
   * Method to update Todo description from Firebase Firestore collection
   * @param todo Todo Object Data
   */
  async updateTodo(todo: {id: string, desc: string}): Promise<void> {
    // create firebase reference to the collection
    const fbDoc = doc(this._firestore, 'demo-todos/' + todo.id);
    // update the data with promise
    await updateDoc(fbDoc, {desc: todo.desc});
  }

  /**
   * Method to delete Todo from Firebase Firestore collection
   * @param id Todo ID
   */
  async deleteTodo(id: string): Promise<void> {
    const fbDoc = doc(this._firestore, 'demo-todos/' + id);
    // delete the data with promise
    await deleteDoc(fbDoc);
  }

  /**
   * Method to toggle todo State
   */
  async toggleState(todo: {id: string, done: boolean}) {
    const fbdoc = doc(this._firestore, 'demo-todos/' + todo.id);
    const done = !todo.done;
    // update the data with promise
    await updateDoc(fbdoc, {done}); 
  }

}
