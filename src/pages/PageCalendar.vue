<template>
    <v-row class="fill-height">
        <v-col>
            <v-sheet height="64">
                <v-toolbar flat color="white">
                    <v-toolbar-title>{{ title }}</v-toolbar-title>
                    <v-btn fab text small @click="prev">
                        <v-icon small>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-btn fab text small @click="next">
                        <v-icon small>mdi-chevron-right</v-icon>
                    </v-btn>
                    <div class="flex-grow-1"></div>
                     <v-dialog v-model="dialog" max-width="500">
                        <template v-slot:activator="{on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">Nouveau Séjour</v-btn>
                        </template>
                        <v-card>
                            <v-container>
                                <v-form @submit.prevent="addEvent">
                                    <v-text-field v-model="newEvent.nom" type="text" label="Resident"
                                                  :error-messages="nomErrors" required @input="$v.newEvent.nom.$touch()" @blur="$v.newEvent.nom.$touch()"
                                    ></v-text-field>
                                    <v-select
                                            v-model="newEvent.chambre"
                                            :items="chambres"
                                            :error-messages="chambreErrors" required @input="$v.newEvent.chambre.$touch()" @blur="$v.newEvent.chambre.$touch()"
                                            item-text="chambre"
                                            item-value="chambre"
                                            label="Chambre"
                                            single-line
                                    ></v-select>
                                    <v-menu
                                            v-model="menu1"
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            transition="scale-transition"
                                            offset-y
                                            min-width="290px"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field
                                                    :value="formattedDate('newStart')"
                                                    label="Arrivée"
                                                    prepend-icon="date_range"
                                                    :error-messages="startErrors" required @input="$v.newEvent.start.$touch()" @blur="$v.newEvent.start.$touch()"
                                                    readonly
                                                    v-on="on"
                                            ></v-text-field>
                                        </template>
                                        <v-date-picker v-model="newEvent.start" @input="menu1 = false"></v-date-picker>
                                    </v-menu>
                                    <v-menu
                                            v-model="menu2"
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            transition="scale-transition"
                                            offset-y
                                            min-width="290px"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field
                                                    :value="formattedDate('newEnd')"
                                                    label="Départ"
                                                    prepend-icon="date_range"
                                                    :error-messages="endErrors" required @input="$v.newEvent.end.$touch()" @blur="$v.newEvent.end.$touch()"
                                                    readonly
                                                    v-on="on"
                                            ></v-text-field>
                                        </template>
                                        <v-date-picker v-model="newEvent.end" @input="menu2 = false"></v-date-picker>
                                    </v-menu>
                                    <v-select v-if="activefiliere =='Tous'"
                                              v-model="newEvent.filiere"
                                              :items="filieres"
                                              :error-messages="filiereErrors" required @input="$v.newEvent.filiere.$touch()" @blur="$v.newEvent.filiere.$touch()"
                                              item-text="nom"
                                              item-value="couleur"
                                              label="Filiere"
                                              return-object
                                              single-line
                                    ></v-select>
                                    <v-select v-if="activefiliere =='Tous'"
                                              v-model="newEvent.statut"
                                              :items="statuts"
                                              :error-messages="statutErrors" required @input="$v.newEvent.statut.$touch()" @blur="$v.newEvent.statut.$touch()"
                                              item-text="statut"
                                              item-value="statut"
                                              label="Statut"
                                              single-line
                                    ></v-select>
                                    <textarea-autosize
                                            v-model="newEvent.details"
                                            type="text"
                                            :error-messages="detailsErrors" required @input="$v.newEvent.details.$touch()" @blur="$v.newEvent.details.$touch()"
                                            style="width: 100%"
                                            :min-height="100"
                                            placeholder="ajoutez les informations sur le séjour: accompagnants, relation avec le résident, age des résidents, etc...">
                                    </textarea-autosize>
                                    <v-btn color="blue darken-1" text @click="close">Quitter</v-btn>
                                    <v-btn :disabled="!isCardValid" type="submit" color="primary" class="mr-4" >
                                        Créer Séjour
                                    </v-btn>
                                </v-form>
                            </v-container>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </v-sheet>

            <v-sheet height="800">
                <v-calendar
                        ref="calendar"
                        v-model="focus"
                        color="primary"
                        :event-more="false"
                        :events="events"
                        :event-color="getEventColor"
                        :now="today"
                        type="month"
                        locale="fr"
                        @click:event="showEvent"
                        @change="updateRange"
                ></v-calendar>
                <v-menu
                        v-model="selectedOpen"
                        :close-on-content-click="false"
                        :activator="selectedElement"
                        offset-x
                >
                    <v-card color="grey lighten-4" min-width="350px" flat>
                        <v-toolbar color="primary" dark>
                            <v-btn @click="deleteEvent(selectedEvent)" icon>
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-toolbar-title>{{ selectedEvent.name}}</v-toolbar-title>
                            <div class="flex-grow-1"></div>
                        </v-toolbar>
                        <v-card-text>
                            <form v-if="currentlyEditing !== selectedEvent.id">
                                <p> {{ selectedEvent.statut }}:  {{ selectedEvent.chambre }}</p>
                                <p> {{ selectedEvent.details }} </p>
                            </form>
                            <form v-else>
                                <v-select v-if="activefiliere =='Tous'"
                                          v-model="selectedEvent.statut"
                                          :items="statuts"
                                          item-text="statut"
                                          item-value="statut"
                                          label="Statut"
                                          single-line
                                ></v-select>
                                <v-select
                                        v-model="selectedEvent.chambre"
                                        :items="chambres"
                                        item-text="chambre"
                                        item-value="chambre"
                                        label="Chambre"
                                        single-line
                                ></v-select>
                                <v-menu
                                        v-model="menu3"
                                        :close-on-content-click="false"
                                        :nudge-right="40"
                                        transition="scale-transition"
                                        offset-y
                                        min-width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                                :value="formattedDate('updStart')"
                                                label="Arrivée"
                                                prepend-icon="date_range"
                                                readonly
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="selectedEvent.start" @input="menu3 = false"></v-date-picker>
                                </v-menu>
                                <v-menu
                                        v-model="menu4"
                                        :close-on-content-click="false"
                                        :nudge-right="40"
                                        transition="scale-transition"
                                        offset-y
                                        min-width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                                :value="formattedDate('updEnd')"
                                                label="Départ"
                                                prepend-icon="date_range"
                                                readonly
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="selectedEvent.end" @input="menu4 = false"></v-date-picker>
                                </v-menu>
                                <textarea-autosize
                                        v-model="selectedEvent.details"
                                        type="text"
                                        style="width: 100%"
                                        :min-height="100"
                                        placeholder="ajoutez les informations sur le séjour: accompagnants, relation avec le résident, age des résidents, etc...">
                                </textarea-autosize>
                            </form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn text color="secondary" @click="selectedOpen = false">
                                Quitter
                            </v-btn>
                            <v-btn v-if="currentlyEditing !== selectedEvent.id" text @click.prevent="editEvent(selectedEvent)">
                                Editer
                            </v-btn>
                            <v-btn text v-else type="submit" @click.prevent="updateEvent(selectedEvent)">
                                Sauver
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-menu>
            </v-sheet>
        </v-col>
    </v-row>
