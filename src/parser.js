import {parse_html} from './html_parser.js';
import {Template, Param, ParamList} from './objects.js';

export function normalizer(template, params) {
    return template.map((val, idx, lst) => {
      let values = val.split('')

      if (idx < params.length) {
        values.push(params[idx])
      }

      return values
    }).reduce((acc, value) => {
      return acc.concat(value)
    })
}


let existing_templates = {}


export function h() {
  let params = Array.from(arguments)

  let template_params = params.slice(1).map(
    (param, idx) => {
      if (param instanceof Array) {
        return new ParamList(idx, param)
      } else {
        return new Param(idx, param)
      }
    }
  );

  let template_string = params[0].join('~~~')

  if (!existing_templates[template_string]) {
    let result = normalizer(
      params[0],
      template_params.map((par) => par.ref())
    );
    let nodes = parse_html(result);
    let template = new Template(nodes);
    existing_templates[template_string] = template;
  }

  let cur_template = existing_templates[template_string].proxy(template_params)
  // cur_template.update(template_params)
  return cur_template
}
