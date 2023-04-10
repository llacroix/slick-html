import {normalizer} from 'slick-html/parser';


test('normalizer', () => {
  expect(normalizer(['abc'], []))
    .toStrictEqual(['a', 'b', 'c'])

  expect(normalizer(['abc'], [1]))
    .toStrictEqual(['a', 'b', 'c', 1])

  expect(normalizer(['abc', 'def'], [1]))
    .toStrictEqual(['a', 'b', 'c', 1, 'd', 'e', 'f'])
})
