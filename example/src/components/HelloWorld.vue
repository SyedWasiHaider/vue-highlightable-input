<template>
  <div id="container" class="hello">
    <label> <strong> Try typing Chicken, Noodle, So or Soup </strong> </label>
    <highlightable-input 
      align="left"
      class="myinput" 
      highlight-style="background-color:red" 
      :highlight-enabled="highlightEnabled" 
      :highlight="highlight" v-model="msg"
    />
    <input type="checkbox" id="checkbox" v-model="highlightEnabled">
    <label for="checkbox"> Highlight Enabled? {{ highlightEnabled }}</label>
  </div>
</template>

<script>
import HighlightableInput from "../../../src/HighlightableInput"
export default {
  name: 'HelloWorld',
  components : {
    HighlightableInput
  },
  data() {
    return {
      msg: '',
      highlight: [
        {text:'chicken', style:"background-color:#f37373"},
        {text:'noodle', style:"background-color:#fca88f"},
        {text:'soup', style:"background-color:#bbe4cb"},
        {text:'so', style:"background-color:#fff05e"},
      ],
      highlightEnabled: true
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.myinput {
  height: 40px;
  width: auto;
  margin: 30px;
}

#container {
    width: 640px; /*can be in percentage also.*/
    height: auto;
    margin: 0 auto;
    padding: 10px;
    position: relative;
}

</style>
