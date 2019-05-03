var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var shallowequal = function shallowEqual(objA, objB, compare, compareContext) {

    var ret = compare ? compare.call(compareContext, objA, objB) : void 0;

    if(ret !== void 0) {
        return !!ret;
    }

    if(objA === objB) {
        return true;
    }

    if(typeof objA !== 'object' || !objA ||
       typeof objB !== 'object' || !objB) {
        return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if(keysA.length !== keysB.length) {
        return false;
    }

    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

    // Test for A's keys different from B.
    for(var idx = 0; idx < keysA.length; idx++) {

        var key = keysA[idx];

        if(!bHasOwnProperty(key)) {
            return false;
        }

        var valueA = objA[key];
        var valueB = objB[key];

        ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;

        if(ret === false ||
           ret === void 0 && valueA !== valueB) {
            return false;
        }

    }

    return true;

};

var lib = createCommonjsModule(function (module, exports) {
// An augmented AVL Tree where each node maintains a list of records and their search intervals.
// Record is composed of an interval and its underlying data, sent by a client. This allows the
// interval tree to have the same interval inserted multiple times, as long its data is different.
// Both insertion and deletion require O(log n) time. Searching requires O(k*logn) time, where `k`
// is the number of intervals in the output list.
Object.defineProperty(exports, "__esModule", { value: true });

function height(node) {
    if (node === undefined) {
        return -1;
    }
    else {
        return node.height;
    }
}
var Node = /** @class */ (function () {
    function Node(intervalTree, record) {
        this.intervalTree = intervalTree;
        this.records = [];
        this.height = 0;
        this.key = record.low;
        this.max = record.high;
        // Save the array of all records with the same key for this node
        this.records.push(record);
    }
    // Gets the highest record.high value for this node
    Node.prototype.getNodeHigh = function () {
        var high = this.records[0].high;
        for (var i = 1; i < this.records.length; i++) {
            if (this.records[i].high > high) {
                high = this.records[i].high;
            }
        }
        return high;
    };
    // Updates height value of the node. Called during insertion, rebalance, removal
    Node.prototype.updateHeight = function () {
        this.height = Math.max(height(this.left), height(this.right)) + 1;
    };
    // Updates the max value of all the parents after inserting into already existing node, as well as
    // removing the node completely or removing the record of an already existing node. Starts with
    // the parent of an affected node and bubbles up to root
    Node.prototype.updateMaxOfParents = function () {
        if (this === undefined) {
            return;
        }
        var thisHigh = this.getNodeHigh();
        if (this.left !== undefined && this.right !== undefined) {
            this.max = Math.max(Math.max(this.left.max, this.right.max), thisHigh);
        }
        else if (this.left !== undefined && this.right === undefined) {
            this.max = Math.max(this.left.max, thisHigh);
        }
        else if (this.left === undefined && this.right !== undefined) {
            this.max = Math.max(this.right.max, thisHigh);
        }
        else {
            this.max = thisHigh;
        }
        if (this.parent) {
            this.parent.updateMaxOfParents();
        }
    };
    /*
    Left-Left case:
  
           z                                      y
          / \                                   /   \
         y   T4      Right Rotate (z)          x     z
        / \          - - - - - - - - ->       / \   / \
       x   T3                                T1 T2 T3 T4
      / \
    T1   T2
  
    Left-Right case:
  
         z                               z                           x
        / \                             / \                        /   \
       y   T4  Left Rotate (y)         x  T4  Right Rotate(z)     y     z
      / \      - - - - - - - - ->     / \      - - - - - - - ->  / \   / \
    T1   x                           y  T3                      T1 T2 T3 T4
        / \                         / \
      T2   T3                      T1 T2
    */
    // Handles Left-Left case and Left-Right case after rebalancing AVL tree
    Node.prototype._updateMaxAfterRightRotate = function () {
        var parent = this.parent;
        var left = parent.left;
        // Update max of left sibling (x in first case, y in second)
        var thisParentLeftHigh = left.getNodeHigh();
        if (left.left === undefined && left.right !== undefined) {
            left.max = Math.max(thisParentLeftHigh, left.right.max);
        }
        else if (left.left !== undefined && left.right === undefined) {
            left.max = Math.max(thisParentLeftHigh, left.left.max);
        }
        else if (left.left === undefined && left.right === undefined) {
            left.max = thisParentLeftHigh;
        }
        else {
            left.max = Math.max(Math.max(left.left.max, left.right.max), thisParentLeftHigh);
        }
        // Update max of itself (z)
        var thisHigh = this.getNodeHigh();
        if (this.left === undefined && this.right !== undefined) {
            this.max = Math.max(thisHigh, this.right.max);
        }
        else if (this.left !== undefined && this.right === undefined) {
            this.max = Math.max(thisHigh, this.left.max);
        }
        else if (this.left === undefined && this.right === undefined) {
            this.max = thisHigh;
        }
        else {
            this.max = Math.max(Math.max(this.left.max, this.right.max), thisHigh);
        }
        // Update max of parent (y in first case, x in second)
        parent.max = Math.max(Math.max(parent.left.max, parent.right.max), parent.getNodeHigh());
    };
    /*
    Right-Right case:
  
      z                               y
     / \                            /   \
    T1  y     Left Rotate(z)       z     x
       / \   - - - - - - - ->     / \   / \
      T2  x                      T1 T2 T3 T4
         / \
        T3 T4
  
    Right-Left case:
  
       z                            z                            x
      / \                          / \                         /   \
     T1  y   Right Rotate (y)     T1  x      Left Rotate(z)   z     y
        / \  - - - - - - - - ->      / \   - - - - - - - ->  / \   / \
       x  T4                        T2  y                   T1 T2 T3 T4
      / \                              / \
    T2   T3                           T3 T4
    */
    // Handles Right-Right case and Right-Left case in rebalancing AVL tree
    Node.prototype._updateMaxAfterLeftRotate = function () {
        var parent = this.parent;
        var right = parent.right;
        // Update max of right sibling (x in first case, y in second)
        var thisParentRightHigh = right.getNodeHigh();
        if (right.left === undefined && right.right !== undefined) {
            right.max = Math.max(thisParentRightHigh, right.right.max);
        }
        else if (right.left !== undefined && right.right === undefined) {
            right.max = Math.max(thisParentRightHigh, right.left.max);
        }
        else if (right.left === undefined && right.right === undefined) {
            right.max = thisParentRightHigh;
        }
        else {
            right.max = Math.max(Math.max(right.left.max, right.right.max), thisParentRightHigh);
        }
        // Update max of itself (z)
        var thisHigh = this.getNodeHigh();
        if (this.left === undefined && this.right !== undefined) {
            this.max = Math.max(thisHigh, this.right.max);
        }
        else if (this.left !== undefined && this.right === undefined) {
            this.max = Math.max(thisHigh, this.left.max);
        }
        else if (this.left === undefined && this.right === undefined) {
            this.max = thisHigh;
        }
        else {
            this.max = Math.max(Math.max(this.left.max, this.right.max), thisHigh);
        }
        // Update max of parent (y in first case, x in second)
        parent.max = Math.max(Math.max(parent.left.max, right.max), parent.getNodeHigh());
    };
    Node.prototype._leftRotate = function () {
        var rightChild = this.right;
        rightChild.parent = this.parent;
        if (rightChild.parent === undefined) {
            this.intervalTree.root = rightChild;
        }
        else {
            if (rightChild.parent.left === this) {
                rightChild.parent.left = rightChild;
            }
            else if (rightChild.parent.right === this) {
                rightChild.parent.right = rightChild;
            }
        }
        this.right = rightChild.left;
        if (this.right !== undefined) {
            this.right.parent = this;
        }
        rightChild.left = this;
        this.parent = rightChild;
        this.updateHeight();
        rightChild.updateHeight();
    };
    Node.prototype._rightRotate = function () {
        var leftChild = this.left;
        leftChild.parent = this.parent;
        if (leftChild.parent === undefined) {
            this.intervalTree.root = leftChild;
        }
        else {
            if (leftChild.parent.left === this) {
                leftChild.parent.left = leftChild;
            }
            else if (leftChild.parent.right === this) {
                leftChild.parent.right = leftChild;
            }
        }
        this.left = leftChild.right;
        if (this.left !== undefined) {
            this.left.parent = this;
        }
        leftChild.right = this;
        this.parent = leftChild;
        this.updateHeight();
        leftChild.updateHeight();
    };
    // Rebalances the tree if the height value between two nodes of the same parent is greater than
    // two. There are 4 cases that can happen which are outlined in the graphics above
    Node.prototype._rebalance = function () {
        if (height(this.left) >= 2 + height(this.right)) {
            var left = this.left;
            if (height(left.left) >= height(left.right)) {
                // Left-Left case
                this._rightRotate();
                this._updateMaxAfterRightRotate();
            }
            else {
                // Left-Right case
                left._leftRotate();
                this._rightRotate();
                this._updateMaxAfterRightRotate();
            }
        }
        else if (height(this.right) >= 2 + height(this.left)) {
            var right = this.right;
            if (height(right.right) >= height(right.left)) {
                // Right-Right case
                this._leftRotate();
                this._updateMaxAfterLeftRotate();
            }
            else {
                // Right-Left case
                right._rightRotate();
                this._leftRotate();
                this._updateMaxAfterLeftRotate();
            }
        }
    };
    Node.prototype.insert = function (record) {
        if (record.low < this.key) {
            // Insert into left subtree
            if (this.left === undefined) {
                this.left = new Node(this.intervalTree, record);
                this.left.parent = this;
            }
            else {
                this.left.insert(record);
            }
        }
        else {
            // Insert into right subtree
            if (this.right === undefined) {
                this.right = new Node(this.intervalTree, record);
                this.right.parent = this;
            }
            else {
                this.right.insert(record);
            }
        }
        // Update the max value of this ancestor if needed
        if (this.max < record.high) {
            this.max = record.high;
        }
        // Update height of each node
        this.updateHeight();
        // Rebalance the tree to ensure all operations are executed in O(logn) time. This is especially
        // important in searching, as the tree has a high chance of degenerating without the rebalancing
        this._rebalance();
    };
    Node.prototype._getOverlappingRecords = function (currentNode, low, high) {
        if (currentNode.key <= high && low <= currentNode.getNodeHigh()) {
            // Nodes are overlapping, check if individual records in the node are overlapping
            var tempResults = [];
            for (var i = 0; i < currentNode.records.length; i++) {
                if (currentNode.records[i].high >= low) {
                    tempResults.push(currentNode.records[i]);
                }
            }
            return tempResults;
        }
        return [];
    };
    Node.prototype.search = function (low, high) {
        // Don't search nodes that don't exist
        if (this === undefined) {
            return [];
        }
        var leftSearch = [];
        var ownSearch = [];
        var rightSearch = [];
        // If interval is to the right of the rightmost point of any interval in this node and all its
        // children, there won't be any matches
        if (low > this.max) {
            return [];
        }
        // Search left children
        if (this.left !== undefined && this.left.max >= low) {
            leftSearch = this.left.search(low, high);
        }
        // Check this node
        ownSearch = this._getOverlappingRecords(this, low, high);
        // If interval is to the left of the start of this interval, then it can't be in any child to
        // the right
        if (high < this.key) {
            return leftSearch.concat(ownSearch);
        }
        // Otherwise, search right children
        if (this.right !== undefined) {
            rightSearch = this.right.search(low, high);
        }
        // Return accumulated results, if any
        return leftSearch.concat(ownSearch, rightSearch);
    };
    // Searches for a node by a `key` value
    Node.prototype.searchExisting = function (low) {
        if (this === undefined) {
            return undefined;
        }
        if (this.key === low) {
            return this;
        }
        else if (low < this.key) {
            if (this.left !== undefined) {
                return this.left.searchExisting(low);
            }
        }
        else {
            if (this.right !== undefined) {
                return this.right.searchExisting(low);
            }
        }
        return undefined;
    };
    // Returns the smallest node of the subtree
    Node.prototype._minValue = function () {
        if (this.left === undefined) {
            return this;
        }
        else {
            return this.left._minValue();
        }
    };
    Node.prototype.remove = function (node) {
        var parent = this.parent;
        if (node.key < this.key) {
            // Node to be removed is on the left side
            if (this.left !== undefined) {
                return this.left.remove(node);
            }
            else {
                return undefined;
            }
        }
        else if (node.key > this.key) {
            // Node to be removed is on the right side
            if (this.right !== undefined) {
                return this.right.remove(node);
            }
            else {
                return undefined;
            }
        }
        else {
            if (this.left !== undefined && this.right !== undefined) {
                // Node has two children
                var minValue = this.right._minValue();
                this.key = minValue.key;
                this.records = minValue.records;
                return this.right.remove(this);
            }
            else if (parent.left === this) {
                // One child or no child case on left side
                if (this.right !== undefined) {
                    parent.left = this.right;
                    this.right.parent = parent;
                }
                else {
                    parent.left = this.left;
                    if (this.left !== undefined) {
                        this.left.parent = parent;
                    }
                }
                parent.updateMaxOfParents();
                parent.updateHeight();
                parent._rebalance();
                return this;
            }
            else if (parent.right === this) {
                // One child or no child case on right side
                if (this.right !== undefined) {
                    parent.right = this.right;
                    this.right.parent = parent;
                }
                else {
                    parent.right = this.left;
                    if (this.left !== undefined) {
                        this.left.parent = parent;
                    }
                }
                parent.updateMaxOfParents();
                parent.updateHeight();
                parent._rebalance();
                return this;
            }
        }
    };
    return Node;
}());
exports.Node = Node;
var IntervalTree = /** @class */ (function () {
    function IntervalTree() {
        this.count = 0;
    }
    IntervalTree.prototype.insert = function (record) {
        if (record.low > record.high) {
            throw new Error('`low` value must be lower or equal to `high` value');
        }
        if (this.root === undefined) {
            // Base case: Tree is empty, new node becomes root
            this.root = new Node(this, record);
            this.count++;
            return true;
        }
        else {
            // Otherwise, check if node already exists with the same key
            var node = this.root.searchExisting(record.low);
            if (node !== undefined) {
                // Check the records in this node if there already is the one with same low, high, data
                for (var i = 0; i < node.records.length; i++) {
                    if (shallowequal(node.records[i], record)) {
                        // This record is same as the one we're trying to insert; return false to indicate
                        // nothing has been inserted
                        return false;
                    }
                }
                // Add the record to the node
                node.records.push(record);
                // Update max of the node and its parents if necessary
                if (record.high > node.max) {
                    node.max = record.high;
                    if (node.parent) {
                        node.parent.updateMaxOfParents();
                    }
                }
                this.count++;
                return true;
            }
            else {
                // Node with this key doesn't already exist. Call insert function on root's node
                this.root.insert(record);
                this.count++;
                return true;
            }
        }
    };
    IntervalTree.prototype.search = function (low, high) {
        if (this.root === undefined) {
            // Tree is empty; return empty array
            return [];
        }
        else {
            return this.root.search(low, high);
        }
    };
    IntervalTree.prototype.remove = function (record) {
        if (this.root === undefined) {
            // Tree is empty; nothing to remove
            return false;
        }
        else {
            var node = this.root.searchExisting(record.low);
            if (node === undefined) {
                return false;
            }
            else if (node.records.length > 1) {
                var removedRecord = void 0;
                // Node with this key has 2 or more records. Find the one we need and remove it
                for (var i = 0; i < node.records.length; i++) {
                    if (shallowequal(node.records[i], record)) {
                        removedRecord = node.records[i];
                        node.records.splice(i, 1);
                        break;
                    }
                }
                if (removedRecord) {
                    removedRecord = undefined;
                    // Update max of that node and its parents if necessary
                    if (record.high === node.max) {
                        var nodeHigh = node.getNodeHigh();
                        if (node.left !== undefined && node.right !== undefined) {
                            node.max = Math.max(Math.max(node.left.max, node.right.max), nodeHigh);
                        }
                        else if (node.left !== undefined && node.right === undefined) {
                            node.max = Math.max(node.left.max, nodeHigh);
                        }
                        else if (node.left === undefined && node.right !== undefined) {
                            node.max = Math.max(node.right.max, nodeHigh);
                        }
                        else {
                            node.max = nodeHigh;
                        }
                        if (node.parent) {
                            node.parent.updateMaxOfParents();
                        }
                    }
                    this.count--;
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (node.records.length === 1) {
                // Node with this key has only 1 record. Check if the remaining record in this node is
                // actually the one we want to remove
                if (shallowequal(node.records[0], record)) {
                    // The remaining record is the one we want to remove. Remove the whole node from the tree
                    if (this.root.key === node.key) {
                        // We're removing the root element. Create a dummy node that will temporarily take
                        // root's parent role
                        var rootParent = new Node(this, { low: record.low, high: record.low });
                        rootParent.left = this.root;
                        this.root.parent = rootParent;
                        var removedNode = this.root.remove(node);
                        this.root = rootParent.left;
                        if (this.root !== undefined) {
                            this.root.parent = undefined;
                        }
                        if (removedNode) {
                            removedNode = undefined;
                            this.count--;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        var removedNode = this.root.remove(node);
                        if (removedNode) {
                            removedNode = undefined;
                            this.count--;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                else {
                    // The remaining record is not the one we want to remove
                    return false;
                }
            }
            else {
                // No records at all in this node?! Shouldn't happen
                return false;
            }
        }
    };
    IntervalTree.prototype.inOrder = function () {
        return new InOrder(this.root);
    };
    IntervalTree.prototype.preOrder = function () {
        return new PreOrder(this.root);
    };
    return IntervalTree;
}());
exports.IntervalTree = IntervalTree;
var DataIntervalTree = /** @class */ (function () {
    function DataIntervalTree() {
        this.tree = new IntervalTree();
    }
    DataIntervalTree.prototype.insert = function (low, high, data) {
        return this.tree.insert({ low: low, high: high, data: data });
    };
    DataIntervalTree.prototype.remove = function (low, high, data) {
        return this.tree.remove({ low: low, high: high, data: data });
    };
    DataIntervalTree.prototype.search = function (low, high) {
        return this.tree.search(low, high).map(function (v) { return v.data; });
    };
    DataIntervalTree.prototype.inOrder = function () {
        return this.tree.inOrder();
    };
    DataIntervalTree.prototype.preOrder = function () {
        return this.tree.preOrder();
    };
    Object.defineProperty(DataIntervalTree.prototype, "count", {
        get: function () {
            return this.tree.count;
        },
        enumerable: true,
        configurable: true
    });
    return DataIntervalTree;
}());
exports.default = DataIntervalTree;
var InOrder = /** @class */ (function () {
    function InOrder(startNode) {
        this.stack = [];
        if (startNode !== undefined) {
            this.push(startNode);
        }
    }
    InOrder.prototype.next = function () {
        // Will only happen if stack is empty and pop is called
        if (this.currentNode === undefined) {
            return {
                done: true,
                value: undefined,
            };
        }
        // Process this node
        if (this.i < this.currentNode.records.length) {
            return {
                done: false,
                value: this.currentNode.records[this.i++],
            };
        }
        if (this.currentNode.right !== undefined) {
            this.push(this.currentNode.right);
        }
        else {
            // Might pop the last and set this.currentNode = undefined
            this.pop();
        }
        return this.next();
    };
    InOrder.prototype.push = function (node) {
        this.currentNode = node;
        this.i = 0;
        while (this.currentNode.left !== undefined) {
            this.stack.push(this.currentNode);
            this.currentNode = this.currentNode.left;
        }
    };
    InOrder.prototype.pop = function () {
        this.currentNode = this.stack.pop();
        this.i = 0;
    };
    return InOrder;
}());
exports.InOrder = InOrder;
if (typeof Symbol === 'function') {
    InOrder.prototype[Symbol.iterator] = function () { return this; };
}
var PreOrder = /** @class */ (function () {
    function PreOrder(startNode) {
        this.stack = [];
        this.i = 0;
        this.currentNode = startNode;
    }
    PreOrder.prototype.next = function () {
        // Will only happen if stack is empty and pop is called,
        // which only happens if there is no right node (i.e we are done)
        if (this.currentNode === undefined) {
            return {
                done: true,
                value: undefined,
            };
        }
        // Process this node
        if (this.i < this.currentNode.records.length) {
            return {
                done: false,
                value: this.currentNode.records[this.i++],
            };
        }
        if (this.currentNode.right !== undefined) {
            this.push(this.currentNode.right);
        }
        if (this.currentNode.left !== undefined) {
            this.push(this.currentNode.left);
        }
        this.pop();
        return this.next();
    };
    PreOrder.prototype.push = function (node) {
        this.stack.push(node);
    };
    PreOrder.prototype.pop = function () {
        this.currentNode = this.stack.pop();
        this.i = 0;
    };
    return PreOrder;
}());
exports.PreOrder = PreOrder;
if (typeof Symbol === 'function') {
    PreOrder.prototype[Symbol.iterator] = function () { return this; };
}

});

var IntervalTree = unwrapExports(lib);
var lib_1 = lib.Node;
var lib_2 = lib.IntervalTree;
var lib_3 = lib.InOrder;
var lib_4 = lib.PreOrder;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return _root.Date.now();
};

var now_1 = now;

/** Built-in value references. */
var Symbol$1 = _root.Symbol;

var _Symbol = Symbol$1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol_1(value)) {
    return NAN;
  }
  if (isObject_1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject_1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber_1(wait) || 0;
  if (isObject_1(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber_1(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now_1();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now_1());
  }

  function debounced() {
    var time = now_1(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var debounce_1 = debounce;

/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 *
 * _.isUndefined(null);
 * // => false
 */
function isUndefined(value) {
  return value === undefined;
}

var isUndefined_1 = isUndefined;

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

var HighlightableInput = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"contenteditable":"true"}})},staticRenderFns: [],_scopeId: 'data-v-7f284282',
  props: {
    highlight: Array,
    value: String,
    highlightStyle: {
      type : [String, Object],
      default:  'background-color:yellow'
    },
    highlightEnabled: {
      type: Boolean,
      default: true
    },
    highlightDelay: {
      type: Number,
      default: 500 //This is milliseconds
    },
    caseSensitive: {
      type: Boolean,
      default: false
    },
    fireOn : {
      type: String,
      default: 'keydown'
    },
    fireOnEnabled : {
      type: Boolean,
      default: true
    }
  },
  data() { 
    return {
      internalValue: '',
      htmlOutput: '',
      debouncedHandler: null
    } 
  },
  mounted () {
      if (this.fireOnEnabled)
        this.$el.addEventListener(this.fireOn, this.handleChange);
      this.internalValue = this.value;
      this.processHighlights();
  },

  watch: {

    highlightStyle(){
      this.processHighlights();
    },

    highlight() {
      this.processHighlights();
    },

    value() {
      if (this.internalValue != this.value){
        this.internalValue = this.value;
        this.processHighlights();
      }
    },

    highlightEnabled () {
      this.processHighlights();
    },

    caseSensitive () {
      this.processHighlights();
    },

    htmlOutput() {
      var selection = this.saveSelection(this.$el);
      this.$el.innerHTML = this.htmlOutput;
      this.restoreSelection(this.$el, selection);
    }
  },
  
  methods: {

    handleChange() {
      this.debouncedHandler = debounce_1(function(){
      if (this.internalValue !== this.$el.textContent){
        this.internalValue = this.$el.textContent;
        this.processHighlights();
      }
      }, this.highlightDelay);
      this.debouncedHandler();
    },

    processHighlights()
    {
        if (!this.highlightEnabled)
        {
          this.htmlOutput = this.internalValue;
          this.$emit('input', this.internalValue);
          return;
        }

        var intervalTree = new IntervalTree();
        // Find the position ranges of the text to highlight
        var highlightPositions = [];
        var sortedHighlights = this.normalizedHighlights();
        if (!sortedHighlights)
          return;
        
        for (var i = 0; i < sortedHighlights.length; i++){
          var highlightObj = sortedHighlights[i];

          var indices = [];
          if (highlightObj.text)
          {
            if (typeof(highlightObj.text) == "string"){
              indices = this.getIndicesOf(highlightObj.text, this.internalValue, isUndefined_1(highlightObj.caseSensitive) ? this.caseSensitive : highlightObj.caseSensitive);
              indices.forEach(start => 
              {
                var end = start+highlightObj.text.length - 1;
                this.insertRange(start, end, highlightObj, intervalTree);
              });
            }

            if (Object.prototype.toString.call(highlightObj.text) === '[object RegExp]'){
              indices = this.getRegexIndices(highlightObj.text, this.internalValue);
              indices.forEach(pair => 
              {
                this.insertRange(pair.start, pair.end, highlightObj, intervalTree);
              });
            }
          }


          if (highlightObj.start!=undefined && highlightObj.end!=undefined && highlightObj.start < highlightObj.end){
            var start = highlightObj.start;
            var end = highlightObj.end - 1;
            this.insertRange(start, end, highlightObj, intervalTree);
          }
        }
        
        highlightPositions = intervalTree.search(0, this.internalValue.length);
        highlightPositions = highlightPositions.sort((a,b) => a.start-b.start);

        // Construct the output with styled spans around the highlight text
        var result = '';
        var startingPosition = 0;
        for (var k = 0; k < highlightPositions.length; k++){
            var position = highlightPositions[k];
            result += this.safe_tags_replace(this.internalValue.substring(startingPosition, position.start));
            result += "<span style='" + highlightPositions[k].style + "'>" + this.safe_tags_replace(this.internalValue.substring(position.start, position.end + 1)) + "</span>";
            startingPosition = position.end + 1;
        }

        // In case we exited the loop early
        if (startingPosition < this.internalValue.length)
          result += this.safe_tags_replace(this.internalValue.substring(startingPosition, this.internalValue.length));

        // Stupid firefox bug
        if (result[result.length-1] == ' '){
          result = result.substring(0, result.length-1);
          result += '&nbsp;';
        }

        this.htmlOutput = result;
        this.$emit('input', this.internalValue);
    },

    insertRange(start, end, highlightObj, intervalTree){
            var overlap = intervalTree.search(start, end);
            var maxLengthOverlap = overlap.reduce((max, o) => { return Math.max(o.end-o.start, max) }, 0);
            if (overlap.length == 0){
              intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style} );
            }
            else if ((end - start) > maxLengthOverlap)
            {
              overlap.forEach(o => {
                intervalTree.remove(o.start, o.end, o);
              });
              intervalTree.insert(start, end, { start: start, end: end, style: highlightObj.style} );
            }
    },

    normalizedHighlights () {
      if (this.highlight == null)
        return null;

      if (Object.prototype.toString.call(this.highlight) === '[object RegExp]' || typeof(this.highlight) == "string")
        return [{text: this.highlight}]
      
      if (Object.prototype.toString.call(this.highlight) === '[object Array]' && this.highlight.length > 0){

        var globalDefaultStyle = typeof(this.highlightStyle) == 'string' ? this.highlightStyle : (Object.keys(this.highlightStyle).map(key => key + ':' + this.highlightStyle[key]).join(';') + ';');
        
        var regExpHighlights = this.highlight.filter(x => x == Object.prototype.toString.call(x) === '[object RegExp]');
        var nonRegExpHighlights = this.highlight.filter(x => x == Object.prototype.toString.call(x) !== '[object RegExp]');
        return nonRegExpHighlights.map(h => {
          if (h.text || typeof(h) == "string") {
            return {
              text:   h.text || h,
              style:  h.style || globalDefaultStyle,
              caseSensitive: h.caseSensitive
            }
          }else if (h.start!=undefined && h.end!=undefined) {
             return {
              style:  h.style || globalDefaultStyle,
              start: h.start,
              end:   h.end,
              caseSensitive: h.caseSensitive
            }
          }
          else {
            console.error("Please provide a valid highlight object or string");
          }
        }).sort((a,b) => (a.text && b.text) ? a.text > b.text : ((a.start == b.start ? (a.end < b.end) : (a.start < b.start)))).concat(regExpHighlights) 
        // We sort here in ascending order because we want to find highlights for the smaller strings first
        // and then override them later with any overlapping larger strings. So for example:
        // if we have highlights: g and gg and the string "sup gg" should have only "gg" highlighted.
        // RegExp highlights are not sorted and simply concated (this could be done better  in the future)
      }

      console.error("Expected a string or an array of strings");
      return null
    },

    // Copied from: https://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    safe_tags_replace(str) {
        return str.replace(/[&<>]/g, this.replaceTag);
    },

    replaceTag(tag) {
        return tagsToReplace[tag] || tag;
    },

    getRegexIndices(regex, str) {
        if (!regex.global){
          console.error("Expected " + regex + " to be global");
          return []
        }
        
        regex = RegExp(regex);
        var indices = [];
        var match = null;
        while ((match = regex.exec(str)) != null) {
            indices.push({start:match.index, end: match.index + match[0].length - 1});
        }
        return indices;
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
          var selection = window.getSelection();
          if (!selection || selection.rangeCount == 0)
            return
          var range = selection.getRangeAt(0);
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

          if (!savedSel)
            return

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
