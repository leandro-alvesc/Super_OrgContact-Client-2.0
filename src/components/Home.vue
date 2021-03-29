<template>
  <v-app>
    <div>
      <v-app-bar color="blue-grey">
        <v-toolbar-title class="white--text">Super OrgContact</v-toolbar-title>
      </v-app-bar>
    </div>
    <div>
      <v-stepper id="step" v-model="step">
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1">
            Passo 1
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="step > 2" step="2">
            Passo 2
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step step="3"> Passo 3 </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card class="mb-12 px-5 py-5" color="teal lighten-4"
              >Para obter a lista de emails, primeiramente clique em Sign In
              abaixo!
            </v-card>

            <v-btn color="primary" @click="step = 2"> Próximo </v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card class="mb-12 px-5 py-5" color="teal lighten-4"
              >Permita que o aplicativo acesse sua conta para que possamos
              apresentar seus contatos organizados por email.
            </v-card>

            <v-btn color="primary" @click="step = 3"> Próximo </v-btn>

            <v-btn text @click="step = 1"> Anterior </v-btn>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card class="mb-12 px-5 py-5" color="teal lighten-4">
              Obrigado por testar o aplicativo! <br />
              <a href="https://github.com/leandro-alvesc">Acesse meu GitHub!</a>
            </v-card>

            <v-btn color="primary" @click="step = 1"> Próximo </v-btn>

            <v-btn text @click="step = 2"> Anterior </v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </div>
    <div id="painel-emails" style="display: none">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-header> Emails </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-simple-table>
              <thead>
                <tr>
                  <th>#</th>
                  <th class="text-left">Domínio</th>
                  <th class="text-left">Emails</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="linha-tabela"
                  v-for="(dominio, index) in emails"
                  :key="index"
                >
                  <th>{{ index + 1 }}</th>
                  <td>{{ dominio.dominio }}</td>
                  <td>
                    <p v-for="email in dominio.emails" :key="email">
                      {{ email }}
                    </p>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header> Gráfico </v-expansion-panel-header>
          <v-expansion-panel-content class="grafico">
            <GChart
              type="PieChart"
              :data="dataEmails"
              :options="chartOptions"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn
        v-on:click="updateEmails"
        block
        color="primary"
        elevation="2"
        role="button"
      >
        Atualizar
      </v-btn>
    </div>
    <v-footer app>
      <v-btn
        block
        color="primary"
        v-on:click="handleAuthClick"
        elevation="2"
        role="button"
        id="signin-button"
      >
        Sign In/Autorizar
      </v-btn>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            id="revoke-access"
            block
            color="error"
            dark
            v-bind="attrs"
            v-on="on"
          >
            Remover Acesso
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline grey lighten-2">
            Remover Acesso
          </v-card-title>

          <v-card-text>
            Tem certeza que deseja remover o acesso ao aplicativo?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialog = false">
              Não remover
            </v-btn>
            <v-btn
              color="error"
              v-on:click="revokeAccess"
              text
              @click="dialog = false"
            >
              Remover
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-footer>
  </v-app>
</template>

<style scoped>
#step {
  margin: 10%;
}

.grafico {
  height: auto;
}
</style>

<script>
import axios from 'axios';
import CLIENT_ID from '../client_secret';

export default {
  name: 'Home',
  data() {
    return {
      step: 1,
      dialog: false,
      emails: '',
      dataEmails: [],
      chartOptions: {
        chart: {
          title: 'Relatório de Emails',
          subtitle: 'Contagem de emails por domínio',
        },
      },
      GoogleAuth: '',
      user: '',
      signedIn: null,
      auth2: '',
      scope:
        'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly',
    };
  },
  methods: {
    signInCallBack(authResult) {
      // eslint-disable-next-line
      if (authResult['code']) {
        axios
          .post('https://super-orgcontact-with-frontend.rj.r.appspot.com/auth/google', {
            // eslint-disable-next-line
            code: `${authResult['code']}`,
          })
          .then((resp) => {
            this.emails = resp.data;
            localStorage.emails = JSON.stringify(this.emails);
            this.createDataEmails();
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
        localStorage.removeItem('emails');
        this.emails = '';
      } else {
        // Usuário não está conectado. Começar Google Auth Flow
        this.GoogleAuth.grantOfflineAccess().then(this.signInCallBack);
      }
    },
    revokeAccess() {
      this.GoogleAuth.disconnect();
      axios
        .post('https://super-orgcontact-with-frontend.rj.r.appspot.com/revoke/google', {
          email: `${this.GoogleAuth.currentUser
            .get()
            .getBasicProfile()
            .getEmail()}`,
        })
        .then((response) => {
          console.log(response.data);
          localStorage.removeItem('emails');
          this.emails = '';
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
        });
    },
    setSignInStatus() {
      this.user = this.GoogleAuth.currentUser.get();
      const isAuthorized = this.user.hasGrantedScopes(this.scope);
      if (isAuthorized) {
        document.getElementById('signin-button').textContent = 'Sign out';
        document.getElementById('revoke-access').style.display = 'inline-block';
        document.getElementById('painel-emails').style.display = 'inline-block';
        document.getElementById('step').style.display = 'none';
      } else {
        document.getElementById('signin-button').textContent = 'Sign In/Autorizar';
        document.getElementById('revoke-access').style.display = 'none';
        document.getElementById('painel-emails').style.display = 'none';
        document.getElementById('step').style.display = 'block';
      }
    },
    updateSignInStatus() {
      this.setSignInStatus();
    },
    createDataEmails() {
      // eslint-disable-next-line
      let emails = this.emails; // eslint-disable-next-line
      let dataEmails = [];
      dataEmails.push(['Domínio', 'Quantidade']);
      // eslint-disable-next-line
      for (let email of emails) {
        dataEmails.push([email.dominio, email.emails.length]);
      }
      this.dataEmails = dataEmails;
    },
    updateEmails() {
      axios
        .post('https://super-orgcontact-with-frontend.rj.r.appspot.com/update/google', {
          email: `${this.GoogleAuth.currentUser
            .get()
            .getBasicProfile()
            .getEmail()}`,
        })
        .then((response) => {
          if (response.data !== 'none') {
            this.emails = response.data;
            localStorage.emails = JSON.stringify(this.emails);
            this.createDataEmails();
          }
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
        });
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
      this.createDataEmails();
    }
  },
};
</script>
