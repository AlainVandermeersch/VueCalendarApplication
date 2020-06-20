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
                    <v-btn color="primary" dark class="mb-2 mr-2" @click="telecharger">Telecharger</v-btn>
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
                                    <v-select v-if="activefiliere =='Toutes' || activefiliere.indexOf(',') >-1"
                                              v-model="newEvent.filiere"
                                              :items="filieres"
                                              :error-messages="filiereErrors" required @input="$v.newEvent.filiere.$touch()" @blur="$v.newEvent.filiere.$touch()"
                                              item-text="nom"
                                              item-value="couleur"
                                              label="Filiere"
                                              return-object
                                              single-line
                                    ></v-select>
                                    <v-select v-if="activefiliere =='Toutes'"
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
                                            placeholder="ajoutez les informations de base sur les occupants, besoins particuliers, etc...">
                                    </textarea-autosize>
                                    <v-btn color="blue darken-1" text @click="quitter">Quitter</v-btn>
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
                        @change="updateRange" >
                <template v-slot:event="{ event }">
                    <v-icon :color="event.fichecolor">{{ event.icon }}</v-icon>
                    {{ event.filiere }}  {{ event.resident }}
                </template>
                </v-calendar>
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
                            <v-toolbar-title>{{ selectedEvent.resident}}</v-toolbar-title>
                            <div class="flex-grow-1"></div>
                        </v-toolbar>
                        <v-card-text>
                            <form v-if="currentlyEditing.id !== selectedEvent.id">
                                <v-subheader>Arrivée: {{ selectedEvent.start }} Départ: {{ selectedEvent.end }} </v-subheader>
                                <v-subheader>{{ selectedEvent.statut }}:  {{ selectedEvent.chambre }} </v-subheader>
                                <v-subheader>{{ selectedEvent.details }} </v-subheader>
                                <v-subheader v-if="selectedEvent.fiche && selectedEvent.fiche.length > 0">La Fiche des Résidents</v-subheader>
                                <v-simple-table v-if="selectedEvent.fiche && selectedEvent.fiche.length > 0">
                                    <template v-slot:default>
                                        <thead>
                                        <tr>
                                            <th class="text-left">Nom</th>
                                            <th class="text-left">Sexe</th>
                                            <th class="text-left">Age</th>
                                            <th class="text-left">Role</th>
                                            <th class="text-left">Relation Patient</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="item in selectedEvent.fiche" :key="item.nom">
                                            <td>{{ item.nom }}</td>
                                            <td>{{ item.sexe }}</td>
                                            <td>{{ item.age }}</td>
                                            <td>{{ item.role }}</td>
                                            <td>{{ item.relationpatient }}</td>
                                        </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>
                                <v-subheader v-if="selectedEvent.changes">Historique des Changements</v-subheader>
                                <v-simple-table v-if="selectedEvent.changes">
                                    <template v-slot:default>
                                        <thead>
                                        <tr>
                                            <th class="text-left">Auteur</th>
                                            <th class="text-left">Date</th>
                                            <th class="text-left">Element</th>
                                            <th class="text-left">Ancien</th>
                                            <th class="text-left">Nouveau</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="item in selectedEvent.changes" :key="item.date">
                                            <td>{{ item.auteur }}</td>
                                            <td>{{ item.date }}</td>
                                            <td>{{ item.item }}</td>
                                            <td>{{ item.ancien }}</td>
                                            <td>{{ item.nouveau }}</td>
                                        </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>

                            </form>
                            <form v-else>
                                <v-select v-if="activefiliere =='Toutes'"
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
                                        placeholder="ajoutez les informations de base sur les occupants, besoins particuliers, etc...">
                                </textarea-autosize>
                                <v-data-table
                                        :headers="ficheheaders"
                                        :items="selectedEvent.fiche"
                                        sort-by="nom"
                                        class="elevation-1"
                                >
                                    <template v-slot:top>
                                        <v-toolbar flat color="white">
                                            <v-toolbar-title>La Fiche des Résidents</v-toolbar-title>
                                            <v-divider
                                                    class="mx-4"
                                                    inset
                                                    vertical
                                            ></v-divider>
                                            <v-spacer></v-spacer>
                                            <v-dialog v-model="dialogFiche" max-width="500px">
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn
                                                            color="primary"
                                                            dark
                                                            class="mb-2"
                                                            v-bind="attrs"
                                                            v-on="on"
                                                    >Nouveau Résident</v-btn>
                                                </template>
                                                <v-card min-width="350px">
                                                    <v-card-title>
                                                        <span class="headline">{{ formficheTitle }}</span>
                                                    </v-card-title>

                                                    <v-card-text>
                                                        <v-container>
                                                            <v-row>
                                                                <v-col cols="12" sm="6" md="4">
                                                                    <v-text-field v-model="editedFicheItem.nom" label="Nom"></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col cols="12" sm="6" md="4">
                                                                    <v-select
                                                                            v-model="editedFicheItem.sexe"
                                                                            :items="sexes"
                                                                            item-text="sexe"
                                                                            item-value="sexe"
                                                                            label="Sexe"
                                                                            single-line
                                                                    ></v-select>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col cols="12" sm="6" md="4">
                                                                    <v-select
                                                                            v-model="editedFicheItem.role"
                                                                            :items="roles"
                                                                            item-text="role"
                                                                            item-value="role"
                                                                            label="Role"
                                                                            single-line
                                                                    ></v-select>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col cols="12" sm="6" md="4">
                                                                    <v-text-field v-model="editedFicheItem.age" type="number" label="Age"></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col cols="12" sm="6" md="4">
                                                                    <v-text-field v-model="editedFicheItem.relationpatient" label="Relation Patient"></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                        </v-container>
                                                    </v-card-text>

                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="blue darken-1" text @click="ficheClose">Quitter</v-btn>
                                                        <v-btn color="blue darken-1" text @click="ficheSave">Sauver</v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                        </v-toolbar>
                                    </template>
                                    <template v-slot:item.actions="{ item }">
                                        <v-icon
                                                small
                                                class="mr-2"
                                                @click="editFicheItem(item)"
                                        >
                                            mdi-pencil
                                        </v-icon>
                                        <v-icon
                                                small
                                                @click="deleteFicheItem(item)"
                                        >
                                            mdi-delete
                                        </v-icon>
                                    </template>
                                </v-data-table>
                            </form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn text color="secondary" @click="quitterEdit">
                                Quitter
                            </v-btn>
                            <v-btn v-if="currentlyEditing.id !== selectedEvent.id" text @click.prevent="editEvent(selectedEvent)">
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
            currentlyEditing: {},
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            dialog: false,
            dialogFiche: false,
            ficheheaders: [
                {text: 'Nom', value: 'nom'},
                {text: 'Sexe', value: 'sexe'},
                {text: 'Role', value: 'role'},
                {text: 'RelationPatient', value: 'relationpatient'},
                {text: 'Age', value: 'age'},
                {text: 'Actions', value: 'actions', sortable: false},
            ],
            changeheaders: [
                {text: 'Date', value: 'date'},
                {text: 'Changement', value: 'item', sortable: false},
                {text: 'Ancien', value: 'ancien', sortable: false},
                {text: 'Nouveau', value: 'nouveau', sortable: false},
            ],
            editedFicheIndex: -1,
            editedFicheItem: {
                nom: '',
                sexe: 'F',
                role: 'accompagnant',
                age: '',
                relationpatient: ''
            },
            defaultFicheItem: {
                nom: '',
                sexe: 'F',
                role: 'accompagnant',
                age: '',
                relationpatient: ''
            },
        }),
        watch: {
            dialog (val) {
                val || this.close()
            },
            dialogFiche (val) {
                val || this.ficheClose()
            },
        },
        mounted () {
            this.initialize()
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
                if (this.$store.state.auth.authstatus.authFiliere == 'Toutes') {
                    inError = inError && this.$v.newEvent.statut.required
                }
                if (this.$store.state.auth.authstatus.authFiliere == 'Toutes' || this.$store.state.auth.authstatus.authFiliere.indexOf(',') >-1) {
                    inError = inError && this.$v.newEvent.filiere.required
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
            sexes() {
                return ['F','M']
            },
            roles() {
                return ['accompagnant','patient']
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
            formficheTitle () {
                return this.editedFicheIndex === -1 ? 'Nouveau Résident' : 'Editer Resident'
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
            initialize () {
                this.$store.dispatch('filieres/fetchAllFilieres',{'nomfiliere':this.activefiliere})
                    .then(() => this.$store.dispatch('calendar/fetchAllEvents',{'nomfiliere':this.activefiliere}))
            },
            getEvents () {
                this.$store.dispatch('calendar/fetchAllEvents',{'nomfiliere':this.activefiliere})
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
                if (!filiere)
                {
                    console.log(`Event for resident ${event.name} Filiere with name ${event.filiere} does not exist. Filieres : `,this.filieres)
                    return "#FFA500" // orange
                }
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
            telecharger() {
                this.$store.dispatch('calendar/xlsxExport')
            },
            quitter() {
                if (confirm("Etes vous sur de quitter? Vos changements seront perdus")) {
                    this.close()
                }
            },
            quitterEdit() {
                if (this.currentlyEditing.id === this.selectedEvent.id) {
                    if (confirm("Etes vous sur de quitter? Vos changements seront perdus")) {
                        this.selectedOpen = false
                        this.selectedEvent = {}
                        this.currentlyEditing = {}
                        this.getEvents()

                    }
                }
                else {
                    this.selectedOpen = false
                    this.currentlyEditing = {}
                }

            },
            close () {
                this.dialog = false
                this.$nextTick(() => {
                    this.newEvent = Object.assign({}, this.defaultEvent)

                })

            },
            addEvent () {
                let eventFiliere = this.newEvent.filiere
                let eventStatut = this.newEvent.statut
                if (this.$store.state.auth.authstatus.authFiliere != 'Toutes' && this.$store.state.auth.authstatus.authFiliere.indexOf(',') == -1) {
                    // utilisateur qui gère une filière
                        eventFiliere = this.filieres.find(obj => {
                        return obj.nom === this.activefiliere
                    })
                    eventStatut= 'A Valider'
                }
                if (this.$store.state.auth.authstatus.authFiliere.indexOf(',') > -1) {
                    // utilisateur qui gère plusieurs filières
                    eventStatut = 'A Valider'
                }

                const thisEvent= {
                    resident: this.newEvent.nom,
                    start: this.newEvent.start,
                    end:this.newEvent.end,
                    nomfiliere:eventFiliere.nom ,
                    chambre: this.newEvent.chambre,
                    statut: eventStatut,
                    details: this.newEvent.details,
                }
                this.$store.dispatch('calendar/addEvent',thisEvent)
                    .then(() => {
                        this.getEvents()
                        this.close()
                        this.newEvent = Object.assign({}, this.defaultEvent)
                    })


            },
            editEvent (ev) {
                this.currentlyEditing = ev
            },
            updateEvent (ev) {
                console.log( 'Entering updateEvent',ev)
                return this.$store.dispatch('calendar/updateEvent',ev)
                    .then((obj) => {
                        ev.changes=obj.changes
                        this.currentlyEditing = {}
                        const textNotification = "Statut : " + ev.statut + " Resident: " + ev.resident + " Chambre: "
                            + ev.chambre + " Arrivée: " + ev.start + " Départ: " + ev.end + " Détails: " + ev.details

                        this.$store.dispatch('notifications/createNotification', {
                                sujet: 'Modification Séjour',
                                text: textNotification,
                                filiere: ev.filiere
                            },
                            {root: true})

                    })


            },
            deleteEvent (ev) {
                if (confirm("Etes vous sur d'annuler ce séjour?")) {
                    this.$store.dispatch('calendar/deleteEvent', ev)
                        .then(() => {
                            this.selectedOpen = false
                            this.getEvents()
                        })
                }
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
            },
            deleteFicheItem(item) {
                const index = this.selectedEvent.fiche.indexOf(item)
                if (confirm("Etes vous sur d'enlever ce résident?"))
                {
                    if (this.activefiliere !='Toutes') {
                        this.selectedEvent.statut= 'A Valider'
                    }
                    this.selectedEvent.fiche.splice(index, 1)
                    // this.$store.dispatch('calendar/updateFiche', this.selectedEvent)
                }
            },
            editFicheItem (item) {
                this.editedFicheIndex = this.selectedEvent.fiche.indexOf(item)
                this.editedFicheItem = Object.assign({}, item)
                this.dialogFiche = true
            },

           

            ficheClose () {
                this.dialogFiche = false
                this.$nextTick(() => {
                    this.editedFicheItem = Object.assign({}, this.defaultItem)
                    this.editedFicheIndex = -1
                })
            },
            ficheSave () {
                if (this.editedFicheIndex > -1) {
                    Object.assign(this.selectedEvent.fiche[this.editedFicheIndex], this.editedFicheItem)
                } else {
                       this.selectedEvent.fiche.push(this.editedFicheItem)
                }
                this.ficheClose()
               },
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

