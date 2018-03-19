# Vue Highlightable Input
Highlight specific words as you're typing. 

![alt demo](https://github.com/SyedWasiHaider/vue-highlightable-input/blob/master/doc/demo.gif)
[Try it yourself](http://historical-hen.surge.sh/)

# Install

(Broken at the moment. Use dist directly.)
```sh
npm install vue-highlightable-input --save
```

# Usage

#### In your template add this:

```html
<highlightable-input 
  highlight-style="background-color:red"
  :highlight-enabled="highlightEnabled" 
  :highlight="highlight" 
  v-model="mytext"
/>
```

#### In your component add this:
```javascript
import HighlightableInput from "vue-highlightable-input"
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
```
### Why make this?

* Because I was bored and had a similar problem at work
* Because I know nothing about web development
* Because it looks cool!

License
----

MIT