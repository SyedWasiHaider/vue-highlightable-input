<template>
  <div contenteditable="true">
  </div>
</template>

<script>

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

import IntervalTree from 'node-interval-tree'

export default {
  props: {
    highlight: Array,
    value: String,
    highlightStyle: String,
    highlightEnabled: {
      default: true,
      type: Boolean
    }
  },
  data() { 
    return {
      internalValue: '',
      htmlOutput: ''
    } 
  },
  mounted () {
    this.$el.addEventListener("input", this.handleChange)
  },

  watch: {

    highlight() {
      this.processHighlights()
    },

    value() {
      if (this.internalValue != this.value){
        this.processHighlights()
      }
    },

    highlightEnabled () {
      this.processHighlights()
    },

    htmlOutput() {
      var selection = this.saveSelection(this.$el)
      this.$el.innerHTML = this.htmlOutput
      this.restoreSelection(this.$el, selection)
    }
  },
  methods: {

    handleChange(){
      if (this.internalValue !== this.$el.innerText){
        this.internalValue = this.$el.innerText
        this.processHighlights();
      }
    },

    processHighlights()
    {
        if (!this.highlightEnabled)
        {
          this.htmlOutput = this.internalValue;
          this.$emit('input', this.internalValue)
          return;
        }

        var intervalTree = new IntervalTree()
        // Find the position ranges of the text to highlight
        var highlightPositions = []
        var sortedHighlights = this.normalizedHighlights();
        if (!sortedHighlights)
          return;
        
        for (var i = 0; i < sortedHighlights.length; i++){
          var highlightObj = sortedHighlights[i]

          var indices = []
          if (highlightObj.text)
            indices = this.getIndicesOf(highlightObj.text, this.internalValue)

          indices.forEach(start => 
          {
            var end = start+highlightObj.text.length - 1;
            var overlap = intervalTree.search(start, end);
            var maxLengthOverlap = overlap.reduce((max, o) => { return Math.max(o.end-o.start, max) }, 0)
            if (overlap.length == 0){
              intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style} )
            }
            else if ((end - start) > maxLengthOverlap)
            {
              overlap.forEach(o => {
                intervalTree.remove(o.start, o.end, o)
              })
              intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style} )
            }
          })

          if (highlightObj.start && highlightObj.end && highlightObj.start < highlightObj.end){
            var start = highlightObj.start;
            var end = highlightObj.end - 1;
            var overlap = intervalTree.search(highlightObj.start, highlightObj.end);
            var maxLengthOverlap = overlap.reduce((max, o) => { return Math.max(o.end-o.start, max) }, 0)
            if (overlap.length == 0){
              intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style} )
            }
            else if ((end - start) > maxLengthOverlap)
            {
              overlap.forEach(o => {
                intervalTree.remove(o.start, o.end, o)
              })
              intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style} )
            }
          }
        }
        
        highlightPositions = intervalTree.search(0, this.internalValue.length)
        highlightPositions = highlightPositions.sort((a,b) => a.start-b.start)

        // Construct the output with styled spans around the highlight text
        var result = ''
        var startingPosition = 0
        for (var k = 0; k < highlightPositions.length; k++){
            var position = highlightPositions[k]
            result += this.safe_tags_replace(this.internalValue.substring(startingPosition, position.start))
            result += "<span style='" + (highlightPositions[k].style || this.highlightStyle || 'background-color:yellow') + "'>" + this.safe_tags_replace(this.internalValue.substring(position.start, position.end + 1)) + "</span>"
            startingPosition = position.end + 1
        }

        // In case we exited the loop early
        if (startingPosition < this.internalValue.length)
          result += this.safe_tags_replace(this.internalValue.substring(startingPosition, this.internalValue.length))

        this.htmlOutput = result
        this.$emit('input', this.internalValue)
    },

    normalizedHighlights () {
      if (this.highlight == null)
        return null;

      if (typeof(this.highlight) == "string")
        return [{text: this.highlight}]
      
      if (Object.prototype.toString.call(this.highlight) === '[object Array]' && this.highlight.length > 0){
        return this.highlight.map(h => {
          if (h.text || (typeof(h) == "string")) {
            return {
              text:   h.text || h,
              style:  h.style || this.highlightStyle,
            }
          }else if (h.start && h.end) {
             return {
              style:  h.style || this.highlightStyle,
              start: h.start,
              end:   h.end
            }
          }
          else {
            console.error("Please provide a valid highlight object or string")
          }
        }).sort((a,b) => (a.text && b.text) ? a.text > b.text : ((a.start == b.start ? (a.end < b.end) : (a.start < b.start)))) 
        // We sort here in ascending order because we want to find highlights for the smaller strings first
        // and then override them later with any overlapping larger strings. So for example:
        // if we have highlights: g and gg and the string "sup gg" should have only "gg" highlighted.
      }

      console.error("Expected a string or an array of strings")
      return null
    },

    // Copied from: https://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    safe_tags_replace(str) {
        return str.replace(/[&<>]/g, this.replaceTag);
    },

    replaceTag(tag) {
        return tagsToReplace[tag] || tag;
    },

    // Copied verbatim because I'm lazy:
    // https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
    getIndicesOf(searchStr, str, caseSensitive) {
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    },
    
    // Copied but modifed slightly from: https://stackoverflow.com/questions/14636218/jquery-convert-text-url-to-link-as-typing/14637351#14637351
    saveSelection(containerEl){
       var start;
      if (window.getSelection && document.createRange) {
          var range = window.getSelection().getRangeAt(0);
          var preSelectionRange = range.cloneRange();
          preSelectionRange.selectNodeContents(containerEl);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          start = preSelectionRange.toString().length;

          return {
              start: start,
              end: start + range.toString().length
          }
      } else if (document.selection) {
          var selectedTextRange = document.selection.createRange();
          var preSelectionTextRange = document.body.createTextRange();
          preSelectionTextRange.moveToElementText(containerEl);
          preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
          start = preSelectionTextRange.text.length;

          return {
              start: start,
              end: start + selectedTextRange.text.length
            }
          }
      },

      // Copied but modifed slightly from: https://stackoverflow.com/questions/14636218/jquery-convert-text-url-to-link-as-typing/14637351#14637351
      restoreSelection(containerEl, savedSel){
          if (window.getSelection && document.createRange) {
              var charIndex = 0, range = document.createRange();
              range.setStart(containerEl, 0);
              range.collapse(true);
              var nodeStack = [containerEl], node, foundStart = false, stop = false;

              while (!stop && (node = nodeStack.pop())) {
                  if (node.nodeType == 3) {
                      var nextCharIndex = charIndex + node.length;
                      if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                          range.setStart(node, savedSel.start - charIndex);
                          foundStart = true;
                      }
                      if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                          range.setEnd(node, savedSel.end - charIndex);
                          stop = true;
                      }
                      charIndex = nextCharIndex;
                  } else {
                      var i = node.childNodes.length;
                      while (i--) {
                          nodeStack.push(node.childNodes[i]);
                      }
                  }
              }

              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
          } else if (document.selection) {
              var textRange = document.body.createTextRange();
              textRange.moveToElementText(containerEl);
              textRange.collapse(true);
              textRange.moveEnd("character", savedSel.end);
              textRange.moveStart("character", savedSel.start);
              textRange.select();
          }
      }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div {
  height: 50px;
}
</style>
