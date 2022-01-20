import { Auth, DataUser } from './types'
import { getFirestore, collection, query, where, getDocs, FirestoreDataConverter } from 'firebase/firestore'
import { initializeApp } from "firebase/app"

initializeApp({
  apiKey: "AIzaSyCth-jYpNPRV5fTJnjiG57wRG3_zcmvcK8",
  authDomain: "pharmacy-system-d2be6.firebaseapp.com",
  projectId: "pharmacy-system-d2be6",
  storageBucket: "pharmacy-system-d2be6.appspot.com",
  messagingSenderId: "580895026523",
  appId: "1:580895026523:web:24ac9b7b74dfecf18dfe7e"
})

const dataConverter: FirestoreDataConverter<DataUser> = {
  toFirestore: ({ userName, name, hashPassword, disabled }) => ({ userName, name, hashPassword, disabled }),
  fromFirestore: (snapshot, options) => {
    const { name, userName, hashPassword, disabled } = snapshot.data(options);
    return {
      id: snapshot.id,
      name,
      userName,
      hashPassword,
      disabled
    }
  }
}
const db = getFirestore()
const usersCollection = collection(db, 'users').withConverter(dataConverter)
const auth: Auth = {
  enter: (userName, password, isAdmin) => new Promise(async (resolve, reject) => {
    if (isAdmin) {
      if (userName === 'root') {
        if (password === 'root') {
          resolve()
        } else {
          reject(new Error('Contraseña incorrecta!'))
        }
      } else {
        reject(new Error('Nombre de usuario incorrecto!'))
      }
    } else {
      const snapshots = await getDocs<DataUser>(query(usersCollection, where('userName', '==', userName)))
      if (snapshots.empty) {
        reject(new Error(`El nombre de usuario ${userName} no existe!`))
      } else {
        resolve()
      }
    }
  })
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: any
window.auth = auth