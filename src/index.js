import {h, normalizer} from './parser.js';

class SuperComponent extends HTMLElement{
  
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'})
    this._template = null;
    this.nodes = []
    // this.cache = new Map()

    this.request_init_update()
  }

  update() {
    // update params for template
    let template = this.render()

    /*
    this.nodes.forEach((node) => {
      this.root.removeChild(node)
    });
    */

    this._template.update(template.params)

    /*
    this.nodes = this._template.render()

    this.nodes.forEach((node) => {
      this.root.appendChild(node)
    })
    */
  }

  request_init_update() {
    window.requestAnimationFrame(() => {
      this._template = this.render()
      this.nodes = this._template.render()
      this.nodes.forEach((node) => {
        node.forEach(node => {
          this.root.appendChild(node)
        })
      })
      // this.update()
    })
  }

  request_update() {
    window.requestAnimationFrame(() => {
      this.update()
    })
  }
}

class Component extends SuperComponent {
  constructor() {
    super();
    this.title = this.getAttribute('title')
    this.content = 'ty';
    this.rows = ["hey"]
    this.input_type = "input"
    this.is_checked = "checked"
    this.type = "text"
  }

  add_row() {
    this.rows.push('abc' + this.rows.length)
    this.is_checked = this.is_checked == 'checked' ? 'unchecked' : 'checked'
    this.type = this.type == 'text' ? 'date' : 'text'
    this.request_update()
  }

  onchange_selection(evt) {
    this.input_type = evt.target.value
    this.request_update()
  }

  remove_row(idx) {
    // let index = this.rows.indexOf(row)
    // this.rows.splice(idx, 1)
    this.rows = this.rows.slice(0, idx).concat(this.rows.slice(idx+1))
    this.request_update()
  }

  render() {
    let some_elem = document.createTextNode('Add Row!')

    return h`
    <style>
      @import '/static/index.css';      

      .block {
        display: block; 
        padding: 1em;
        border: 1px solid;
        margin: 1em;
      }

      .rows .odd {
        background-color: #ccc;
      }

      .rows .even {
        background-color: #aaa;
      }

      .rows .row {
        display: flex;
      }
      .rows .row  * {
        flex: 1;
      }
    </style>
    <div class="block">
      <div class="title">
        <h1><input type=${this.type} /></h1>
        <h2>${this.title}</h2>
      </div>
      <div class="content">
        <input type="checkbox" ${this.is_checked} />
        <select change=${(event) => this.onchange_selection(event)} >
          <option>Select A Value</option>
          <option value="input">Input</option>
          <option value="textarea">TextArea</option>
        </select>
        <${this.input_type}></${this.input_type}>
        ${this.content}
        <div class="rows">
        ${this.rows.map((row, idx) => h`
          <div class="row ${idx % 2 == 0 ? 'odd': 'even'}">
            <div>${row}</div>
            <input type="text" />
            <button click=${(event) => this.remove_row(idx)}>Remove</button>
          </div>
          `
        )}
        </div>
        <button click=${(event) => this.add_row()}>${some_elem}</button>

      </div>
    </div>
    `;
  }
}


export function main() {
  window.customElements.define('c-1', Component)
}
