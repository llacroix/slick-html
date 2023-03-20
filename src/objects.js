import {get_node_range, remove_nodes} from './html_utils.js'

function reprl(value) {
    return value.map((v) => str(v)).join("")
}

export class Template {
  constructor(nodes) {
    this.nodes = nodes
  }

  proxy(params) {
    return new TemplateCache(this, params)
    //return new TemplateCache(this, this.params.map((param) => param.clone()))
    /*
    return new Template(
      this.nodes.map((node) => node.clone()),
      this.params.map((param) => param.clone())
    )
    */
  }


  render(params, cache) {
    return this.nodes.map(node => node.render(params, cache))
  }

}

export class TemplateCache {
  constructor(template, params) {
    this.template = template
    this.params = params
    this.cache = new WeakMap()
  }

  isEqualTo(other) {
    if (this.template != other.template)
      return false

    let index = 0

    for (let param of this.params) {
      if (!param.isEqualTo(other.params[index])) {
        return false
      }
      index += 1;
    }

    return true
  }

  to_dom() {
    let nodes = this.render(this.params, this.cache)
    let fragment = document.createDocumentFragment()
    for (let node of nodes) {
      fragment.appendChild(node)
    }
    return fragment
  }

  render() {
    return this.template.render(this.params, this.cache)
    /*
    return this.nodes.map((node) => {
      let result = node.render(this.params, cache)
      return result 
    })
    */
  }

  update(params) {
    params.forEach((v, idx) => {
      if (v instanceof Param) {
        this.params[idx].update(v.value)
      } else {
        this.params[idx].update(v)
      }
    })
  }
}

export class ParamRef {
  constructor(position) {
    this.position = position
  }

  render(params, cache) {
    let value = this.get_value(params)
    return value.render(params, cache)
  }

  render_string(params, cache) {
    let value = this.get_value(params)
    return value.render_string(params, cache)
  }

  get_value(params) {
    return params[this.position]
  }

  clone() {
    return new ParamRef(this.position);
  }
}

export class Param {
    constructor(position, value) {
        this.position = position
        this.value = value
    }

    isEqualTo(other) {
      return this.checkEquality(this.value, other.value)
    }

    checkEquality (a, b) {
      if (typeof a != typeof b) {
        return false
      }

      if (Object.getPrototypeOf(a) != Object.getPrototypeOf(b)) {
        return false
      }

      if (a instanceof TemplateCache) {
        return a.isEqualTo(b)
      }

      if (a instanceof Param) {
        return a.isEqualTo(b)
      }

      if (a instanceof Function) {
        return a.toString() == b.toString()
      }

      return a == b
    }

    ref() {
      return new ParamRef(this.position)
    }

    clone() {
      return new Param(this.position, this.value);
    }

    update(val) {
      let new_value = val
      let old_value = this.value
      this.value = new_value;

      if (this.onchange) {
        this.onchange(new_value, old_value)
      }
    }

    toString() {
      return this.value
    }

    render(params, cache) {
      let value = this.value

      if (value.nodeType == 3 || value instanceof HTMLElement) {
        return [
          value
        ]
      } 

      return [
        document.createTextNode(this.toString())
      ]
    }

    render_string(params) {
      return render_string(this.value, params)
    }
}

export class ParamList extends Param {
  clone() {
    return new ParamList(this.position, this.value)
  }

  update(val) {
    let old_vals = this.value.slice()
    let new_vals = val
    let result = []

    let changed = old_vals.length != new_vals.length

    let val_changes = 0;

    for (let val of new_vals) {
      let index = this.findEqualIndex(old_vals, val)
      if (index >= 0) {
        let old_val = old_vals.splice(index, 1)[0];
        
        if (old_val instanceof TemplateCache) {
          old_val.update(val.params)
        }

        result.push(old_val)
      } else {
        changed = true
        result.push(val)
      }
    }

    this.value = result

    if (changed) {
      let start = this.result.start
      let end = this.result.end


      // cleanup elements
      remove_nodes(get_node_range(start, end))

      let data = []

      // reapply values from their rendered results
      for (let val of this.value) {
        if (!this.result.results.has(val)) {
          this.result.results.set(
            val,
            val.render(this.result.params, new Map())
          )
        }

        let nodes = this.result.results.get(val)

        data = [
          ...data,
          ...nodes.flat()
        ]
      }

      let parentElement = end.parentElement

      for (let node of data) {
        parentElement.insertBefore(node, end)
      }

    }
  }

  findEqualIndex(lst, val) {
    let index = 0

    for (let elem of lst) {
      if (this.checkEquality(elem, val)) {
        return index
      }
      index += 1;
    }

    return -1
  }

  render(params, cache) {
    let result = {
      start: document.createTextNode(""),
      end: document.createTextNode(""),
      params: params,
      results: new WeakMap()
    }

    result.nodes = this.value.map(val => {
      let nodes = val.render(params, cache)
      result.results.set(val, nodes)
      return nodes
    })

    cache.set(this, result)
    this.result = result

    return [
      result.start,
      ...result.nodes.flat().flat(),
      result.end
    ]
  }

  onchange(newvalue, oldvalue) {
  }
}

export class Tag {
    constructor(value) {
        this.value = value
    }

    clone() {
      return new Tag(this.value.slice(0))
    }

