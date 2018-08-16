import auth0 from 'auth0-js';
import Vue, { PluginObject } from 'vue';

const webAuth = new auth0.WebAuth({
  domain: 'adriancarriger.auth0.com',
  clientID: '4pHc0YjDT5imFYpAQp4ILKFmWAGviatA',
  redirectUri: 'http://localhost:4333/callback',
  audience: 'https://adriancarriger.auth0.com/userinfo',
  responseType: 'token id_token',
  scope: 'openid'
});

const auth = new Vue({
  computed: {
    token: {
      get: () => localStorage.getItem('id_token'),
      set: (idToken: string) => {
        localStorage.setItem('id_token', idToken);
      }
    },
    accessToken: {
      get: () => localStorage.getItem('access_token'),
      set: (accessToken: string) => {
        localStorage.setItem('access_token', accessToken);
      }
    },
    expiresAt: {
      get: () => Number(localStorage.getItem('expires_at')),
      set: (expiresIn: number) => {
        const expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime());
        localStorage.setItem('expires_at', expiresAt);
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
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
      if (localStorage.getItem('id_token')) {
        const http: any = this.$http;
        http.headers.common.Authorization = `Bearer ${localStorage.getItem('id_token')}`;
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
