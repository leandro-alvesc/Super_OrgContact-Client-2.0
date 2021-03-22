<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <span class="md-title">Super OrgContact</span>
      </md-app-toolbar>
      <md-app-content>
        <button
          v-on:click="handleAuthClick"
          class="btn btn-outline-primary"
          href="#"
          role="button"
          id="signin-button"
        >
          Sign In/Authorize
        </button>
        <div>
          <button v-on:click="teste">teste</button>
        </div>
        <div>
          <button v-on:click="revokeAccess" id="revoke-access">Revoke</button>
        </div>
        <div>
          <h1 class="text-center py-5">Contatos</h1>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Domínio</th>
                <th scope="col">Emails</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dominio, index) in emails" :key="index">
                <th scope="row">{{ index + 1 }}</th>
                <td>{{ dominio.dominio }}</td>
                <td>
                  <p v-for="email in dominio.emails" :key="email">
                    {{ email }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </md-app-content>
    </md-app>
  </div>
</template>

<style scoped>
  .md-app {
    max-height: 400px;
    border: 1px solid rgba(#000, .12);
  }
</style>

<script>
import axios from 'axios';
import CLIENT_ID from '../client_secret';

export default {
  name: 'Home',
  // eslint-disable-next-line
  data() {
    return {
      emails: '',
      GoogleAuth: '',
      user: '',
      signedIn: null,
      auth2: '',
      scope:
        'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly',
    };
  },
  methods: {
    teste() {
      // eslint-disable-next-line
      console.log(localStorage.emails);
    },
    // signIn() {
    //   this.auth2.grantOfflineAccess().then(this.signInCallBack);
    // },
    signInCallBack(authResult) {
      // eslint-disable-next-line
      if (authResult['code']) {
        axios
          .post('http://127.0.0.1:5000/auth/google', {
            // eslint-disable-next-line
            code: `${authResult['code']}`, // eslint-disable-next-line
          })
          .then((response) => {
            this.emails = response.data; // eslint-disable-next-line
            localStorage.emails = JSON.stringify(this.emails);
          })
          .catch((error) => {
            // eslint-disable-next-line
            console.log(error);
          });
      }
    },
    loadGapi() {
      window.gapi.load('auth2', this.initClient);
    },
    initClient() {
      this.auth2 = window.gapi.auth2
        .init({
          client_id: CLIENT_ID,
          scope: this.scope, // eslint-disable-next-line
        })
        .then(() => {
          this.GoogleAuth = window.gapi.auth2.getAuthInstance();
          // Listen - mudanças de estado
          this.GoogleAuth.isSignedIn.listen(this.updateSignInStatus);

          // Determinar se o usuário já está logado
          this.user = this.GoogleAuth.currentUser.get();
          this.setSignInStatus();
        });
    },
    handleAuthClick() {
      if (this.GoogleAuth.isSignedIn.get()) {
        // Usuário está autorizado e clicou para sair
        this.GoogleAuth.signOut();
      } else {
        // Usuário não está conectado. Começar Google Auth Flow
        this.GoogleAuth.grantOfflineAccess().then(this.signInCallBack);
      }
    },
    revokeAccess() {
      this.GoogleAuth.disconnect();
    },
    setSignInStatus() {
      this.user = this.GoogleAuth.currentUser.get();
      const isAuthorized = this.user.hasGrantedScopes(this.scope);
      if (isAuthorized) {
        document.getElementById('signin-button').textContent = 'Sign out';
        document.getElementById('revoke-access').style.display = 'inline-block';
      } else {
        document.getElementById('signin-button').textContent = 'Sign In/Authorize';
        document.getElementById('revoke-access').style.display = 'none';
      }
    },
    updateSignInStatus() {
      this.setSignInStatus();
    },
  },
  created() {
    if (!window.gapi) {
      throw new Error(
        '"https://apis.google.com/js/api:client.js" precisa ser incluído como <script> (index.html).',
      );
    }

    this.loadGapi();
  },
  mounted() {
    if (localStorage.emails) {
      this.emails = JSON.parse(localStorage.emails);
    }
  },
};
</script>
