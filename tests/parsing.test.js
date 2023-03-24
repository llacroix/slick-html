import {normalizer} from 'slick-html/parser';
import {
  collapse, take_one, take_while, take_until, take_until_quoted, take_until_cb
} from 'slick-html/parsing';


test('take_one', () => {
  expect(take_one(['a','b','c']))
    .toStrictEqual([
      'a',
      ['b', 'c']
    ])

  expect(take_one([1, 'a','b','c']))
    .toStrictEqual([
      1,
      ['a', 'b', 'c']
    ])
})

test('collapse', () => {
  expect(collapse(['a','b','c']))
    .toStrictEqual(['abc'])
})

test('take_while', () => {
  expect(take_while(
    normalizer(['  <test'], []),
    [' ', '<']
  )).toStrictEqual([
    [' ', ' ', '<'],
    ['t', 'e', 's', 't']
  ])

  expect(take_while(
    normalizer(['test'], []),
    [' ', '<']
  )).toStrictEqual([
    [],
    ['t', 'e', 's', 't']
  ])

  expect(take_while(
    normalizer(['  <test'], []),
    [' ']
  )).toStrictEqual([
    [' ', ' '],
    ['<', 't', 'e', 's', 't']
  ])

})

test('take_until', () => {

  expect(take_until(
    normalizer(['    <test> <'], []),
    ['<']
  )).toStrictEqual([
    [' ', ' ', ' ', ' '],
    ['<', 't', 'e', 's', 't', '>', ' ', '<']
  ])

  expect(take_until(
    normalizer(['<test> <'], []),
    ['<']
  )).toStrictEqual([
    [],
    ['<', 't', 'e', 's', 't', '>', ' ', '<']
  ])

  expect(take_until(
    normalizer(['<', '>'], [1]),
    ['>']
  )).toStrictEqual([
    ['<', 1],
    ['>']
  ])

})


test('take_until_quoted', () => {
  expect(take_until_quoted(
    normalizer(['"abc"'], []),
    '"'
  )).toStrictEqual([
    [],
    ['"', 'a', 'b', 'c', '"']
  ])

  expect(take_until_quoted(
    normalizer(['abc"'], []),
    '"'
  )).toStrictEqual([
    ['a', 'b', 'c'],
    ['"']
  ])

  expect(take_until_quoted(
    normalizer(['ab\\"c"'], []),
    '"'
  )).toStrictEqual([
    ['a', 'b', '\\', '"', 'c'],
    ['"']
  ])

})

test('take_until_cb', () => {
  expect(take_until_cb(
    normalizer(['"abc"'], []),
    (chr) => chr != 'b'
  )).toStrictEqual([
    ['"', 'a'],
    ['b', 'c', '"']
  ])

})
