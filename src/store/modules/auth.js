import * as firebase from 'firebase/app'
import 'firebase/auth'
import db from '@/fb'
export default {
  namespaced: true,

  state: {
      authstatus: {
          authId: null,
          authNomUtilisateur: null,
          authAdmin: 'N',
          authFiliere:''
      }
   },



  actions:
      {
    initAuthentication ({dispatch}) {

        return new Promise((resolve) => {
            const userGoogleAuth = firebase.auth().currentUser
            if (userGoogleAuth) {
                console.log('👣 the authorized user is: ', userGoogleAuth.email)
                dispatch('validateAuthorizedUtilisateur', userGoogleAuth)
                    .then((userobj) => {
                        resolve(userobj)
                    })
            } else {
                console.log('initAuthentication No Signed in user');
                resolve(null)
            }
        })
    },

     signInWithUtilisateurNameAndPassword ({dispatch}, {utilisateurname, password}) {
        return db.collection('utilisateurs').where('utilisateurnameLower','==', utilisateurname.toLowerCase()).get()
            .then((snapshot) => {
              if (snapshot.size >0) {
                  const email =snapshot.docs[0].id
                  return firebase.auth().signInWithEmailAndPassword(email, password)
                      .then((data) => {
                          return dispatch('validateAuthorizedUtilisateur', data.user)
                              .then((utilisateur) => {
                                  if (utilisateur) {
                                      return {
                                          ok: 'Y',
                                          message: `L'utilisateur ${utilisateurname} a été validé`
                                      }
                                  }
                                  else {
                                      return {
                                          ok: 'N',
                                          message: `L'utilisateur ${utilisateurname} n'a pas été validé - il est indéfini comme utilisateur , soit sa filiere n'existe plus - contactez le roseau pour obtenir de l'aide`
                                      }
                                  }

                              })
                      })
                      .catch(function(error) {
                          return { ok: 'N',
                              message: `Erreur de connection pour l'utilisateur ${utilisateurname} ${error.message}`
                          }
                      });
              }
              else {
                  return { ok: 'N',
                      message: `L'utilisateur ${utilisateurname} est inconnu`
                  }

              }
            })
    },
      sendPasswordResetEmail (context, {utilisateurname}) {
          return db.collection('utilisateurs').where('utilisateurnameLower','==', utilisateurname.toLowerCase()).get()
              .then((snapshot) => {
                  if (snapshot.size >0) {
                      const email =snapshot.docs[0].id
                      var actionCodeSettings = {
                        // After email is verified, the user will be give the ability to go back
                        // to the sign-in page.
                          url: 'https://leroseaufilieres.be/',
                          handleCodeInApp: false
                      };
                     return firebase.auth().sendPasswordResetEmail(email,actionCodeSettings)
                          .then(() => {
                                return { ok: 'Y',
                                    message: `L'email de vérification a été envoyée à l'email ${email}`
                                }
                          })
                          .catch(function(error) {
                              return { ok: 'N',
                                  message: `L'email de vérification n a pu ètre envoyé à l'email ${email} ${error.message}`
                              }

                          });
                  }
                  else {
                      return {
                          ok: 'N',
                          message: `L'utilisateur ${utilisateurname} n'est pas connu dans notre application`
                      }
                  }
              })
      },


    signOut ({commit}) {
      return firebase.auth().signOut()
        .then(() => {
          commit('setAuthStatus', {authId:null,authNomUtilisateur:null,authAdmin:null,authFiliere:null  })
        })
    },
      validateAuthorizedUtilisateur({commit},userGoogleAuth) {
          return new Promise((resolve) => {
               db.collection('utilisateurs').doc(userGoogleAuth.email).get()
                   .then(function (doc) {
                       if (doc.exists) {
                           const utilisateur= doc.data()
                           let isAdmin='N'
                           if (utilisateur.filiere =='Toutes') {
                               isAdmin='Y'
                           }

                           commit('setAuthStatus', {authId:userGoogleAuth.email,authNomUtilisateur: utilisateur.utilisateurname,authAdmin:isAdmin , authFiliere: utilisateur.filiere})
                           resolve(utilisateur)

                       }
                       else {
                          resolve(null)
                       }

                   })
                   .catch(function(error) {
                       console.log("validateAuthorizedUtilisateur Error getting utilisateur: ", userGoogleAuth.email, error)
                   });
           })

      }
   
  },

  mutations: {
    setAuthStatus (state, {authId,authNomUtilisateur,authAdmin,authFiliere}) {
      console.log('setting AuthId to: ' ,authId, ' nomutilisateur to: ', authNomUtilisateur, ' is admin: ', authAdmin)
      state.authstatus.authId = authId
      state.authstatus.authNomUtilisateur = authNomUtilisateur
      state.authstatus.authAdmin = authAdmin
      state.authstatus.authFiliere = authFiliere
    },


  }
}
