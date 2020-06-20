const sortFicheAsString = fiche => {
    let sortedFiche = []
    let finalFiche = []
    let finalUsers = []
    if (fiche && fiche.length > 0) {
        sortedFiche = fiche.sort((a, b) => (a.nom > b.nom) ? 1 : ((b.nom > a.nom) ? -1 : 0));
        sortedFiche.forEach(resident => {
            finalUsers.push(resident.nom)
            finalFiche.push(`${resident.nom}(sexe:${resident.sexe}-age:${resident.age}-role:${resident.role}-relation:${resident.relationpatient})`)
        })
    }
    return {
        'FicheComplete': finalFiche.join(","),
        'FicheNoms': finalUsers.join(","),
    }
}
const dateAsEuropean = isodate => {
    return isodate.substr(8,2) + '-' + isodate.substr(5,2) + '-' + isodate.substr(0,4)
}
// for export to Excel function that converts a stream to array buffer
// See SheetJs tutorial
const s2ab = s => {
    var buf = new ArrayBuffer(s.length)
    var view = new Uint8Array(buf)
    for (var i=0;i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff
    }
    return buf
}
import db from '@/fb'
import firebase from 'firebase/app'
import 'firebase/firestore'
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'
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
        addEvent({dispatch,rootState}, { resident, start,end, chambre,nomfiliere,statut,details}) {
            const mydate = new Date()
            const myMonth = mydate.getMonth() + 1
            const dateChange = ("00" + mydate.getDate()).slice(-2)  + "-" + ("00" + myMonth).slice(-2) + "-" +  mydate.getFullYear() + " "
                + ("00" + mydate.getHours()).slice(-2) + ":" + ("00" + mydate.getMinutes()).slice(-2)
            const auteur= rootState.auth.authstatus.authNomUtilisateur
            let changes = [{
                'auteur': auteur,
                'date': dateChange,
                'item': 'creation',
                'ancien': 'séjour',
                'nouveau': resident
            }]
            return new Promise((resolve) => {
                return db.collection('calEvent').add({
                    resident: resident,
                    start: start,
                    end: end,
                    chambre: chambre,
                    filiere: nomfiliere,
                    statut: statut,
                    details: details,
                    changes: changes
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
        updateEvent({rootState}, { id,resident, start,end, chambre,filiere,statut,details,fiche}) {

            // console.log('original Fiche: ',fiche )
            const newFicheAsSortedString=sortFicheAsString(fiche).FicheComplete
            let newFicheNoms=sortFicheAsString(fiche).FicheNoms
            // console.log('new Fiche as String: ', newFicheAsSortedString)
            const auteur= rootState.auth.authstatus.authNomUtilisateur
            const isAdmin = rootState.auth.authstatus.authAdmin
            return new Promise((resolve) => {
                const mydate = new Date()
                const myMonth = mydate.getMonth() + 1
                const dateChange = ("00" + mydate.getDate()).slice(-2)  + "-" + ("00" + myMonth).slice(-2) + "-" +  mydate.getFullYear() + " "
                    + ("00" + mydate.getHours()).slice(-2) + ":" + ("00" + mydate.getMinutes()).slice(-2)
                let changes = []

                return db.collection('calEvent').doc(id).get()
                    .then((doc) => {
                        let oldData = doc.data()
                        const oldFicheAsSortedString = sortFicheAsString(oldData.fiche).FicheComplete
                        const oldFicheNoms = sortFicheAsString(oldData.fiche).FicheNoms
                        if (oldData.resident != resident) changes.push({
                            'auteur': auteur,
                            'date': dateChange,
                            'item': 'resident',
                            'ancien': oldData.resident,
                            'nouveau': resident
                        })
                        if (oldData.start != start) changes.push({
                            'auteur': auteur,
                            'date': dateChange,
                            'item': 'arrivée',
                            'ancien': dateAsEuropean(oldData.start),
                            'nouveau': dateAsEuropean(start),
                        })
                        if (oldData.end != end) changes.push({
                            'auteur': auteur,
                            'date': dateChange,
                            'item': 'départ',
                            'ancien': dateAsEuropean(oldData.end),
                            'nouveau': dateAsEuropean(end),
                        })
                        if (oldData.chambre != chambre) changes.push({
                            'auteur': auteur,
                            'date': dateChange,
                            'item': 'chambre',
                            'ancien': oldData.chambre,
                            'nouveau': chambre
                        })

                        if (oldData.details != details) changes.push({
                            'auteur': auteur,
                            'date': dateChange,
                            'item': 'details',
                            'ancien': oldData.details,
                            'nouveau': details
                        })
                        // check for all changes except fiche, si l'utilisateur change ces valeurs son statut doit passer à 'A Valider'
                        if ((changes.length > 0) && (isAdmin != 'Y')) {
                            statut = 'A Valider'
                        }
                        if (oldData.statut != statut) changes.push({
                            'auteur': auteur,
                            'date': dateChange,
                            'item': 'statut',
                            'ancien': oldData.statut,
                            'nouveau': statut
                        })
                        if (oldFicheAsSortedString != newFicheAsSortedString) {
                            if (oldFicheNoms === newFicheNoms) {newFicheNoms='maj mineures'}
                            // console.log('oldfichenoms:', oldFicheNoms, 'newfichenoms:', newFicheNoms, 'auteur:',auteur)
                            changes.push({
                                'auteur': auteur,
                                'date': dateChange,
                                'item': 'fiche',
                                'ancien': oldFicheNoms,
                                'nouveau': newFicheNoms
                            })
                        }
                        // console.log('Changes are:', changes)
                        if (changes.length > 0) {
                            return db.collection('calEvent').doc(id).update({
                                resident,
                                start,
                                end,
                                chambre,
                                filiere,
                                statut,
                                details,
                                fiche,
                                changes: firebase.firestore.FieldValue.arrayUnion(...changes)
                            })
                                .then(() => {
                                    console.log('right after update', doc)
                                    return db.collection('calEvent').doc(id).get()
                                })
                                .then((doc) => {
                                    console.log('right after read again', doc)
                                    resolve(doc.data())


                                })
                        }
                        else {
                            resolve(doc.data())
                        }
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
                    return new Promise((resolve) => {
                    db.collection('calEvent').get()
                        .then((snapshot) => {
                            const events = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                // console.log('event data: ', appData)
                                if (!appData.fiche || appData.fiche.size==0) {
                                    appData.fiche=[]
                                    appData.icon='mdi-folder-alert-outline'
                                    appData.fichecolor="orange"
                                }
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

                // console.log('I am fetching all events of filiere:',filiereArray)
                return new Promise((resolve) => {
                    db.collection('calEvent').get()
                        .then((snapshot) => {
                            const events = []
                            snapshot.forEach(doc => {
                                let appData = doc.data()
                                appData.id = doc.id
                                if (filiereArray.includes( appData.filiere)) {
                                    if (!appData.fiche || appData.fiche.size==0) {
                                        appData.fiche=[]
                                        appData.icon='mdi-folder-alert-outline'
                                        appData.fichecolor="orange"
                                    }
                                    events.push(appData)
                                }
                            })
                            commit('setAllEvents', events)
                            resolve(state.events)
                        })
                })
            }
        },
        xlsxExport({state}) {
            const wb = XLSX.utils.book_new()
            wb.Props = {
                Title: 'Sejours du Roseau',
                Subject:'Planning des Séjours',
                Author: 'Alain Vandermeersch'
            }
            wb.SheetNames.push('Planning')

            const fileName = `LeRoseauSejours.${dateAsEuropean(new Date().toISOString())}.xlsx`
            const arrItems= state.items
            let arrData = []
            arrData.push([
                'Filiere',
                'Resident',
                'Statut',
                'Arrivée',
                'Départ',
                'Details',
                'Fiche'
            ])
            arrItems.forEach(item => {
                arrData.push([
                     item.filiere,
                     item.resident,
                     item.statut,
                     dateAsEuropean(item.start),
                     dateAsEuropean(item.end),
                     item.details,
                     sortFicheAsString(item.fiche).FicheComplete
                ])
            })
            var ws = XLSX.utils.aoa_to_sheet(arrData)
            wb.Sheets['Planning'] = ws
            var wbout= XLSX.write(wb, {bookType:'xlsx',type:'binary'})
            var blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
            saveAs(blob, fileName);

        },

        fetchevent: ({dispatch}, {id}) => dispatch('fetchItem', {resource: 'events', id}, {root: true}),
        fetchEvents: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'events', ids}, {root: true}),
    },

}