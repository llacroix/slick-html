Slick-HTML
==========

This is a slick html parser that can generate relatively complex templates.

Here's an example of what it can do:

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


It's possible to use parameters almost anywhere in a template. Here it will use
`this.title` into a H1. Which is a relatively common thing to do.

It's also possible to use template parameters as their own attribute when defined
in the attributes list as shown with `${this.is_checked}`. It is possible to define

This means you can define `checked` attribute on a checkbox without having to hack
something around as html only care about the checked attribute being defined or not.

Here in the more complex example, it is possible to define a full fledging element
base on a parameter in the tag. `<${this.input_type}></${this.input_type}>`. In other
words, You're able to create different attributes based on a widget that you define...

But it's more than just that because you can also mix static content and parameters
to let you build a collection of components.

For example imagine you had a form builder in which you have to define fields based
on a type defined in a JSON data structure or possibly within the element.

Let's imagine we have a custom element called `x-field` that can be defined as such:

    <x-field name="my_field"></x-field>

What's not quite evident here is that the field doesn't have an actual way to describe
how it's supposed to be rendered.

In this case, lets imagine that you have a form specification that looks like this:

    {
        fields: {
            name: {
                type: 'text',
                widget: 'input'
            },
            description: {
                type: 'text',
                widget: 'text'
            }
        }
    }

When building our form, we could try to build it as such:

   <x-form>
    <x-field name="name"></x-field>
    <x-field name="description"></x-field>
   </x-form>


But in order to switch between different widget, it's rather complicated if you can't
define the element directly in a template.

For example, lit-element simply doesn't allow it and if you ever try to do that, you'd
have to manually append an html element that you create with `createElement`. That's
the simplest way to achieve this.

With this library the render method for the `x-field` could be as simple as this:

    render() {
        // match x-widget-input / x-widget-text or anything defined
        return h`<x-widget-${this.type}></x-widget-${this.type}>`
    }
