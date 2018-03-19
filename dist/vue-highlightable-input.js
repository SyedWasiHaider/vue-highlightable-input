var HighlightableInput = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"contenteditable":"true"}})},staticRenderFns: [],_scopeId: 'data-v-7f284282',
  name: 'HighlightInput',
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
    this.$el.addEventListener("input", this.handleChange);
  },

  watch: {

    highlight() {
      this.processHighlights();
    },

    value() {
      this.internalValue = this.value;
      this.processHighlights();
    },

    highlightEnabled () {
      this.processHighlights();
    },

    htmlOutput() {
      var selection = this.saveSelection(this.$el);
      this.$el.innerHTML = this.htmlOutput;
      this.restoreSelection(this.$el, selection);
    }
  },
  methods: {

    handleChange(){
      if (this.internalValue !== this.$el.innerText){
        this.internalValue = this.$el.innerText;
        this.processHighlights();
      }
    },

    processHighlights()
    {
        if (!this.highlightEnabled)
        {
          this.htmlOutput = this.internalValue;
          this.$emit('input', this.internalValue);
          return;
        }

        // Find the positin ranges of the text to highlight
        var highlightPositions = [];
        var sortedHighlights = this.normalizedHighlights();
        if (!sortedHighlights)
          return;
        
        for (var i = 0; i < sortedHighlights.length; i++){
          var highlightObj = sortedHighlights[i];
          var indices = this.getIndicesOf(highlightObj.text, this.internalValue);
          if (indices.length == 0) continue;
          indices.forEach(index => 
          {
            if (highlightPositions[index] != -1){
              highlightPositions[index] = { style: highlightObj.style, end: index+highlightObj.text.length}; 
            
              // Fill in everything between the range to -1 to avoid overlapping ranges
              for (var b = index+1; b < highlightPositions[index].end; b++){
                highlightPositions[b] = -1;
              }

              // Look back and fill in any previous ranges that overlap with the current one
              for (b = index+1; b > this.internalValue.length; b--){
                if (highlightPositions[b].start == highlightPositions[index].start || highlightPositions[b].end >= highlightPositions[index].start)
                  highlightPositions[b] = -1;
              } 
            }
          });
        }
        
        // Javascript ugliness to get rid of any undefined values
        // Also we're sorting the range
        highlightPositions = Object.keys(highlightPositions).map(x => { 
            if (x != undefined && highlightPositions[x] != -1)
              return {start: parseInt(x), end: highlightPositions[x].end, style: highlightPositions[x].style}
          }).filter(x => x != undefined).sort((a,b) => a.start-b.start);

        // Construct the output with styled spans around the highlight text
        var result = '';
        var startingPosition = 0;
        for (var k = 0; k < highlightPositions.length; k++){
            var position = highlightPositions[k];
            result += this.internalValue.substring(startingPosition, position.start);
            result += "<span style='" + (highlightPositions[k].style || this.highlightStyle || 'background-color:yellow') + "'>" + this.internalValue.substring(position.start, position.end) + "</span>";
            startingPosition = position.end;
        }

        // In case we exited the loop early
        if (startingPosition < this.internalValue.length)
          result += this.internalValue.substring(startingPosition, this.internalValue.length);

        this.htmlOutput = result;
        this.$emit('input', this.internalValue);
    },

    normalizedHighlights () {
      if (this.highlight == null)
        return null;

      if (typeof(this.highlight) == "string")
        return [{text: this.highlight}]
      
      if (Object.prototype.toString.call(this.highlight) === '[object Array]' && this.highlight.length > 0){
        return this.highlight.map(h => {
          return {
            text:  typeof(h) == "string" ? h : h.text,
            style:  h.style || this.highlightStyle
          }
        }).sort((a,b) => a.text > b.text) 
        // We sort here in ascending order because we want to find highlights for the smaller strings first
        // and then override them later with any overlapping larger strings. So for example:
        // if we have highlights: g and gg and the string "sup gg" should have only "gg" highlighted.
      }

      console.error("Expected a string or an array of strings");
      return null
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

export default HighlightableInput;