    to_dom() {
      return this.value.join("")
    }

    render(params, cache) {
      return this.value.reduce((acc, val) => {
        if (val instanceof ParamRef) {
          return acc + val.render_string(params, cache);
        } else {
          return acc + val;
        }
      }, "");
    }
}

export class Element {
    constructor(name, attributes, children) {
        this.name = name
        this.attributes = attributes
        this.children = children
    }

    clone() {
      let name = this.name.clone()
      let attributes = this.attributes.map((att) => att.clone())
      let children = this.children.map((child) => child.clone())
      return new Element(name, attributes, children)
    }

    render(params, cache) {
      const EVENT_ATTRIBUTES = [
        "click",
        "change",
      ];

      let tag = this.name.render(params, cache)
      let elem = document.createElement(tag)

      for (let attribute of this.attributes) {
        let name = attribute.render_name(params, cache)

        if (EVENT_ATTRIBUTES.indexOf(name) >= 0) {
          let callable = attribute.get_callable(params)
          elem.addEventListener(
            name,
            callable,
          );

          // TODO redo using cache
          attribute.value[0].onchange = ((callable) => {
            return () => {
              elem.removeEventListener(name, callable)     
              elem.addEventListener(
                attribute.render_name(params, cache),
                attribute.get_callable(params)
              )
            }
          })(elem, name, attribute, callable)

        } else {
          let value = attribute.render_value(params, cache)
          
          let bound_params = attribute.bound_params(params)

          // TODO make a more generic way to bind changes to callbacks
          // by trying to keep previous value and next value.
          function callback(elem, attribute) {
            return () => {
              let name = attribute.render_name(params, cache)
              let value = attribute.render_value(params, cache)
              elem.setAttribute(name, value)
            }
          }

          // define some callback to update attributes based on name/value
          // if any of the bound params does get updated.
          bound_params.forEach((param) => {
            param.onchange = callback(elem, attribute)
          })

          elem.setAttribute(name, value);
        }
      }

      for (let child of this.children) {
        let sub = child.render(params, cache)
        for (let el of sub) {
          elem.appendChild(el)
        }
      }

      return [elem]
    }
}

function render_string(value, params) {
  if (typeof value == "string") {
    return value
  }
  return value.reduce((acc, val) => {
    if (val instanceof ParamRef) {
      return acc + val.render_string(params)
    } else {
      return acc + val
    }
  }, "");
}

export class Attribute {
    constructor (name, value) {
        this.name = name
        this.value = value
        this.node = null
    }

    clone() {
      return new Attribute(
        this.name.slice(0),
        this.value.slice(0)
      )
    }

    bound_params(params) {
      return this.value.concat(this.name)
              .filter(val => val instanceof ParamRef)
              .map(ref => ref.get_value(params))
    }

    render_name(params) {
      return render_string(this.name, params)
    }

    render_value(params) {
      return render_string(this.value, params)
    }

    get_callable(params) {
      let ref = this.value[0]
      let value = ref.get_value(params)
      return value.value
    }

    render(params, cache) {
        let name = render_string(this.name, params, cache)
        let value = render_string(this.value, params, cache)
        let attribute = document.createAttribute(name)
        attribute.value = value
        return attribute
    }

    /*
    to_dom() {
      let name = this.name.join("")
      let value = this.value.join("")
      let attribute = document.createAttribute(name)

      attribute.value = value

      this.node = attribute

      return this.node
    }
    */
}

export class TextNode {
    constructor(value) {
        this.value = value 
    }

    clone() {
      return new TextNode(
        this.value.slice(0)
      )
    }

    render(params, cache) {
      let result = this.value.join("")
      return [
        document.createTextNode(result)
      ]
    }
}

export class ParamNode {
  constructor(data) {
    this.data = data
  }

  clone() {
    return new ParamNode(this.data.clone())
  }

  /*
  render(params, cache) {
    let result = this.data.render(params, cache)
    return result
  }
  */

  render(params, cache) {
    let value = this.data.get_value(params)

    return value.render(params, cache)

    // Refactor params to contain concrete values
    // by pre mapping them when template is created
    // or have different type of params like
    //
    // ArrayParam
    // StringParam
    // ...
    // 
    // All of those should implement a simple render interface.
    let values = (
      value.value instanceof Array
      ? value.value
      : [value.value]
    );

    let start_node = document.createTextNode("")
    let end_node = document.createTextNode("")
    let res_nodes = [start_node]

    // refactor to avoid looping 
    for (let elem of values) {
      let node

      // text node
      if (elem.nodeType == 3 || elem instanceof HTMLElement) {
        node = elem;

        res_nodes.push(elem)
      } else if (elem instanceof TemplateCache) {
        let nodes = elem.render();
        node = document.createDocumentFragment()
        nodes.forEach((nod) => node.appendChild(nod))
        res_nodes = [...res_nodes, ...nodes]
      } else {
        node = document.createTextNode(elem.toString());
        res_nodes.push(node)
      }
    }

    res_nodes.push(end_node)

    function callback(value) {
      return () => {
      }
    }

    if (value.value instanceof Array) {
      value.onchange = callback(value)
    }

    // value.onchange = callback(values
    let root = document.createDocumentFragment()
    res_nodes.forEach(node => root.appendChild(node))

    return root
  }
}
