import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);
// Translation provided by Vuetify (typescript)
import fr from 'vuetify/es5/locale/fr'

export default new Vuetify({
    lang: {
        locales: {fr },
        current: 'fr',
    },
});
