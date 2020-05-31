<template>
    <v-data-table
            :headers="headers"
            :items="utilisateurs"
            sort-by="nom"
            class="elevation-1"
    >

        <template v-slot:top>
            <v-toolbar flat color="white">
                <v-toolbar-title>Les Utilisateurs du Roseau</v-toolbar-title>
                <v-divider
                        class="mx-4"
                        inset
                        vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark class="mb-2" v-on="on">Nouvel Utilisateur</v-btn>
                    </template>
                    <v-card >
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.utilisateurname"  :error-messages="utilisateurnameErrors" required @input="$v.editedItem.utilisateurname.$touch()" @blur="$v.editedItem.utilisateurname.$touch()" label="Login"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.name"  :error-messages="nameErrors" required @input="$v.editedItem.name.$touch()" @blur="$v.editedItem.name.$touch()" label="Nom"></v-text-field>
                                    </v-col>
                                    <v-col v-if="createmode" cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.email" :error-messages="emailErrors" required @input="$v.editedItem.email.$touch()" @blur="$v.editedItem.email.$touch()" label="Email"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-select
                                                v-model="editedItem.filiere"
                                                :items="filieres"
                                                item-text="nom"
                                                item-value="nom"
                                                :error-messages="filiereErrors" required @input="$v.editedItem.filiere.$touch()" @blur="$v.editedItem.filiere.$touch()"
                                                label="Filiere"
                                                single-line
                                        ></v-select>
                                    </v-col>
                                    <v-col v-if="createmode" cols="12" sm="6" md="4">
                                        <v-text-field v-model="editedItem.newpassword"  :error-messages="newpasswordErrors"  @input="$v.editedItem.newpassword.$touch()" @blur="$v.editedItem.newpassword.$touch()" label="Mot de passe"></v-text-field>
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
            <v-alert v-if="errormsg"
                     type="error"
            >{{ errormsg }}</v-alert>
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
    import { required, email } from 'vuelidate/lib/validators'
    export default {
        mixins: [validationMixin],
        data: () => ({
            dialog: false,
            headers: [
                {
                    text: 'Login',
                    align: 'start',
                    value: 'utilisateurname',
                },
                { text: 'Nom', value: 'name' },
                { text: 'Email', value: 'email' },
                { text: 'Filiere', value: 'filiere' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            editedIndex: -1,
            editedItem: {
                utilisateurname: '',
                name: '',
                email: '',
                filiere: '',
                newpassword: ''
            },
            defaultItem: {
                utilisateurname: '',
                name: '',
                email: '',
                filiere: ''

            }
        }),

        computed: {
            isCardValid () {
                // loop over all contents of the fields object and check if they exist and valid.
                var inError = this.$v.editedItem.utilisateurname.required && this.$v.editedItem.name.required && this.$v.editedItem.filiere.required
                    && this.$v.editedItem.email.required && this.$v.editedItem.email.email
                return inError
            },
            createmode () {
                return this.editedIndex === -1
            },
            formTitle () {
                return this.editedIndex === -1 ? 'Créer Utilisateur' : 'Editer Utilisateur'
            },
            utilisateurs() {
                return Object.values(this.$store.state.utilisateurs.items)
            },
            errormsg() {
                return this.$store.state.utilisateurs.errormsg
            },
            filieres() {
                return Object.values(this.$store.state.filieres.items)
            },
            utilisateurnameErrors () {
                const errors = []
                if (!this.$v.editedItem.utilisateurname.$dirty) return errors
                !this.$v.editedItem.utilisateurname.required && errors.push('Le nom de login est obligatoire.')

                return errors
            },
            nameErrors () {
                const errors = []
                if (!this.$v.editedItem.name.$dirty) return errors
                !this.$v.editedItem.name.required && errors.push('Le nom est obligatoire.')

                return errors
            },
            filiereErrors () {
                const errors = []
                if (!this.$v.editedItem.filiere.$dirty) return errors
                !this.$v.editedItem.filiere.required && errors.push('La filiere est obligatoire.')

                return errors
            },

            emailErrors () {
                const errors = []
                if (!this.$v.editedItem.email.$dirty) return errors
                !this.$v.editedItem.email.email && errors.push('E-mail doit etre valide')
                !this.$v.editedItem.email.required && errors.push('E-mail est obligatoire')
                return errors
            },
            newpasswordErrors () {
                const errors = []
                if (!this.$v.editedItem.newpassword.$dirty) return errors
                if (this.editedIndex > -1) return errors // new password mandatory when creating a utilisateur
                !this.$v.editedItem.newpassword.required && errors.push('Mot de passe obligatoire pour nouvel utilisateur')
                return errors
            },

        },

        watch: {
            dialog (val) {
                val || this.close()
            },
        },

        mounted () {
            this.getutilisateurs()
            this.getFilieres()
        },
        validations: {
            editedItem: {
                utilisateurname: {
                    required
                },
                name: {
                    required
                },
                email: {
                    required,
                    email
                },
                newpassword: {
                    required
                },
                filiere: {
                    required
                }
            }
        },
        methods: {
            getutilisateurs () {
                this.$store.dispatch('utilisateurs/fetchAllUtilisateurs')
            },
            getFilieres () {
                this.$store.dispatch('filieres/fetchAllFilieres')
            },

            editItem (item) {
                this.editedIndex = this.utilisateurs.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            deleteItem (item) {
                const index = this.utilisateurs.indexOf(item)
                const booDelete = confirm('etes vous sur de detruire cet utilisateur?') && this.utilisateurs.splice(index, 1)
                if (booDelete) {
                    this.$store.dispatch('utilisateurs/deleteUtilisateur',{utilisateur: item})
                        .then(() => {
                            this.getutilisateurs()
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
                const thisutilisateur = { utilisateurname: this.editedItem.utilisateurname,
                    name: this.editedItem.name,
                    filiere:this.editedItem.filiere,
                    email: this.editedItem.email,
                    newpassword: this.editedItem.newpassword
                }

                if (this.editedIndex > -1) {
                    this.$store.dispatch('utilisateurs/updateUtilisateur',thisutilisateur)
                        .then(() => {
                            this.close()
                            this.getutilisateurs()
                        })
                } else {
                    this.$store.dispatch('utilisateurs/createUtilisateur',thisutilisateur)
                        .then(() => {
                            this.close()
                            this.getutilisateurs()
                        })
                }

            },
        },
    }
</script>