import {normalizer} from 'slick-html/parser';
import {parse_html} from 'slick-html/html_parser.js';
import {TextNode, ParamRef, ParamNode, Element, Tag, Attribute} from 'slick-html/objects.js';

test('parse_html TextNode', () => {

  expect(parse_html(
    normalizer(['abc'], [])
  )).toStrictEqual(
    [
      new TextNode(['abc'])
    ]
  )

  expect(parse_html(
    normalizer(['abc '], [])
  )).toStrictEqual(
    [
      new TextNode(['abc '])
    ]
  )

  expect(parse_html(
    normalizer(['abc', 'def'], [1])
  )).toStrictEqual(
    [
      new TextNode(['abc', 1, 'def']),
    ]
  )

  expect(parse_html(
    normalizer(['abc', 'def'], [new ParamRef(0)])
  )).toStrictEqual(
    [
      new TextNode(['abc']),
      new ParamNode(new ParamRef(0)),
      new TextNode(['def']),
    ]
  )


})

test('parse_html Element', () => {

  expect(parse_html(
    normalizer(['<div />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            [""]
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =b />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["b"]
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  = b />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["b"]
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =   b />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["b"]
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =   />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            []
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =  "abc" />'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["abc"]
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =  "abc"></div>'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["abc"]
          )
        ],
        []
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =  "abc"> </div>'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["abc"]
          )
        ],
        [
          new TextNode([" "])
        ]
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div a  =  "abc"> <div /> </div>'], [])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
          new Attribute(
            ["a"],
            ["abc"]
          )
        ],
        [
          new TextNode([" "]),
          new Element(
            new Tag(['div']),
            [],
            []
          ),
          new TextNode([" "])
        ]
      )
    ]
  )

  expect(parse_html(
    normalizer(['<div >', '</div>'], [new ParamRef(0)])
  )).toStrictEqual(
    [
      new Element(
        new Tag(['div']),
        [
        ],
        [
          new ParamNode(new ParamRef(0))
        ]
      )
    ]
  )
})
