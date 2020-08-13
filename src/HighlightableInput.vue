<template>
  <div id="hinput" contenteditable="true" />
</template>

<script>
/* eslint-disable vue/require-default-prop */
/* eslint-disable no-empty */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-sequences */
var tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}

import IntervalTree from 'node-interval-tree'
import debounce from 'lodash/debounce'
import isUndefined from 'lodash/isUndefined'

export default {
  props: {
    highlight: Array,
    value: String,
    highlightStyle: {
      type: [String, Object],
      default: 'background-color:yellow'
    },
    highlightEnabled: {
      type: Boolean,
      default: true
    },
    highlightDelay: {
      type: Number,
      default: 500 // This is milliseconds
    },
    caseSensitive: {
      type: Boolean,
      default: false
    },
    fireOn: {
      type: String,
      default: 'keydown'
    },
    fireOnEnabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      internalValue: '',
      htmlOutput: '',
      debouncedHandler: null,
      inputing: false
    }
  },

  watch: {

    highlightStyle() {
      this.processHighlights()
    },

    highlight() {
      this.processHighlights()
    },

    value() {
      if (this.internalValue != this.value) {
        this.internalValue = this.value
        this.processHighlights()
      }
    },

    highlightEnabled() {
      this.processHighlights()
    },

    caseSensitive() {
      this.processHighlights()
    },

    htmlOutput() {
      var selection = this.saveSelection(this.$el)
      this.$el.innerHTML = this.htmlOutput
      this.restoreSelection(this.$el, selection)
    }
  },
  mounted() {
    if (this.fireOnEnabled) { this.$el.addEventListener(this.fireOn, this.handleChange) }
    this.internalValue = this.value
    this.processHighlights()

    const _this = this
    document.getElementById('hinput').addEventListener('compositionstart', function(e) {
      _this.inputing = true
    }, false)

    document.getElementById('hinput').addEventListener('compositionend', function(e) {
      _this.inputing = false
    }, false)
  },

  methods: {

    handleChange() {
      const _this = this
      this.debouncedHandler = debounce(function() {
        if (!_this.inputing) {
          if (this.internalValue !== this.$el.textContent) {
            this.internalValue = this.$el.textContent
            this.processHighlights()
          }
        }
      }, this.highlightDelay)
      this.debouncedHandler()
    },

    processHighlights() {
      if (!this.highlightEnabled) {
        this.htmlOutput = this.internalValue
        this.$emit('input', this.internalValue)
        return
      }

      var intervalTree = new IntervalTree()
      // Find the position ranges of the text to highlight
      var highlightPositions = []
      var sortedHighlights = this.normalizedHighlights()
      if (!sortedHighlights) { return }

      for (var i = 0; i < sortedHighlights.length; i++) {
        var highlightObj = sortedHighlights[i]

        var indices = []
        if (highlightObj.text) {
          if (typeof (highlightObj.text) === 'string') {
            indices = this.getIndicesOf(highlightObj.text, this.internalValue, isUndefined(highlightObj.caseSensitive) ? this.caseSensitive : highlightObj.caseSensitive)
            indices.forEach(start => {
              var end = start + highlightObj.text.length - 1
              this.insertRange(start, end, highlightObj, intervalTree)
            })
          }

          if (Object.prototype.toString.call(highlightObj.text) === '[object RegExp]') {
            indices = this.getRegexIndices(highlightObj.text, this.internalValue)
            indices.forEach(pair => {
              this.insertRange(pair.start, pair.end, highlightObj, intervalTree)
            })
          }
        }

        if (highlightObj.start != undefined && highlightObj.end != undefined && highlightObj.start < highlightObj.end) {
          var start = highlightObj.start
          var end = highlightObj.end - 1
          this.insertRange(start, end, highlightObj, intervalTree)
        }
      }

      highlightPositions = intervalTree.search(0, this.internalValue.length)
      highlightPositions = highlightPositions.sort((a, b) => a.start - b.start)

      // Construct the output with styled spans around the highlight text
      var result = ''
      var startingPosition = 0
      for (var k = 0; k < highlightPositions.length; k++) {
        var position = highlightPositions[k]
        result += this.safe_tags_replace(this.internalValue.substring(startingPosition, position.start))
        result += "<span style='" + highlightPositions[k].style + "'>" + this.safe_tags_replace(this.internalValue.substring(position.start, position.end + 1)) + '</span>'
        startingPosition = position.end + 1
      }

      // In case we exited the loop early
      if (startingPosition < this.internalValue.length) { result += this.safe_tags_replace(this.internalValue.substring(startingPosition, this.internalValue.length)) }

      // Stupid firefox bug
      if (result[result.length - 1] == ' ') {
        result = result.substring(0, result.length - 1)
        result += '&nbsp;'
      }

      this.htmlOutput = result
      this.$emit('input', this.internalValue)
    },

    insertRange(start, end, highlightObj, intervalTree) {
      var overlap = intervalTree.search(start, end)
      var maxLengthOverlap = overlap.reduce((max, o) => { return Math.max(o.end - o.start, max) }, 0)
      if (overlap.length == 0) {
        intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style })
      } else if ((end - start) > maxLengthOverlap) {
        overlap.forEach(o => {
          intervalTree.remove(o.start, o.end, o)
        })
        intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style })
      }
    },

    normalizedHighlights() {
      if (this.highlight == null) { return null }

      if (Object.prototype.toString.call(this.highlight) === '[object RegExp]' || typeof (this.highlight) === 'string') { return [{ text: this.highlight }] }

      if (Object.prototype.toString.call(this.highlight) === '[object Array]' && this.highlight.length > 0) {
        var globalDefaultStyle = typeof (this.highlightStyle) === 'string' ? this.highlightStyle : (Object.keys(this.highlightStyle).map(key => key + ':' + this.highlightStyle[key]).join(';') + ';')

        var regExpHighlights = this.highlight.filter(x => x == Object.prototype.toString.call(x) === '[object RegExp]')
        var nonRegExpHighlights = this.highlight.filter(x => x == Object.prototype.toString.call(x) !== '[object RegExp]')
        return nonRegExpHighlights.map(h => {
          if (h.text || typeof (h) === 'string') {
            return {
              text: h.text || h,
              style: h.style || globalDefaultStyle,
              caseSensitive: h.caseSensitive
            }
          } else if (h.start != undefined && h.end != undefined) {
            return {
              style: h.style || globalDefaultStyle,
              start: h.start,
              end: h.end,
              caseSensitive: h.caseSensitive
            }
          } else {
            console.error('Please provide a valid highlight object or string')
          }
        }).sort((a, b) => (a.text && b.text) ? a.text > b.text : ((a.start == b.start ? (a.end < b.end) : (a.start < b.start)))).concat(regExpHighlights)
        // We sort here in ascending order because we want to find highlights for the smaller strings first
        // and then override them later with any overlapping larger strings. So for example:
        // if we have highlights: g and gg and the string "sup gg" should have only "gg" highlighted.
        // RegExp highlights are not sorted and simply concated (this could be done better  in the future)
      }

      console.error('Expected a string or an array of strings')
      return null
    },

    // Copied from: https://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    safe_tags_replace(str) {
      return str.replace(/[&<>]/g, this.replaceTag)
    },

    replaceTag(tag) {
      return tagsToReplace[tag] || tag
    },

    getRegexIndices(regex, str) {
      if (!regex.global) {
        console.error('Expected ' + regex + ' to be global')
        return []
      }

      regex = RegExp(regex)
      var indices = []
      var match = null
      while ((match = regex.exec(str)) != null) {
        indices.push({ start: match.index, end: match.index + match[0].length - 1 })
      }
      return indices
    },

    // Copied verbatim because I'm lazy:
    // https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
    getIndicesOf(searchStr, str, caseSensitive) {
      var searchStrLen = searchStr.length
      if (searchStrLen == 0) {
        return []
      }
      var startIndex = 0; var index; var indices = []
      if (!caseSensitive) {
        str = str.toLowerCase()
        searchStr = searchStr.toLowerCase()
      }
      while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index)
        startIndex = index + searchStrLen
      }
      return indices
    },

    // Copied but modifed slightly from: https://stackoverflow.com/questions/14636218/jquery-convert-text-url-to-link-as-typing/14637351#14637351
    saveSelection(containerEl) {
      var start
      if (window.getSelection && document.createRange) {
        var selection = window.getSelection()
        if (!selection || selection.rangeCount == 0) { return }
        var range = selection.getRangeAt(0)
        var preSelectionRange = range.cloneRange()
        preSelectionRange.selectNodeContents(containerEl)
        preSelectionRange.setEnd(range.startContainer, range.startOffset)
        start = preSelectionRange.toString().length

        return {
          start: start,
          end: start + range.toString().length
        }
      } else if (document.selection) {
        var selectedTextRange = document.selection.createRange()
        var preSelectionTextRange = document.body.createTextRange()
        preSelectionTextRange.moveToElementText(containerEl)
        preSelectionTextRange.setEndPoint('EndToStart', selectedTextRange)
        start = preSelectionTextRange.text.length

        return {
          start: start,
          end: start + selectedTextRange.text.length
        }
      }
    },

    // Copied but modifed slightly from: https://stackoverflow.com/questions/14636218/jquery-convert-text-url-to-link-as-typing/14637351#14637351
    restoreSelection(containerEl, savedSel) {
      if (!savedSel) { return }

      if (window.getSelection && document.createRange) {
        var charIndex = 0; var range = document.createRange()
        range.setStart(containerEl, 0)
        range.collapse(true)
        var nodeStack = [containerEl]; var node; var foundStart = false; var stop = false

        while (!stop && (node = nodeStack.pop())) {
          if (node.nodeType == 3) {
            var nextCharIndex = charIndex + node.length
            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
              range.setStart(node, savedSel.start - charIndex)
              foundStart = true
            }
            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
              range.setEnd(node, savedSel.end - charIndex)
              stop = true
            }
            charIndex = nextCharIndex
          } else {
            var i = node.childNodes.length
            while (i--) {
              nodeStack.push(node.childNodes[i])
            }
          }
        }

        var sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
      } else if (document.selection) {
        var textRange = document.body.createTextRange()
        textRange.moveToElementText(containerEl)
        textRange.collapse(true)
        textRange.moveEnd('character', savedSel.end)
        textRange.moveStart('character', savedSel.start)
        textRange.select()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div {
  min-height: 50px;
}

</style>
