import db from '@/fb'
export default {
   namespaced: true,
    state: {
        items: []
    },
    mutations: {
        setAllEvents: (state, items) => {
            state.items = items
        }
    },
    actions: {
        addEvent({dispatch}, { resident, start,end, chambre,nomfiliere,statut,details}) {
            return new Promise((resolve) => {
                return db.collection('calEvent').add({
                    resident: resident,
                    start: start,
                    end: end,
                    chambre: chambre,
                    filiere: nomfiliere,
                    statut: statut,
                    details: details
                })
                .then((obj) => {
                    const textNotification = "Statut : " + statut + " Resident: " + resident + " Chambre: "
                        + chambre + " Arrivée: " + start + " Départ: " + end + " Détails: " + details


                    dispatch('notifications/createNotification', {
                        sujet: 'Nouveau Séjour',
                        text: textNotification,
                        filiere: nomfiliere
                    },
                    {root: true})
                    resolve(obj)
                })
            })
        },
        updateEvent({dispatch}, { id,resident, start,end, chambre,filiere,statut,details}) {
            return new Promise((resolve) => {
                return db.collection('calEvent').doc(id).update({ resident, start,end, chambre,filiere,statut,details})
                .then((obj) => {
                    const textNotification="Statut : " + statut + " Resident: " + resident + " Chambre: "
                        +chambre + " Arrivée: " +start + " Départ: " +end + " Détails: " +details

                    dispatch('notifications/createNotification', {
                        sujet: 'Modification Séjour',
                        text: textNotification,
                        filiere:filiere
                        },
                        {root: true})
                    resolve(obj)
                })
            })
        },
        deleteEvent({dispatch}, ev) {
            return new Promise((resolve) => {
                const nomfiliere=ev.filiere
                const id= ev.id

                db.collection('calEvent').doc(id).delete()
                    .then(() => {
                        const textNotification="Ancien Statut : " + ev.statut + " Resident: " + ev.resident + " Chambre: "
                            + ev.chambre + " Arrivée: " + ev.start + " Départ: " + ev.end + " Détails: " + ev.details

                dispatch('notifications/createNotification', {
                    sujet: 'Annulation Séjour',
                    text: textNotification,
                    filiere: nomfiliere
                    },
                    {root: true})
                resolve(null)
                    })
            })


        },
        fetchAllEvents({state,commit}, { nomfiliere}) {
            if (nomfiliere == 'Toutes') {
                console.log('I am fetching all events')
                return new Promise((resolve) => {
                    db.collection('calEvent').get()
                        .then((snapshot) => {
                            const events = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                appData.icon='mdi-folder-information-outline'
                                appData.fichecolor="white"
                                events.push(appData)
                            })
                            commit('setAllEvents', events)
                            resolve(state.events)
                        })
                })
            }
            else {
                const nomsAsString = nomfiliere + '' // force it to become a string
                const filiereArray= nomsAsString.split(",")

                console.log('I am fetching all events of filiere:',filiereArray)
                return new Promise((resolve) => {
                    db.collection('calEvent').get()
                        .then((snapshot) => {
                            const events = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                if (filiereArray.includes( appData.filiere)) {
                                    appData.icon='mdi-folder-alert-outline'
                                    appData.fichecolor="orange"
                                    events.push(appData)
                                }
                            })
                            commit('setAllEvents', events)
                            resolve(state.events)
                        })
                })
            }
        },
        fetchevent: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'events', id}, {root: true}),
        fetchEvents: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'events', ids}, {root: true}),

    },

}