import { BarCodesAPI, BarCode } from './types'
import { FirestoreDataConverter, getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { initializeApp } from "firebase/app"

initializeApp({
  apiKey: "AIzaSyCth-jYpNPRV5fTJnjiG57wRG3_zcmvcK8",
  authDomain: "pharmacy-system-d2be6.firebaseapp.com",
  projectId: "pharmacy-system-d2be6",
  storageBucket: "pharmacy-system-d2be6.appspot.com",
  messagingSenderId: "580895026523",
  appId: "1:580895026523:web:24ac9b7b74dfecf18dfe7e"
})

const dataConverter: FirestoreDataConverter<BarCode> = {
  toFirestore: ({ name, value }) => ({ name, value }),
  fromFirestore: (snapshot, options) => {
    const { name, value } = snapshot.data(options)
    return {
      id: snapshot.id,
      name,
      value
    }
  }
}
const db = getFirestore()
const barCodesCollection = collection(db, 'bar-codes').withConverter(dataConverter)
const barCodes: BarCodesAPI = {
  create: async ({ name, value }) => {
    await addDoc(barCodesCollection, { id: '', name, value })
  },
  read: async () => {
    const snapshots = await getDocs(barCodesCollection)
    const res = snapshots.docs.map(doc => {
      const { id, name, value } = doc.data()
      return { id, name, value }
    })
    return res
  },
  update: ({ id, name, value }) => updateDoc(doc(barCodesCollection, id), { name, value }),
  delete: id => deleteDoc(doc(barCodesCollection, id)),
  saveFromDisk: canvas => {
    const a = document.createElement('a')
    a.download = ''
    a.href = canvas.toDataURL()
    a.click()
  }
}
export default barCodes