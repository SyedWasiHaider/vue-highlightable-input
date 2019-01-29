![icon](https://github.com/SyedWasiHaider/vue-highlightable-input/blob/master/doc/icon.png)
[![npm version](https://badge.fury.io/js/vue-highlightable-input.svg)](https://badge.fury.io/js/vue-highlightable-input)

# Vue Highlightable Input
Highlight and style specific words as you're typing. 

![alt demo](https://github.com/SyedWasiHaider/vue-highlightable-input/blob/master/doc/demo.gif)
[Try it yourself](https://vue-highlightable-input.surge.sh/)

# Install

```sh
npm install vue-highlightable-input --save
```

# Usage

#### In your template add this:

```html
<highlightable-input 
  highlight-style="background-color:yellow" 
  :highlight-enabled="highlightEnabled" 
  :highlight="highlight" 
  v-model="msg"
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
        "whatever",
        {start: 2, end: 5, style:"background-color:#f330ff"}
      ],
      highlightEnabled: true
    }
  },
}
```

### Props

| Name     | Required  | Type     | Default   | Description       |  Reactive
| ---      | ---   | ---      | ---       | ---               |  ---
| highlight | **Yes**     | String or Array   | null       | The string or list of words to highlight. This can be a single string value, a RegExp or you can do an array of strings or RegExp or array of [**Highlight Objects**](https://github.com/SyedWasiHaider/vue-highlightable-input#highlight-object) or array of [**Range Objects**](https://github.com/SyedWasiHaider/vue-highlightable-input#range-object).  | Yes |
| highlightEnabled  | No     |  Boolean   | true        | If true, will highlight the text | Yes |
| highlightStyle  | No | String or Object  | background-color:yellow     | If no style is provided for text, this will act as the global styling for the highlight. Can also be a dictionary instead of string. | Yes
| highlightDelay  | No | Number  | 500     | Determines how long in milliseconds to wait before processing the highlights. Setting this to a low value is fine for small text but setting it higher may improve performance significantly for larger text | Yes
| caseSensitive  | No | Boolean  | false     | If true, will treat highlight strings with case sensitivity. Can be overrided per highlight object. | Yes
| value | No | String   | null        | Raw text value. | Yes
| fireOn | No | String   | keydown        | The dom event on which the highlight event should be fired. This can be any event that the div content editable can handle. | No (only because the listener is being added in mounted)
| fireOnEnabled | No | Boolean   | true        | If true, will process the highlights on the specified (or default) event. | No (only because the value is used in the mounted function)

#### Highlight Object
```javascript
{
    text:'chicken', // Required
    style:"background-color:#f37373" // Optional
    caseSensitive: true // Optional defaults to False
}
```

#### Range Object
```javascript
{
    start:1, // Required
    end: 9,  // Required
    style:"background-color:#f37373" // Optional
}
```
End must be greater than start. 
The range end is exlusive in other words ==> [start, end)

### Events

| Name       | Description
| ---        | ---      |
| @input     | Just like a regular input html element you can use this to react to input events

Note, that you can also use `v-model`

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
