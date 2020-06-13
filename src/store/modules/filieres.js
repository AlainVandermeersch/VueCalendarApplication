import db from '@/fb'

export default {
    namespaced: true,

    state: {
        items: []
    },

    getters: {

    },


    actions: {
        createFiliere ({state, commit}, { nom, couleur, responsable, tel}) {
            const nomToLower=nom.toLowerCase()
            return new Promise((resolve) => {
                const filieredata = { couleur, responsable, tel}
                db.collection('filieres').doc(nomToLower).set(filieredata)
                    .then(() => {
                        commit('setItem', {resource: 'filieres', id: nomToLower, item: filieredata}, {root: true})
                        resolve(state.items[nomToLower])
                    })
                    .catch(function(error) {
                        console.error("Error creating document: ", error);
                    });
            })
        },

        updateFiliere ({state,commit}, { nom, couleur, responsable, tel}) {
            const nomToLower=nom.toLowerCase()
            const filieredata = { couleur:couleur, responsable:responsable, tel:tel}
            return new Promise((resolve) => {
                db.collection('filieres').doc(nomToLower)
                    .update(filieredata)
                    .then(() => {
                        commit('setItem', {resource: 'filieres', id: nomToLower, item: filieredata}, {root: true})
                        resolve(state.items[nomToLower])
                    })
                    .catch(function(error) {
                        console.error("Error updating document: ", error);
                    });
            })
        },
        deleteFiliere ({state,commit}, { nom}) {
            const nomToLower=nom.toLowerCase()
            return new Promise((resolve) => {
                db.collection('filieres').doc(nomToLower)
                    .delete()
                    .then(() => {
                        commit('deleteItem', {resource: 'filieres', id: nomToLower}, {root: true})
                        resolve(state.items)
                    })
                    .catch(function(error) {
                        console.error("Error removing document: ", error);
                    });
            })
        },
        fetchAllFilieres({state,commit}, { nomfiliere}) {
            if ( nomfiliere=='Toutes') {
                console.log('I am fetching all filieres')
                return new Promise((resolve) => {
                    db.collection('filieres').get()
                        .then((snapshot) => {
                            const items = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.nom = doc.id
                                items.push(appData)
                            })
                            commit('setAllFilieres', items)
                            resolve(state.items)
                        })
                })
            }
            else {
                const nomsAsString = nomfiliere + '' // force it to become a string
                const filiereArray= nomsAsString.split(",")
                console.log('I am fetching filieres:',filiereArray)
                return new Promise((resolve) => {
                    db.collection('filieres').get()
                        .then((snapshot) => {
                            const items = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.nom = doc.id
                                if (filiereArray.includes( appData.nom)) {
                                    console.log(`Adding filiere ${appData.nom}`)
                                    items.push(appData)
                                }

                            })
                            commit('setAllFilieres',items)
                            resolve(state.items)
                        })
                })
            }
        },

        fetchfiliere: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'filieres', id}, {root: true}),
        fetchfilieres: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'filieres', ids}, {root: true})
    },

    mutations: {

        setAllFilieres: (state, items) => {
            state.items = items
        }


    }
}
