import db from '@/fb'

import {helpers as vuelidateHelpers} from 'vuelidate/lib/validators'

export const uniqueUsername = (value) => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  console.log('checking if username is unique: ' + value)
  db.collection('users').where('usernameLower','==', value.toLowerCase())
        .get().then(function (querySnapshot) {
      return querySnapshot.empty
    })

}
export const uniqueFiliereName = (value) => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  console.log('checking if filierename is unique: ' + value)
  db.collection('filieres').doc( value.toLowerCase())
      .get().then(function (querySnapshot) {
    return querySnapshot.empty
  })

}



export const responseOk = (value) => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  return new Promise((resolve) => {
    fetch(value)
      .then(response => resolve(response.ok))
      .catch(() => resolve(false))
  })
}

export const uniqueEmail = (value) => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  db.collection('users').where('email','==', value.toLowerCase())
      .get().then(function (querySnapshot) {
    return querySnapshot.empty
  })
}
