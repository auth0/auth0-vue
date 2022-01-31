<template>
  <h1 class="mb-5">Auth0 Vue Playground</h1>

  <div v-if="!isLoading">
    <router-link to="/" class="btn" data-cy="home-menu">Home</router-link>
    <router-link to="/profile" class="btn" data-cy="profile-menu"
      >Profile</router-link
    >
    <div class="mt-3">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuth0 } from '../src';

export default defineComponent({
  setup() {
    const { isLoading } = useAuth0();

    return { isLoading };
  }
});
</script>