</template>

<script>


    import db from '@/fb'
    import { validationMixin } from 'vuelidate'
    import { required } from 'vuelidate/lib/validators'
    import parseISO from 'date-fns/parseISO'
    import format from 'date-fns/format'
    export default {
        mixins: [validationMixin],
        data: () => ({
            menu1: false,
            menu2: false,
            menu3: false,
            menu4: false,
            today: new Date().toISOString().substr(0, 10),
            focus: new Date().toISOString().substr(0, 10),
            calendarstart: '',
            calendarend: '',
            newEvent: {
                nom: '',
                filiere: '',
                statut: '',
                chambre: '',
                details: '',
                start: '',
                end: ''
            },
            defaultEvent: {
                nom: '',
                filiere: '',
                statut: '',
                chambre: '',
                details: '',
                start: '',
                end: ''
            },
            color: '#1976D2', // default event color
            currentlyEditing: null,
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            dialog: false
        }),
        watch: {
            dialog (val) {
                val || this.close()
            },
        },
        mounted () {
            this.getEvents()
            this.getFilieres()
        },
        validations: {
            newEvent: {
                nom: {
                    required
                },
                statut: {
                    required
                },
                chambre: {
                    required
                },
                start: {
                    required
                },
                end: {
                    required
                },
                details: {
                    required
                },
                filiere: {
                    required
                }
            }

        },
        computed: {

            isCardValid () {
                // loop over all contents of the fields object and check if they exist and valid.
                var inError = this.$v.newEvent.nom.required  && this.$v.newEvent.chambre.required
                    && this.$v.newEvent.details.required && this.$v.newEvent.start.required && this.$v.newEvent.end.required
                if (this.$store.state.auth.authstatus.authFiliere == 'Tous') {
                    inError = inError && this.$v.newEvent.filiere.required && this.$v.newEvent.statut.required
                }
                return inError
            },
            events () {
                return Object.values(this.$store.state.calendar.items)
            },
            filieres() {
                return Object.values(this.$store.state.filieres.items)
            },
            statuts() {
                return ['A Valider','Validé']
            },
            chambres() {
                return ['Chambre partagée','Chambre double','Chambre triple (enfant >=3ans)','Appartement']
            },
            activefiliere () {
                return this.$store.state.auth.authstatus.authFiliere
            },

            title () {
                const { calendarstart, calendarend } = this
                if (!calendarstart || !calendarend) {
                    return ''
                }
                const startMonth = this.monthFormatter(calendarstart)
                const startYear = calendarstart.year
                return `${startMonth} ${startYear}`

            },
            monthFormatter () {
                return this.$refs.calendar.getFormatter({
                    timeZone: 'UTC', month: 'long',
                })
            },
            nomErrors () {
                const errors = []
                if (!this.dialog || !this.$v.newEvent.nom.$dirty) return errors
                !this.$v.newEvent.nom.required && errors.push('Le nom est obligatoire.')
                return errors
            },
            filiereErrors () {
                const errors = []
                if (!this.dialog ||!this.$v.newEvent.filiere.$dirty) return errors
                !this.$v.newEvent.filiere.required && errors.push('La filiere est obligatoire.')

                return errors
            },

            chambreErrors () {
                const errors = []
                if (!this.dialog || !this.$v.newEvent.chambre.$dirty) return errors
                !this.$v.newEvent.chambre.required && errors.push('La chambre est obligatoire.')
                return errors
            },
            statutErrors () {
                const errors = []
                if (!this.dialog || !this.$v.newEvent.statut.$dirty) return errors
                !this.$v.newEvent.statut.required && errors.push('Le statut est obligatoire.')

                return errors
            },
            detailsErrors () {
                const errors = []
                if (!this.dialog || !this.$v.newEvent.details.$dirty) return errors
                !this.$v.newEvent.details.required && errors.push('Les details sont obligatoires.')
                return errors
            },
            startErrors () {
                const errors = []
                if (!this.dialog || !this.$v.newEvent.start.$dirty) return errors
                !this.$v.newEvent.start.required && errors.push('La date arrivée est obligatoire.')

                return errors
            },
            endErrors () {
                const errors = []
                if (!this.dialog || !this.$v.newEvent.end.$dirty) return errors
                !this.$v.newEvent.end.required && errors.push('La date départ est obligatoire.')
                return errors
            },
        },
        methods: {
            formattedDate(item) {
                let  formattedDate = ''

                switch (item) {
                    case 'newStart':
                        formattedDate = this.newEvent.start ? format(parseISO(this.newEvent.start), 'dd/MM/yyyy') : ''
                        break
                    case 'newEnd':
                        formattedDate = this.newEvent.end ? format(parseISO(this.newEvent.end),'dd/MM/yyyy') : ''
                        break
                    case 'updStart':
                        formattedDate = this.selectedEvent.start ? format(parseISO(this.selectedEvent.start), 'dd/MM/yyyy') : ''
                        break
                    case 'updEnd':
                        formattedDate = this.selectedEvent.end ? format(parseISO(this.selectedEvent.end),'dd/MM/yyyy') : ''
                        break
                }
                return formattedDate
            },
            getEvents () {
                console.log("fetching events for filiere: ",this.activefiliere)
                this.$store.dispatch('calendar/fetchAllEvents',{'nomfiliere':this.activefiliere})
            },
            getFilieres () {
                this.$store.dispatch('filieres/fetchAllFilieres')
            },
            viewDay ({ date }) {
                this.focus = date
                this.type = 'day'
            },
            getEventColor (event) {
                if (event.statut != 'Validé')
                { return "#CDDC39"} // lime
                const filiere = this.filieres.find(obj => {
                    return obj.nom === event.filiere
                })
                return filiere.couleur
            },
            setToday () {
                this.focus = this.today
            },
            prev () {
                this.$refs.calendar.prev()
            },
            next () {
                this.$refs.calendar.next()
            },
            close () {
                this.dialog = false
                this.$nextTick(() => {
                    this.newEvent = Object.assign({}, this.defaultEvent)

                })
            },
            async addEvent () {
                let eventFiliere = this.newEvent.filiere
                let eventStatut = this.newEvent.statut
                if (this.activefiliere !='Tous') {
                    eventFiliere = this.filieres.find(obj => {
                        return obj.nom === this.activefiliere
                    })
                    eventStatut= 'A Valider'
                    console.log('We will create a event with start date: ',this.newEvent.start , 'with end date: ',this.newEvent.end ,' filiere: ',eventFiliere.nom , ' and statut: ',eventStatut )
                }

                await db.collection('calEvent').add({
                    name: eventFiliere.nom + ' ' + this.newEvent.nom,
                    details: this.newEvent.details,
                    start: this.newEvent.start,
                    end: this.newEvent.end,
                    chambre: this.newEvent.chambre,
                    filiere: eventFiliere.nom,
                    statut: eventStatut
                })
                const textNotification="Nouveau Séjour Statut : " + eventStatut + " Resident: " + eventFiliere.nom + ' ' + this.newEvent.nom + " Chambre: "
                    + this.newEvent.chambre + " Arrivée: " + this.newEvent.start + " Départ: " + this.newEvent.end + " Détails: " + this.newEvent.details
                this.getEvents()

                this.$store.dispatch('notifications/createNotification', {
                    text: textNotification,
                    filiere: eventFiliere.nom
                })
                this.close()
                this.newEvent = Object.assign({}, this.defaultEvent)


            },
            editEvent (ev) {
                this.currentlyEditing = ev.id
            },
            updateEvent (ev) {

                if (this.activefiliere !='Tous') {
                    ev.statut= 'A Valider'
                }
                db.collection('calEvent').doc(this.currentlyEditing).update(ev)
                const textNotification="Modification Séjour Statut : " + ev.statut + " Resident: " + ev.name + " Chambre: "
                    + ev.chambre + " Arrivée: " + ev.start + " Départ: " + ev.end + " Détails: " + ev.details
                this.currentlyEditing = null
                this.$store.dispatch('notifications/createNotification', {
                    text: textNotification,
                    filiere: ev.filiere
                })
            },
            async deleteEvent (ev) {
                const nomfiliere=ev.filiere
                const id= ev.id

                const textNotification="Delete Séjour Statut : " + ev.statut + " Resident: " + ev.name + " Chambre: "
                    + ev.chambre + " Arrivée: " + ev.start + " Départ: " + ev.end + " Détails: " + ev.details
                await db.collection('calEvent').doc(id).delete()
                this.selectedOpen = false,
                    this.getEvents()
                this.$store.dispatch('notifications/createNotification', {
                    text: textNotification,
                    filiere: nomfiliere
                })
            },
            showEvent ({ nativeEvent, event }) {
                const open = () => {
                    this.selectedEvent = event
                    this.selectedElement = nativeEvent.target
                    setTimeout(() => this.selectedOpen = true, 10)
                }
                if (this.selectedOpen) {
                    this.selectedOpen = false
                    setTimeout(open, 10)
                } else {
                    open()
                }
                nativeEvent.stopPropagation()
            },
            updateRange ({ start, end }) {
                this.calendarstart = start
                this.calendarend = end
            }
        }
    }
</script>
<style scoped>
    /* https://github.com/vuetifyjs/vuetify/issues/9796 */
    .v-calendar-weekly {
        display: table;
        table-layout: fixed;
    }
    .v-calendar-weekly__week {
        height: auto;
        display: table-row;
    }
    .v-calendar-weekly__day {
        display: table-cell;
        width: calc(100% / 7)
    }
    .v-calendar-weekly__head {
        height: auto;
        display: table-row;
    }

    .v-calendar-weekly__head-weekday {
        display: table-cell;
        width: calc(100% / 7)
    }
</style>

