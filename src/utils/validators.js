import db from '@/fb'

import {helpers as vuelidateHelpers} from 'vuelidate/lib/validators'

export const uniqueUtilisateurname = (value) => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }

  return new Promise((resolve) => {
      db.collection('utilisateurs').where('utilisateurnameLower','==', value.toLowerCase())
        .get().then(function (querySnapshot) {
          resolve(querySnapshot.empty)
        })
    })

}


export const uniqueEmail = (value) => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  return new Promise((resolve) => {
      db.collection('utilisateurs').doc( value.toLowerCase())
          .get().then(function (doc) {
        resolve(!doc.exists)
      })
  })
}
