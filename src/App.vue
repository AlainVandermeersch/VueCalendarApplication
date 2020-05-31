<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div v-if="authstatus && authstatus.authAdmin == 'Y' ">
      <v-btn
              v-for="link in links"
              :key="`${link.label}-header-link`"
              text
              :to="link.url"
      >{{ link.label }}</v-btn>
      </div>
      <div v-else>
        <span  v-if="authstatus && authstatus.authFiliere" ref="activefiliere" class="white--text" >Filiere: {{authstatus.authFiliere}}</span>
        <v-btn
                text
                to="/"
        >Calendrier</v-btn>
        <v-btn
                text
                to="/Notifications"
        >Notifications</v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-toolbar-title  v-if="authstatus && authstatus.authNomUtilisateur" >Hello {{authstatus.authNomUtilisateur}}</v-toolbar-title>
        <v-btn v-if="authstatus && authstatus.authNomUtilisateur"
                text
                to="/logout"
        >Quitter</v-btn>
      </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>

    <v-footer color="primary darken-2" padless>
      <v-layout justify-center wrap>
        <v-flex
                primary
                darken-2
                py-4
                text-center
                white--text
                xs12
        >Les Filieres du Roseau , {{ new Date().getFullYear() }}</v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>


  export default {
    name: "App",
    data() {
      return {
        links: [
          {
            label: "Calendrier",
            url: "/"
          },
          {
            label: "Notifications",
            url: "/notifications"
          },
          {
            label: "Utilisateurs",
            url: "/utilisateurs"
          },
          {
            label: "Filieres",
            url: "/filieres"
          },

        ]
      ,
      authstatus:  this.$store.state.auth.authstatus
      }
    },

  };
</script>

