import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import utilisateurs from './modules/utilisateurs'
import filieres from './modules/filieres'
import notifications from './modules/notifications'
import auth from './modules/auth'
import calendar from './modules/calendar'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  getters,
  actions,
  mutations,
  modules: {
    calendar,
    filieres,
    utilisateurs,
    notifications,
    auth
  }
})
