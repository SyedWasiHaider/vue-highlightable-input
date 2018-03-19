// rollup.config.js
import vue from 'rollup-plugin-vue';

export default {
  plugins: [
    vue({ /* configuration options. */ }),
  ],
  input: './src/HighlightableInput.vue',
  output: {
    file: './dist/vue-highlightable-input.js',
    format: 'es'
  },
};