<template>
  <div>{{ isLoading }}</div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';

export default defineComponent({
  setup() {
    const { isLoading } = inject('$test');

    return { isLoading };
  }
});
</script>
