![icon](https://github.com/SyedWasiHaider/vue-highlightable-input/blob/master/doc/icon.png)

# Vue Highlightable Input
Highlight specific words as you're typing. 

![alt demo](https://github.com/SyedWasiHaider/vue-highlightable-input/blob/master/doc/demo.gif)
[Try it yourself](http://historical-hen.surge.sh/)

# Install

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

### Props

| Name       | Type     | Default   | Description       |  Reactive
| ---        | ---      | ---       | ---               |  ---
| highlight      | String or Array   | null       | The string or list of words to highlight. This can be a single string value or you can do an array of strings or array of [**Highlight Objects**](https://github.com/SyedWasiHaider/vue-highlightable-input#highlight-object).  | Yes |
| highlightEnabled  | Boolean   | true        | If true, will highlight the text | Yes |
| value | String   | null        | Raw text value | Yes
| highlightStyle  | null  | false     | If no style is provided for text, this will act as the global styling for the highlight. | No (TODO)

#### Highlight Object
```javascript
{
    text:'chicken', 
    style:"background-color:#f37373"
}
```

### Events

| Name       | Description
| ---        | ---      |
| @input     | Just like a regular input html element you can use this to react to input events

Note, that you can also you `v-model`

### Some notes

* This is not meant to be used for large scale text highlight because of how inefficient div contentEditable is and also the fact the algorithm I'm using is stupidly inefficient (try entering like a lot of text for highlighting)
* Good use cases for this are something like what wit.ai does (they probably have a more efficient algorithm though) for highlighting recognized entities on the fly.
* Let me know what other use cases you might have!

### Why make this?

* I liked the way [wit.ai](https://wit.ai/docs/recipes) does highlighting and I wanted to recreate that in Vue.
* Because I was bored and also had a similar problem at work (No, I wasn't bored at work! Quite the opposite actually.)
* Because I still know nothing about web development and I'm still a n00b. Roast me bro.
* Because it looks cool!

### Credits

For the cool highlighter pen icon:
Icons made by [Freepik](http://www.freepik.com) from [Flaticon](https://www.flaticon.com/) is licensed by [Creative Commons BY 3.0](http://creativecommons.org/licenses/by/3.0/) 

License
----

MIT