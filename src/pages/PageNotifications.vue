<template>
    <v-card>
        <v-card-title>
            <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Search"
                    single-line
                    hide-details
            ></v-text-field>
        </v-card-title>
        <v-data-table
                :headers="headers"
                :items="notifications"
                :search="search"
                sort-by="date"
                sort-desc
                class="elevation-1"
        >
        <template v-slot:item.couleur="{ item }">
            <v-chip :color="item.couleur" dark></v-chip>
        </template>

        <template v-slot:top>
            <v-toolbar flat color="white">
                <v-toolbar-title>Notifications du Roseau</v-toolbar-title>
                <v-divider
                        class="mx-4"
                        inset
                        vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark class="mb-2" v-on="on">Créer Notification</v-btn>
                    </template>
                    <v-card >
                        <v-card-title>
                            <span class="headline">Créer Notification</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container>
                                <v-row v-if="activefiliere =='Toutes' || activefiliere.indexOf(',') >-1">
                                    <v-select
                                              v-model="editedItem.filiere"
                                              :items="filieres"
                                              :error-messages="filiereErrors" required @input="$v.editedItem.filiere.$touch()" @blur="$v.editedItem.filiere.$touch()"
                                              item-text="nom"
                                              item-value="nom"
                                              label="Filiere"
                                              single-line
                                    ></v-select>
                                </v-row>
                                <v-row>
                                    <v-text-field
                                            hint="ajoutez le sujet de votre notification"
                                            v-model="editedItem.sujet"
                                            :error-messages="sujetErrors"
                                            required
                                            counter="100"
                                            single-line
                                            @input="$v.editedItem.sujet.$touch()"
                                            @blur="$v.editedItem.sujet.$touch()"
                                            label="Sujet"
                                    ></v-text-field>

                                </v-row>
                                <v-row>
                                        <v-text-field
                                                hint="ajoutez le contenu de votre notification"
                                                v-model="editedItem.text"
                                                :error-messages="textErrors"
                                                required
                                                counter="500"
                                                single-line
                                                @input="$v.editedItem.text.$touch()"
                                                @blur="$v.editedItem.text.$touch()"
                                                label="Texte"
                                        ></v-text-field>

                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="close">Quitter</v-btn>
                            <v-btn :disabled="!isCardValid" color="blue darken-1" text @click="save()">Sauver</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-icon
                    small
                    @click="deleteItem(item)"
            >
                mdi-delete
            </v-icon>
        </template>
    </v-data-table>
    </v-card>
</template>

<script>
    import { validationMixin } from 'vuelidate'
    import { required } from 'vuelidate/lib/validators'
    export default {
        mixins: [validationMixin],
        data: () => ({
            search: '',
            dialog: false,
            headers: [
                {
                    text: 'Date',
                    align: 'start',
                    value: 'date',
                },
                {text: 'Filiere', value: 'filiere'},
                {text: 'Auteur', value: 'auteur'},
                {text: 'Sujet', value: 'sujet'},
                {text: 'Text', value: 'text'},
                {text: 'Actions', value: 'actions', sortable: false},
            ],
            editedIndex: -1,
            editedItem: {
                date: '',
                auteur: '',
                filiere: '',
                sujet: '',
                text: ''
            },
            defaultItem: {
                date: '',
                auteur: '',
                filiere: '',
                sujet: '',
                text: ''
            },
            filiere:''

        }),

        computed: {
            isCardValid() {
                // loop over all contents of the fields object and check if they exist and valid.
                var inError = this.$v.editedItem.sujet.required && this.$v.editedItem.text.required
                if (this.$store.state.auth.authstatus.authFiliere == 'Toutes' || this.$store.state.auth.authstatus.authFiliere.indexOf(',') >-1) {
                    inError = inError && this.$v.editedItem.filiere.required
                }
                return inError
            },

            notifications() {
                return Object.values(this.$store.state.notifications.items)
            },
            sujetErrors() {
                const errors = []
                if (!this.$v.editedItem.sujet.$dirty) return errors
                !this.$v.editedItem.sujet.required && errors.push('Le sujet est obligatoire.')

                return errors
            },
            textErrors() {
                const errors = []
                if (!this.$v.editedItem.text.$dirty) return errors
                !this.$v.editedItem.text.required && errors.push('Le texte est obligatoire.')

                return errors
            },
            filiereErrors () {
                const errors = []
                if (!this.$v.editedItem.filiere.$dirty) return errors
                !this.$v.editedItem.filiere.required && errors.push('La filiere est obligatoire.')

                return errors
            },
            activefiliere() {
                return this.$store.state.auth.authstatus.authFiliere
            },
            filieres() {
                var myFilieres = Object.values(this.$store.state.filieres.items)
                if (this.$store.state.auth.authstatus.authFiliere == 'Toutes') {
                    const toutesFilieres = { nom: 'Toutes'}
                    return [...myFilieres, toutesFilieres ]
                }
                return myFilieres
            },
        },

        watch: {
            dialog(val) {
                val || this.close()
            },
        },

        mounted() {
            this.initialize()
        },
        validations: {
            editedItem: {
                filiere: {
                    required
                },
                sujet: {
                    required
                },
                text: {
                    required
                },

            }
        },
        methods: {
            initialize () {
                this.$store.dispatch('filieres/fetchAllFilieres',{'nomfiliere':this.activefiliere})
                    .then(() => this.$store.dispatch('notifications/fetchAllNotifications',{'nomfiliere':this.activefiliere}))
            },
            getNotifications() {
                this.$store.dispatch('notifications/fetchAllNotifications',{'nomfiliere':this.activefiliere})
            },
            deleteItem(item) {
                const index = this.notifications.indexOf(item)
                const booDelete = confirm('Etes vous sur de detruire cette notification?') && this.notifications.splice(index, 1)
                if (booDelete) {
                    this.$store.dispatch('notifications/deleteNotification', {id: item.id})
                    .then(() => {  this.getNotifications()})
                }
            },

            close() {
                this.dialog = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                })
            },

            save() {



                var notificationFiliereNom = this.editedItem.filiere
                if (this.$store.state.auth.authstatus.authFiliere != 'Toutes' && this.$store.state.auth.authstatus.authFiliere.indexOf(',') == -1) {
                    const notificationFiliere = this.filieres.find(obj => {
                        return obj.nom === this.activefiliere
                    })
                    notificationFiliereNom = notificationFiliere.nom

                }
                this.$store.dispatch('notifications/createNotification',{  sujet: this.editedItem.sujet,text: this.editedItem.text,
                    filiere: notificationFiliereNom})


                this.close()

            },
        }
    }
</script>