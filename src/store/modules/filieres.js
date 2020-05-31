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
        fetchAllFilieres: async context => {
            let snapshot = await db.collection('filieres').get()
            const items = []
            snapshot.forEach(doc => {
                   let appData = doc.data()
                   appData.nom = doc.id
                   items.push(appData)
               })
               context.commit('setAllFilieres',items)

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
