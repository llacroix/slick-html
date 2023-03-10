import {take_until_quoted, take_one, take_until, take_while, take_until_cb} from './parsing.js'
import {Element, Tag, TextNode, Attribute, ParamNode, ParamRef} from './objects.js';

class StopParse {
}

function parse_tag(data) {
    /*
     * Parse a tag while being relatively flexible
     * about having spaces in front of it or it being
     * a self closing element.
     */
    let _, name

    [_, data] = take_while(data, [' ']);
    [name, data] = take_until(data, [' ', '>', '/']);

    return [new Tag(name), data];
}

function parse_attribute(data) {
    let _, name, value, quote_char

    // glob any space in front of the attribute
    [_, data] = take_while(data, [' ']);
    // name is defined by any consecutive token without spaces
    [name, data] = take_until(data, [' ', '=']);
    
    // glob any spaces until next token
    [_, data] = take_while(data, [' ']);

    // If an attribute is in the form of A=B
    if (data[0] == '=') {
      [_, data] = take_one(data);

      // if the attribute is in the form of
      // A="B" do not glob the quotes
      if (["'", '"'].indexOf(data[0]) >= 0) {
        // Parse quoted attributes
        [quote_char, data] = take_one(data);
        // glob anything until next unquoted char
        // 'abc' or "abc"
        [value, data] = take_until_quoted(data, quote_char);
        [quote_char, data] = take_one(data);
      } else {
        // Otherwise parse anything until the next space.
        [value, data] = take_until(data, [' ', '>']);
      }
    } else {
      // If the attribute is in the form of A default
      // to an empty value
      value = ['']
    }

    let attr = new Attribute(name, value);

    return [attr, data];
}

function parse_attributes(data) {
    // Parse attributes
    let attributes = []
    let attribute

    // while parse as many attributes as long as it doesn't
    // reach a closing tag with > or /
    while (data.length > 0) {
        if (data[0] == '>' || data[0] == '/') {
            break
        }

        [attribute, data] = parse_attribute(data);

        attributes.push(attribute);
    }

    return [attributes, data]
}

function parse_element(data) {
  /*
   * Parse an HTMLElement.
   *
   * An html elements that can be parsed have the following
   * forms.
   *
   *    <TAG></TAG> OR <TAG/>
   *
   * Each Element can have zero or multiple attributes in the
   * following form. And each attributes are separated by spaces.
   *
   *     ATT
   *     ATT=VAL
   *     ATT="VAL"
   *     ATT='VAL'
   *
   * Then an Element may have zero or multiple children elements.
   * Each of the children follow the same rules as the element
   * itself being parsed.
   *
   * In other words an HTML element may look like this:
   *
   *     <ATT>CHILD1 CHILD2 ... CHILDN</ATT>
   *
   * And also any of the part of the HTML element may be a parameter
   * being passed to the template.
   *
   * In other words, a very complex element may look like this:
   *
   * <${widget}
   *  ${custom_attribute}
   *  visible=${visible}
   *  ${style_attribute}=${style_value}
   *  click=${(event) => this.onclick(event)}
   *  >${main_element} ${sub_elements.map((sub) => ...}</${widget}>
   *
   *
   */
    let _, tag, tag2, nodes

    [_, data] = take_one(data);
    [tag, data] = parse_tag(data);

    [_, data] = take_while(data, [' ']);

    // Tag already closed
    let attributes = [];
    if (['>', '/'].indexOf(data[0]) < 0) {
        [attributes, data] = parse_attributes(data);
        // skip spaces then closing tag
        [_, data] = take_while(data, [' ']);
    } else {
        attributes = [];
    }

    // if the closing tag reach after the attributes is
    // a self closing elements, we do not parse sub elements.
    if (data[0] == '/') {
      [_, data] = take_while(data, ['/']);
      [_, data] = take_while(data, ['>']);

      nodes = []
    } else {
      // otherwise we parse all the sub elements using parse_nodes
      [_, data] = take_while(data, ['>']);

      // Parse Nodes
      [nodes, data] = parse_nodes(data);

      // Then we parse the next closing tag as the one being currently
      // parsed. In practice the closing tag is ignored as we already
      // parsed it at the start. Since we're trying to parse valid
      // XML data and not SGML, if there are missing closing tags, it
      // will fail to parse properly.
      [_, data] = take_while(data, ['<', '/']);
      [tag2, data] = parse_tag(data);
      [_, data] = take_while(data, [' ']);
      [_, data] = take_while(data, ['>']);
    }

    let elem = new Element(
        tag,
        attributes,
        nodes
    );

    return [elem, data];
}

function parse_text_node(data) {
    let text
    [text, data] = take_until_cb(
      data,
      (value) => {
        if (typeof value == 'object') {
          return !(value instanceof ParamRef)
        } else {
          return value != '<'
        }
      }
    );
    return [new TextNode(text), data];
}

function parse_param_node(data) {
  /*
   * ParseExactly one ParamNode
   */
  let param

  // ParamNode only match one Param
  [param, data] = take_one(data);

  return [new ParamNode(param), data]
}

function parse_node(data) {
    /*
     * Parse possible type of nodes.
     *
     * 1. ParamNode is parsed when the current token is a ParamRef
     * 2. Element if the current token is an opening tag <
     * 3. Anything else is parsed as a TextNode
     */
    if (data[0] instanceof ParamRef) {
      return parse_param_node(data)
    } else if (data[0] == '<') {
        if (data[1] == '/') {
            throw new StopParse()
        }
        return parse_element(data)
    } else {
        return parse_text_node(data)
    }
}

function parse_nodes(data) {
    /*
     * Parse as many nodes as possible. It's possible
     * the html parser doesn't require nodes to have a
     * single root element.
     */
    let nodes = []
    let node
    while (data.length > 0) {
        try {
            [node, data] = parse_node(data);
            nodes.push(node);
        }
        catch(exc) {
          if (exc instanceof StopParse) {
            break
          } else {
            throw exc
          }
        }
    }

    return [nodes, data]
}

export function parse_html(data) {
    /*
     * Mainly parse all nodes like parse_nodes
     */
    let nodes
    [nodes, data] = parse_nodes(data);
    return nodes;
}
