import { ProductsAPI, Product } from './types'
import { getFirestore, collection, FirestoreDataConverter, doc, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL, uploadString, deleteObject } from "firebase/storage"
import { initializeApp } from "firebase/app"

initializeApp({
  apiKey: "AIzaSyCth-jYpNPRV5fTJnjiG57wRG3_zcmvcK8",
  authDomain: "pharmacy-system-d2be6.firebaseapp.com",
  projectId: "pharmacy-system-d2be6",
  storageBucket: "pharmacy-system-d2be6.appspot.com",
  messagingSenderId: "580895026523",
  appId: "1:580895026523:web:24ac9b7b74dfecf18dfe7e"
})

const dataConverter: FirestoreDataConverter<Product> = {
  toFirestore: ({ name, description, sku, thumbnail, price, stock }) => ({ name, description, sku, thumbnail, price, stock }),
  fromFirestore: (snapshot, options) => {
    const { name, description, sku, thumbnail, price, stock } = snapshot.data(options);
    return {
      id: snapshot.id,
      name,
      description,
      sku,
      thumbnail,
      price,
      stock
    }
  }
}
const db = getFirestore()
const productsCollection = collection(db, 'products').withConverter(dataConverter)
const storage = getStorage()
const products: ProductsAPI = {
  create: (product) => new Promise(async resolve => {
    const thumbnail = product.thumbnail
    product.thumbnail = ''
    const docRef = await addDoc(productsCollection, product)
    if (thumbnail !== '') {
      product.id = docRef.id
      const thumbnailRef = ref(storage, product.id)
      await uploadString(thumbnailRef, thumbnail, 'data_url')
      const newURL = await getDownloadURL(thumbnailRef)
      product.thumbnail = newURL
      await products.update(product)
    }
    resolve()
  }),
  read: () => new Promise(async resolve => {
    const snapshots = await getDocs(productsCollection)
    const res: Product[] = []
    snapshots.forEach(dc => res.push(dc.data()))
    resolve(res)
  }),
  update: ({ id, name, description, sku, thumbnail, price }) => new Promise(async resolve => {
    await updateDoc(doc(productsCollection, id), { name, description, sku, thumbnail, price })
    resolve()
  }),
  delete: (product) => new Promise(async resolve => {
    if (product.thumbnail !== '') {
      await deleteObject(ref(storage, product.id))
    }
    await deleteDoc(doc(productsCollection, product.id))
    resolve()
  }),
  selectImage: (calllback) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (ev: any) => {
      const file = ev.path[0].files[0]
      const reader = new FileReader()
      reader.onload = () => (reader.result && typeof reader.result === 'string') && calllback(reader.result)
      reader.onerror = error => console.error(error)
      reader.readAsDataURL(file)
    }
    input.click()
  },
  updateThumbnail: (product, newThumbnail) => new Promise(async resolve => {
    const thumbnailRef = ref(storage, product.id)
    if (product.thumbnail !== '') {
      await deleteObject(thumbnailRef)
    }
    await uploadString(thumbnailRef, newThumbnail, 'data_url')
    const newURL = await getDownloadURL(thumbnailRef)
    product.thumbnail = newURL
    await products.update(product)
    resolve(newURL)
  })
}
export default products