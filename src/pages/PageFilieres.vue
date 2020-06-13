<template>
    <v-data-table
            :headers="headers"
            :items="filieres"
            sort-by="nom"
            class="elevation-1"
    >

        <template v-slot:item.couleur="{ item }">
            <v-chip :color="item.couleur" dark></v-chip>
        </template>

        <template v-slot:top>
            <v-toolbar flat color="white">
                <v-toolbar-title>Les Filieres du Roseau</v-toolbar-title>
                <v-divider
                        class="mx-4"
                        inset
                        vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark class="mb-2" v-on="on">Créer Filiere</v-btn>
                    </template>
                    <v-card >
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.nom"  :error-messages="nomErrors" required @input="$v.editedItem.nom.$touch()" @blur="$v.editedItem.nom.$touch()" label="Nom"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-menu
                                                v-model="menu1"
                                                :close-on-content-click="false"
                                                :nudge-right="40"
                                                transition="scale-transition"
                                                offset-y
                                                min-width="290px"
                                        >Couleur
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                        :color="editedItem.couleur"
                                                        dark
                                                        v-on="on"
                                                ></v-btn>
                                            </template>
                                            <v-color-picker
                                                    v-model="editedItem.couleur"
                                                    hide-canvas
                                                    hide-inputs
                                                    class="mx-auto"
                                                    show-swatches>
                                            </v-color-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.responsable"  :error-messages="responsableErrors" required @input="$v.editedItem.responsable.$touch()" @blur="$v.editedItem.responsable.$touch()" label="Responsable"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.tel"  :error-messages="telErrors" required @input="$v.editedItem.tel.$touch()" @blur="$v.editedItem.tel.$touch()" label="Tel"></v-text-field>
                                    </v-col>
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
                    class="mr-2"
                    @click="editItem(item)"
            >
                mdi-pencil
            </v-icon>
            <v-icon
                    small
                    @click="deleteItem(item)"
            >
                mdi-delete
            </v-icon>
        </template>
    </v-data-table>
</template>

<script>
    import { validationMixin } from 'vuelidate'
    import { required } from 'vuelidate/lib/validators'
    export default {
        mixins: [validationMixin],
        data: () => ({
            dialog: false,
            menu1: false,
            headers: [
                {
                    text: 'Nom',
                    align: 'start',
                    sortable: false,
                    value: 'nom',
                },
                { text: 'Couleur', value: 'couleur' },
                { text: 'Responsable', value: 'responsable' },
                { text: 'Tel', value: 'tel' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            editedIndex: -1,
            editedItem: {
                nom: '',
                couleur:'#fff000',
               responsable: '',
               tel: ''
            },
            defaultItem: {
                nom: '',
                couleur:'#fff000',
                responsable: '',
                tel: ''
            },

        }),

        computed: {
            isCardValid () {
                // loop over all contents of the fields object and check if they exist and valid.
                var inError = this.$v.editedItem.nom.required && this.$v.editedItem.responsable.required && this.$v.editedItem.tel.required
                return inError
            },
            formTitle () {
                return this.editedIndex === -1 ? 'Créer Filière' : 'Editer Filière'
            },
            filieres() {
                return Object.values(this.$store.state.filieres.items)
            },
            nomErrors () {
                const errors = []
                if (!this.$v.editedItem.nom.$dirty) return errors
                !this.$v.editedItem.nom.required && errors.push('Le nom est obligatoire.')

                return errors
            },
            telErrors () {
                const errors = []
                if (!this.$v.editedItem.tel.$dirty) return errors
                !this.$v.editedItem.tel.required && errors.push('Le telephone est obligatoire.')

                return errors
            },
            responsableErrors () {
                const errors = []
                if (!this.$v.editedItem.responsable.$dirty) return errors
                !this.$v.editedItem.responsable.required && errors.push('Le nom du responsable est obligatoire.')

                return errors
            }

        },

        watch: {
            dialog (val) {
                val || this.close()
            },
        },

        mounted () {
            this.getFilieres()
        },
        validations: {
            editedItem: {
                nom: {
                    required
                },
                responsable: {
                    required
                },
                tel: {
                    required
                },
            }
        },
        methods: {
            getFilieres () {
                this.$store.dispatch('filieres/fetchAllFilieres',{'nomfiliere':'Toutes'})
            },

            editItem (item) {
                this.editedIndex = this.filieres.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            deleteItem (item) {
                const index = this.filieres.indexOf(item)
                const booDelete = confirm('Are you sure you want to delete this item?') && this.filieres.splice(index, 1)
                if (booDelete) {
                    this.$store.dispatch('filieres/deleteFiliere',{nom: item.nom})
                        .then(() => {
                            this.getFilieres()
                        })
                }
            },

            close () {
                this.dialog = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                })
            },

            save () {

                const thisfiliere = { nom: this.editedItem.nom,
                    couleur: this.editedItem.couleur,
                    responsable:this.editedItem.responsable,
                    tel: this.editedItem.tel
                }

                if (this.editedIndex > -1) {
                    Object.assign(this.filieres[this.editedIndex], this.editedItem)
                    this.$store.dispatch('filieres/updateFiliere',thisfiliere)
                        .then(() => {
                            this.getFilieres()
                        })
                } else {
                    this.filieres.push(this.editedItem)
                    this.$store.dispatch('filieres/createFiliere',thisfiliere)
                        .then(() => {
                            this.getFilieres()
                        })
                }
                this.close()
            },
        },
    }
</script>