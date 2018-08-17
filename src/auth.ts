import auth0 from 'auth0-js';
import Vue, { PluginObject } from 'vue';

const { VUE_APP_URI, VUE_APP_AUTH0_DOMAIN } = process.env;

const webAuth = new auth0.WebAuth({
  domain: `${VUE_APP_AUTH0_DOMAIN}`,
  clientID: '4pHc0YjDT5imFYpAQp4ILKFmWAGviatA',
  redirectUri: `${VUE_APP_URI}/callback`,
  audience: `https://${VUE_APP_AUTH0_DOMAIN}/userinfo`,
  responseType: 'token id_token',
  scope: 'openid'
});

const auth = new Vue({
  computed: {
    token: {
      get: () => localStorage.getItem('idToken'),
      set: (idToken: string) => {
        localStorage.setItem('idToken', idToken);
      }
    },
    accessToken: {
      get: () => localStorage.getItem('accessToken'),
      set: (accessToken: string) => {
        localStorage.setItem('accessToken', accessToken);
      }
    },
    expiresAt: {
      get: () => Number(localStorage.getItem('expiresAt')),
      set: (expiresIn: number) => {
        const expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime());
        localStorage.setItem('expiresAt', expiresAt);
      }
    },
    user: {
      get: () => {
        const user = localStorage.getItem('user');
        if (user === null) {
          return;
        }
        return JSON.parse(user);
      },
      set: (user: string) => {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  },
  methods: {
    login() {
      webAuth.authorize();
    },
    logout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('expiresAt');
      localStorage.removeItem('user');
      webAuth.authorize();
    },
    isAuthenticated() {
      if (this.expiresAt === null) {
        return false;
      }
      return new Date().getTime() < this.expiresAt;
    },
    handleAuthentication() {
      return new Promise((resolve, reject) => {
        webAuth.parseHash((err, authResult) => {
          if (authResult && authResult.accessToken && authResult.idToken) {
            this.expiresAt = Number(authResult.expiresIn);
            this.accessToken = authResult.accessToken;
            this.token = authResult.idToken;
            this.user = authResult.idTokenPayload;

            this.updateAuthHeader();
            resolve();
          } else if (err) {
            this.logout();
            reject(err);
          }
        });
      });
    },
    updateAuthHeader() {
      if (localStorage.getItem('idToken')) {
        Vue.http.options.headers = {
          Authorization: `Bearer ${localStorage.getItem('idToken')}`
        };
      }
    }
  }
});

const authPlugin: PluginObject<void> = {
  install: (vue) => {
    vue.prototype.$auth = auth;
    auth.updateAuthHeader();
  }
};
export default authPlugin;

declare module 'vue/types/vue' {
  interface Vue {
    $auth: {
      login(): void;
      logout(): void;
      handleAuthentication(): PromiseLike<{}>;
      isAuthenticated(): boolean;
    };
    prototype: {
      [key: string]: any;
    };
  }
}
