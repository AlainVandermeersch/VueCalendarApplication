import db from '@/fb'

export default {
    namespaced: true,

    state: {
        items: []
    },

    getters: {

    },


    actions: {
        createNotification ({state, commit,rootState}, { sujet,text,filiere}) {
           //  console.log(`Creating Notification for filiere ${filiere}`)
            const mydate= new Date()
            const myMonth= mydate.getMonth()+1
            const dateNotification= mydate.getFullYear() + "-" + ("00" + myMonth).slice(-2) + "-" +  ("00" + mydate.getDate()).slice(-2)  + " "
                + ("00" + mydate.getHours()).slice(-2) + ":" + ("00" + mydate.getMinutes()).slice(-2)

            return new Promise((resolve) => {
                const auteur= rootState.auth.authstatus.authNomUtilisateur
                const notificationdata = { filiere,sujet,text, auteur,date:dateNotification }
                    const emails = []
                    db.collection('utilisateurs').get()
                        .then((snapshot) => {
                            snapshot.forEach(doc => {
                                const appData = doc.data()
                                if (appData.notifiable && (filiere === 'Toutes' || appData.filiere.includes(filiere) || appData.filiere.includes('Toutes')))
                                {
                                    const oneemail = `${appData.name}<${doc.id}>`
                                    emails.push(oneemail)
                                }
                        })

                        console.log("Will send emails to: ", emails)
                        return db.collection('email').add({
                            to: emails,
                            message: {
                                subject: `Les Filieres du Roseau - ${sujet} - Notification de ${auteur} `,
                                html: text,
                            },
                        })
                    })
                    .then((doc) => {
                        notificationdata.emailId = doc.id
                        return db.collection('notifications').add(notificationdata)
                    })

                    .then((doc) => {
                        commit('setItem', {resource: 'notifications', id:doc.id, item: notificationdata}, {root: true})
                        resolve(state.items[doc.id])
                    })
                    .catch(function(error) {
                        console.error("Error creating notification: ", error);
                    });
            })
        },

        deleteNotification ({state,commit}, { id}) {
            return new Promise((resolve) => {
                db.collection('notifications').doc(id)
                    .delete()
                    .then(() => {
                        commit('deleteItem', {resource: 'notifications', id: id}, {root: true})
                        resolve(state.items)
                    })
                    .catch(function(error) {
                        console.error("Error removing notification: ", error);
                    });
            })
        },
        fetchAllNotifications({state,commit}, { nomfiliere}) {
            if (nomfiliere=='Toutes') {
                return new Promise((resolve) => {
                    db.collection('notifications').get()
                        .then((snapshot) => {
                            const notifications = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                notifications.push(appData)
                            })
                            commit('setAllNotifications', notifications)
                            resolve(state.notifications)
                        })
                })
            }
            else {
                const nomsAsString = nomfiliere + '' // force it to become a string
                const filiereArray= nomsAsString.split(",")

               return new Promise((resolve) => {
                    db.collection('notifications').get()
                        .then((snapshot) => {
                            const notifications = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                if ( appData.filiere === 'Toutes' || filiereArray.includes( appData.filiere)) {
                                    notifications.push(appData)
                                }
                            })
                            commit('setAllNotifications', notifications)
                            resolve(state.notifications)
                        })
                })
            }
        },
        fetchnotification: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'notifications', id}, {root: true}),
        fetchnotifications: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'notifications', ids}, {root: true})
    },

    mutations: {

        setAllNotifications: (state, items) => {
            state.items = items
        }


    }
}
