import Vue from 'vue';
import { Http } from 'vue-resource/types/vue_resource';

declare module 'vue/types/vue' {
  interface VueConstructor {
    http: Http;
  }
}
