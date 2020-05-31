<template>
  <div class="flex-grid justify-center">
    <v-row
            align="center"
            justify="center"
    >
      <v-col
              cols="12"
              sm="8"
              md="4"
      >

        <v-text-field
                v-model="utilisateurname"
                :error-messages="utilisateurnameErrors"
                label="Votre nom d'utilisateur"
                required
                @input="$v.utilisateurname.$touch()"
                @blur="$v.utilisateurname.$touch()"
        ></v-text-field>
        <v-text-field
                v-model="password"
                :error-messages="passwordErrors"
                label="Votre mot de passe"
                required
                @input="$v.password.$touch()"
                @blur="$v.password.$touch()"
        ></v-text-field>

        <v-btn :disabled="!isFormValid" color="blue" class="mr-4" @click="submitWithUidPwd">Se Connecter</v-btn>
        <v-btn :disabled="!isUtilisateurFilledIn" small color="blue" @click="resetPassword">Demander nouveau mot de passe</v-btn>
        <v-alert v-if="alertmsg"
                 :type="alertmsgok"
        >{{ alertmsg }}</v-alert>
      </v-col>
    </v-row>
    <v-row
            align="center"
            justify="center"
    >
      <v-col
              cols="12"
              sm="8"
              md="4"
      >
    <v-img src="@/assets/logo-roseau.png"></v-img>
      </v-col>
    </v-row>


  </div>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required, minLength } from 'vuelidate/lib/validators'

  export default {
    mixins: [validationMixin],

    validations: {
      password: { required, minLength: minLength(9) },
      utilisateurname: { required }
    },


    data: () => ({
      password: '',
      utilisateurname: '',
      alertmsg: '',
      alertmsgok: 'Y'


    }),

    computed: {
      isFormValid () {
        // loop over all contents of the fields object and check if they exist and valid.
        var inError = this.$v.password.minLength && this.$v.password.required &&  this.$v.utilisateurname.required
        return inError
      },
      isUtilisateurFilledIn () {
        return this.$v.utilisateurname.required
      },
      passwordErrors () {
        const errors = []
        if (!this.$v.password.$dirty) return errors
        !this.$v.password.minLength && errors.push('le mot de passe doit avoir au minimum 9 caractères')
        !this.$v.password.required && errors.push('le mot de passe doit etre spécifié')
        return errors
      },
      utilisateurnameErrors () {
        const errors = []
        if (!this.$v.utilisateurname.$dirty) return errors
        !this.$v.utilisateurname.required && errors.push('le login doit etre spécifié')
        return errors
      },
    },

    methods: {
      submitWithUidPwd () {
        this.alertmsg=''
        this.$store.dispatch('auth/signInWithUtilisateurNameAndPassword', {
          utilisateurname: this.utilisateurname,
          password: this.password
        })
        .then((response) => {
                  if (response.ok =='Y') {
                    this.successRedirect()
                  }
                  else {
                    this.alertmsg = response.message
                    this.alertmsgok = 'error'
                  }

        })
        .catch(error => {
          this.alertmsg= error.message
          this.alertmsgok = 'error'
        })
      },

      successRedirect () {
        const redirectTo = this.$route.query.redirectTo || {name: 'Calendar'}
        this.$router.push(redirectTo)
      },

    resetPassword() {
      this.alertmsg=''
      this.$store.dispatch('auth/sendPasswordResetEmail', {
        utilisateurname: this.utilisateurname
      })
              .then((response) => {
                 this.alertmsg = response.message
                if (response.ok =='Y') {
                  this.alertmsgok = "success"
                }
                else {
                  this.alertmsgok = 'error'
                }

              })
              .catch(error => {
                this.alertmsg= error.message
                this.alertmsgok = 'error'
              })
     }
    },


  }
</script>

