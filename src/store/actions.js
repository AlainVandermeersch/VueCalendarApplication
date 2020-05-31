import db from '@/fb'
export default {
    fetchItem({state, commit}, {id, resource}) {
        return new Promise((resolve) => {
            db.collection(resource).doc(id).get()
                .then(function (snapshot) {
                    commit('setItem', {resource, id: snapshot.id, item: snapshot.data()})
                    resolve(state[resource].items[id])
                })

        })
    },
    fetchItems({dispatch}, {ids, resource}) {
        ids = Array.isArray(ids) ? ids : Object.keys(ids)
        return Promise.all(ids.map(id => dispatch('fetchItem', {id, resource})))
    }
}
