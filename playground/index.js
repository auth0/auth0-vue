import { createApp } from 'vue';
import { createAuth0 } from '../src/index.ts';
import Playground from './App.vue';

createApp(Playground).use(createAuth0()).mount('#app');
