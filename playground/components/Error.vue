<script setup lang="ts">
import { useAuth0 } from '../../src';

const { error } = useAuth0();
</script>

<template>
  <div class="container">
    <div class="row align-items-center profile-header">
      <div class="col-12 my-3">
        <h3>Last error</h3>
        <pre><code data-cy="error">
{{JSON.stringify(error, null, 2)}}
              </code>
          </pre>
      </div>
    </div>
  </div>
</template>

