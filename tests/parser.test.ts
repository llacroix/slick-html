import {describe, expect, test} from '@jest/globals';
import {normalizer} from 'slick-html/parser';
import {testing} from 'slick-html/pp';

test('normalizer', () => {
    testing();
    normalizer(["abc"], []);
})
