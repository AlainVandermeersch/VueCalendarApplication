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
        fetchAllEvents({state,commit}, { nomfiliere}) {
            if (nomfiliere=='Tous') {
                console.log('I am fetching all events')
                return new Promise((resolve) => {
                    db.collection('calEvent').get()
                        .then((snapshot) => {
                            const events = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                events.push(appData)
                            })
                            commit('setAllEvents', events)
                            resolve(state.items)
                        })
                })
            }
            else {
                console.log('I am fetching all events of filiere:',nomfiliere)
                return new Promise((resolve) => {
                    db.collection('calEvent').where('filiere','==', nomfiliere).get()
                        .then((snapshot) => {
                            const events = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                events.push(appData)
                            })
                            commit('setAllEvents', events)
                            resolve(state.items)
                        })
                })
            }
        },
        fetchevent: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'events', id}, {root: true}),
        fetchEvents: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'events', ids}, {root: true}),

    }

}