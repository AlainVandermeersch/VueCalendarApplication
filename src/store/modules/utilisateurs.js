import * as firebase from 'firebase/app'
import 'firebase/auth'
import db from '@/fb'

export default {
  namespaced: true,

  state: {
    items: [],
    errormsg: ''
  },

  getters: {

  },

  actions: {
    createUtilisateur ({state, commit}, utilisateur) {
      commit('setErrorMsg','')
      return new Promise((resolve) => {
        const utilisateurnameLower = utilisateur.utilisateurname.toLowerCase()
        const email = utilisateur.email.toLowerCase()
        const password = utilisateur.newpassword
        const updates = {name:utilisateur.name, utilisateurname:utilisateur.utilisateurname, utilisateurnameLower,filiere:utilisateur.filiere, notifiable: utilisateur.notifiable}
        let ok= true
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((data) => {
            console.log('user created in google auth: ',data.user)
             db.collection('utilisateurs').doc(email).set(updates)
            })
            .catch(error => {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        commit('setErrorMsg',`l'adresse e-mail ${email} existait déja dans notre systeme de sécurité, elle sera réutilisée mais le mot de passe spécifié est ignoré`)
                        console.log('will recreate in utilisateurs: ',email)
                        db.collection('utilisateurs').doc(email).set(updates)
                        break
                    case 'auth/invalid-email':
                        commit('setErrorMsg',`l'adresse e-mail ${email} est invalide`,email)
                        ok = false
                        break
                    case 'auth/operation-not-allowed':
                        commit('setErrorMsg',`l'utilisateur n' a pas le droit de créer l'email ${email}`)
                        ok = false
                        break
                    case 'auth/weak-password':
                        commit('setErrorMsg',"le mot de passe spécifié est trop faible - ajoutez des caractères spéciaux et des chiffres!")
                        ok = false
                        break
                    default:
                        commit('setErrorMsg',`erreur technique: ${error.message}`)
                        ok = false
                }

            })
            .then(() => {
                if (ok) {
                    commit('setItem', {resource: 'utilisateurs', id: email, item: updates}, {root: true})
                    resolve(state.items[email])
                }
            })



      })
    },

    updateUtilisateur ({commit}, utilisateur) {
      commit('setErrorMsg','')
      const updates = {
        utilisateurname: utilisateur.utilisateurname,
        utilisateurnameLower: utilisateur.utilisateurname ? utilisateur.utilisateurname.toLowerCase() : null,
        name: utilisateur.name,
        filiere: utilisateur.filiere,
        notifiable: utilisateur.notifiable
      }
      const id = utilisateur.email.toLowerCase()
      return new Promise((resolve) => {
        db.collection('utilisateurs').doc(id).set(updates)
          .then(() => {
            commit('setItem', {resource: 'utilisateurs', id:  id, item: updates}, {root: true})
            resolve(utilisateur)
          })
          .catch(function(error) {
            console.error("Error updating utilisateur: ", error);
          });
      })
    },
    deleteUtilisateur ({state,commit}, { utilisateur}) {
      commit('setErrorMsg','')
      const utilisateurId=utilisateur.email
      console.log('I am deleting utilisateur with key: ' + utilisateurId)
      return new Promise((resolve) => {
        db.collection('utilisateurs').doc(utilisateurId)
            .delete()
            .then(() => {
              commit('deleteItem', {resource: 'utilisateurs', id: utilisateurId}, {root: true})
              resolve(state.items)
            })
            .catch(function(error) {
              console.error("Error removing utilisateur: ", error);
            });
      })
    },
    fetchAllUtilisateurs ({commit}) {
      const items = []

        db.collection('utilisateurs').get()
            .then((snapshot) => {
              snapshot.forEach(doc => {
                let appData = doc.data()
                appData.email = doc.id
                items.push(appData)
              })
              commit('setAllUtilisateurs',items)

            })

    },
    fetchUtilisateur: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'utilisateurs', id}, {root: true}),
    fetchUtilisateurs: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'utilisateurs', ids}, {root: true})
  },
  mutations: {
        setAllUtilisateurs: (state, items) => {
            state.items = items
        },
        setErrorMsg:  (state, errormsg) => {
            state.errormsg = errormsg
        },
    },
}
