import {sum} from 'slick-html';


test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});


class Param {
  constructor(pos) {
    this.pos = pos
  }
}

test('complex', () => {
  expect({a: {b: new Param(new Param(2))}}).toStrictEqual({a: {b: new Param(new Param(2))}})
})
