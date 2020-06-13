import Vue from 'vue'
import store from '@/store'
import Router from 'vue-router'
import Calendar from '@/pages/PageCalendar'
import Utilisateurs from '@/pages/PageUtilisateurs'
import SignIn from '@/pages/PageSignIn'
import Filieres from '@/pages/PageFilieres'
import Notifications from '@/pages/PageNotifications'
import NotFound from '@/pages/PageNotFound'
Vue.use(Router)
const router = new Router({
    routes: [
       {
            path: '/',
            name: 'Calendar',
            component: Calendar,
            meta: { requiresAuth: true }
        },
        {
            path: '/Filieres',
            name: 'Filieres',
            component: Filieres,
            meta: { requiresAdmin: true }
        },
        {
            path: '/Notifications',
            name: 'Notifications',
            component: Notifications,
            meta: { requiresAuth: true }
        },
        {
            path: '/Utilisateurs',
            name: 'Utilisateurs',
            component: Utilisateurs,
            meta: { requiresAdmin: true }
        },
        {
            path: '/signin',
            name: 'SignIn',
            component: SignIn,
        },
        {
            path: '/logout',
            name: 'SignOut',
            meta: { requiresAuth: true },
            beforeEnter (to, from, next) {
               store.dispatch('auth/signOut')
                    .then(() => {
                        console.log('Alain has Signed Out')
                        next({name: 'SignIn'})
                    })
            }
        },
        {
            path: '*',
            name: 'NotFound',
            component: NotFound
        }
    ],
    mode: 'history'
})
router.beforeEach((to, from, next) => {
    console.log(`🚦 navigating to ${to.name} from ${from.name}`)
    store.dispatch('auth/initAuthentication')
        .then(user => {
            if (to.matched.some(route => route.meta.requiresAdmin)) {
                // protected route
                if (user && user.filiere == 'Toutes') {
                    console.log('Admin user can proceed')
                    next()
                } else {
                    if (user) {
                        console.log('non-admin user routed to Calendar')
                        next({name: 'Calendar', query: {redirectTo: to.path}})
                    } else {
                        console.log('Guest routed to signin')
                        next({name: 'SignIn', query: {redirectTo: to.path}})
                    }
                }
            } else if (to.matched.some(route => route.meta.requiresAuth)) {
                // protected route
                if (user) {
                    console.log('Auth user can proceed')
                    next()
                } else {
                    console.log('Guest routed to signin')
                    next({name: 'SignIn'})
                }
            } else {
                next()
            }
        })
})

export default router