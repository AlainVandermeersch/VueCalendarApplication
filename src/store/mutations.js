import Vue from 'vue'

export default {
  setItem (state, {item, id, resource}) {
    item['.key'] = id
    Vue.set(state[resource].items, id, item)
  },
  deleteItem (state, { id, resource}) {
    Vue.delete(state[resource].items, id)
  },
  setAllItems: (state,{ items,resource}) => {
    state[resource].items = items
  }

}
