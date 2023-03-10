import {h, normalizer} from './parser.js';

class SuperComponent extends HTMLElement{
  
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'})
    this.nodes = []

    this.request_update()
  }

  update() {
    let template = this.render()

    this.nodes.forEach((node) => {
      this.root.removeChild(node)
    });

    this.nodes = template.render()

    this.nodes.forEach((node) => {
      this.root.appendChild(node)
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
    this.rows = []
    this.input_type = "input"
    this.is_checked = "checked"
  }

  add_row() {
    this.rows.push('abc')
    this.is_checked = this.is_checked == 'checked' ? 'unchecked' : 'checked'
    this.request_update()
  }

  onchange_selection(evt) {
    this.input_type = evt.target.value
    this.request_update()
  }

  render() {
    let attribute = "checked"

    let some_elem = document.createTextNode('Add Row!')

    return h`
    <div>
      <div class="title"><h1>${this.title}</h1></div>
      <div class="body">
        <input type="checkbox" ${this.is_checked} />
        <select change=${(event) => this.onchange_selection(event)} >
          <option>Select A Value</option>
          <option value="input">Input</option>
          <option value="textarea">TextArea</option>
        </select>
        <${this.input_type}></${this.input_type}>
        ${this.content}
        <button click=${(event) => this.add_row()}>${some_elem}</button>
        <div class="rows">
        ${this.rows.map((row) => h`<div class="row">${row}</div>`)}
        </div>
      </div>
    </div>
    `;
  }
}


export function main() {
  window.customElements.define('c-1', Component)
}
