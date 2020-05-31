import db from '@/fb'

export default {
    namespaced: true,

    state: {
        items: []
    },

    getters: {

    },


    actions: {
        createNotification ({state, commit,rootState}, { text,filiere}) {

            const mydate= new Date()
            const myMonth= mydate.getMonth()+1
            const dateNotification= mydate.getFullYear() + "-" + ("00" + myMonth).slice(-2) + "-" +  ("00" + mydate.getDate()).slice(-2)  + " "
                + ("00" + mydate.getHours()).slice(-2) + ":" + ("00" + mydate.getMinutes()).slice(-2)

            return new Promise((resolve) => {
                const auteur= rootState.auth.authstatus.authNomUtilisateur
                const notificationdata = { filiere,text, auteur,date:dateNotification }
                db.collection('notifications').add(notificationdata)
                    .then((doc) => {
                        commit('setItem', {resource: 'notifications', id:doc.id, item: notificationdata}, {root: true})
                        resolve(state.items[doc.id])
                    })
                    .catch(function(error) {
                        console.error("Error creating notification: ", error);
                    });
            })
        },

        updateNotification ({state}, myNotification) {
            return new Promise((resolve) => {
                db.collection('notifications').doc(myNotification.id)
                    .update({text: myNotification.text})
                    .then(() => {
                       resolve(state.items[myNotification.id])
                    })
                    .catch(function(error) {
                        console.error("Error updating notification: ", error);
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
            if (nomfiliere=='Tous') {
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
                            resolve(state.items)
                        })
                })
            }
            else {
               return new Promise((resolve) => {
                    db.collection('notifications').where('filiere','==', nomfiliere).get()
                        .then((snapshot) => {
                            const notifications = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                notifications.push(appData)
                            })
                            commit('setAllNotifications', notifications)
                            resolve(state.items)
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
