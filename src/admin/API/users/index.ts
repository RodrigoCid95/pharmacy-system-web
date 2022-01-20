import { UsersAPI, DataUser } from './types'
import { Encryptor } from './../../../encryptor'
import { getFirestore, collection, FirestoreDataConverter, doc, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
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
const users: UsersAPI = {
  create: (user, password) => new Promise(async resolve => {
    const hashPassword = Encryptor.encode(user.userName, password)
    const newUser: DataUser = {
      ...user,
      hashPassword
    }
    delete newUser.id
    await addDoc<DataUser>(usersCollection, newUser)
    resolve()
  }),
  read: () => new Promise(async resolve => {
    const snapshots = await getDocs<DataUser>(usersCollection)
    const res = snapshots.docs.map(doc => {
      const { id, userName, name, disabled } = doc.data()
      return { id, userName, name, disabled }
    })
    resolve(res)
  }),
  update: ({ id, userName, name, disabled }) => new Promise(async resolve => {
    await updateDoc(doc(usersCollection, id), { userName, name, disabled })
    resolve()
  }),
  delete: (id) => new Promise(async resolve => {
    await deleteDoc(doc(usersCollection, id))
    resolve()
  })
}
export default users