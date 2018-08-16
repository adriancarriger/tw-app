<template>
  <div class="home">
    <img src="../assets/logo.png">
    <button @click="logout">logout</button>
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import HelloWorld from '@/components/HelloWorld.vue';

@Component({
  components: {
    HelloWorld
  }
})
export default class Home extends Vue {
  public logout() {
    this.$auth.logout();
  }
}
</script>
