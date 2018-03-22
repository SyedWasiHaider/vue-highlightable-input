// rollup.config.js
import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  plugins: [
    vue({ /* configuration options. */ }),
    resolve(),
    commonjs()
  ],
  input: './src/HighlightableInput.vue',
  output: {
    file: './dist/vue-highlightable-input.js',
    format: 'es'
  },
};