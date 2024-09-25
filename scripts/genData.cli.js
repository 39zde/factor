import fs from 'node:fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/*
===
MersenneTwister19937 & IbanGenerator are adopted and modified classes from https://github.com/faker-js/faker
This is their license:
===

Faker - Copyright (c) 2022-2024

This software consists of voluntary contributions made by many individuals.
For exact contribution history, see the revision history
available at https://github.com/faker-js/faker

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

===

From: https://github.com/faker-js/faker/commit/a9f98046c7d5eeaabe12fc587024c06d683800b8
To: https://github.com/faker-js/faker/commit/29234378807c4141588861f69421bf20b5ac635e

Based on faker.js, copyright Marak Squires and contributor, what follows below is the original license.

===

faker.js - Copyright (c) 2020
Marak Squires
http://github.com/marak/faker.js/

faker.js was inspired by and has used data definitions from:

 * https://github.com/stympy/faker/ - Copyright (c) 2007-2010 Benjamin Curtis
 * http://search.cpan.org/~jasonk/Data-Faker-0.07/ - Copyright 2004-2005 by Jason Kohles

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
class MersenneTwister19937 {
	N = 624;
	M = 397;
	MATRIX_A = 0x9908b0df;
	UPPER_MASK = 0x80000000;
	LOWER_MASK = 0x7fffffff;
	mt = Array.from({ length: this.N });
	mti = this.N + 1;

	unsigned32(n1) {
		return n1 < 0 ? (n1 ^ this.UPPER_MASK) + this.UPPER_MASK : n1;
	}

	subtraction32(n1, n2) {
		return n1 < n2 ? this.unsigned32((0x100000000 - (n2 - n1)) & 0xffffffff) : n1 - n2;
	}

	addition32(n1, n2) {
		return this.unsigned32((n1 + n2) & 0xffffffff);
	}

	multiplication32(n1, n2) {
		let sum = 0;
		for (let i = 0; i < 32; ++i) {
			if ((n1 >>> i) & 0x1) {
				sum = this.addition32(sum, this.unsigned32(n2 << i));
			}
		}
		return sum;
	}

	initGenrand(seed) {
		this.mt[0] = this.unsigned32(seed & 0xffffffff);
		for (this.mti = 1; this.mti < this.N; this.mti++) {
			this.mt[this.mti] = this.addition32(
				this.multiplication32(1812433253, this.unsigned32(this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30))),
				this.mti
			);
			/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
			/* In the previous versions, MSBs of the seed affect   */
			/* only MSBs of the array mt[].                        */
			/* 2002/01/09 modified by Makoto Matsumoto             */
			this.mt[this.mti] = this.unsigned32(this.mt[this.mti] & 0xffffffff);
		}
	}

	initByArray(initKey, keyLength) {
		this.initGenrand(19650218);
		let i = 1;
		let j = 0;
		let k = this.N > keyLength ? this.N : keyLength;
		for (; k; k--) {
			this.mt[i] = this.addition32(
				this.addition32(
					this.unsigned32(this.mt[i] ^ this.multiplication32(this.unsigned32(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)), 1664525)),
					initKey[j]
				),
				j
			);
			this.mt[i] = this.unsigned32(this.mt[i] & 0xffffffff);
			i++;
			j++;
			if (i >= this.N) {
				this.mt[0] = this.mt[this.N - 1];
				i = 1;
			}
			if (j >= keyLength) {
				j = 0;
			}
		}
		for (k = this.N - 1; k; k--) {
			this.mt[i] = this.subtraction32(
				this.unsigned32(this.mt[i] ^ this.multiplication32(this.unsigned32(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)), 1566083941)),
				i
			);
			this.mt[i] = this.unsigned32(this.mt[i] & 0xffffffff);
			i++;
			if (i >= this.N) {
				this.mt[0] = this.mt[this.N - 1];
				i = 1;
			}
		}
		this.mt[0] = 0x80000000;
	}
	mag01 = [0x0, this.MATRIX_A];

	genrandInt32() {
		let y;
		if (this.mti >= this.N) {
			let kk;
			if (this.mti === this.N + 1) {
				this.initGenrand(5489);
			}
			for (kk = 0; kk < this.N - this.M; kk++) {
				y = this.unsigned32((this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK));
				this.mt[kk] = this.unsigned32(this.mt[kk + this.M] ^ (y >>> 1) ^ this.mag01[y & 0x1]);
			}
			for (; kk < this.N - 1; kk++) {
				y = this.unsigned32((this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK));
				this.mt[kk] = this.unsigned32(this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ this.mag01[y & 0x1]);
			}
			y = this.unsigned32((this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK));
			this.mt[this.N - 1] = this.unsigned32(this.mt[this.M - 1] ^ (y >>> 1) ^ this.mag01[y & 0x1]);
			this.mti = 0;
		}
		y = this.mt[this.mti++];
		y = this.unsigned32(y ^ (y >>> 11));
		y = this.unsigned32(y ^ ((y << 7) & 0x9d2c5680));
		y = this.unsigned32(y ^ ((y << 15) & 0xefc60000));
		y = this.unsigned32(y ^ (y >>> 18));
		return y;
	}

	genrandInt31() {
		return this.genrandInt32() >>> 1;
	}

	genrandReal1() {
		return this.genrandInt32() * (1.0 / 4294967295.0);
	}

	genrandReal2() {
		return this.genrandInt32() * (1.0 / 4294967296.0);
	}

	genrandReal3() {
		return (this.genrandInt32() + 0.5) * (1.0 / 4294967296.0);
	}

	genrandRes53() {
		const a = this.genrandInt32() >>> 5,
			b = this.genrandInt32() >>> 6;
		return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
	}
}
class IbanGenerator {
	UPPER_CHARS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
	LOWER_CHARS = [...'abcdefghijklmnopqrstuvwxyz'];
	DIGIT_CHARS = [...'0123456789'];
	ibanObj = {
		alpha: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
		formats: [
			{
				country: 'AL',
				total: 28,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'c',
						count: 16,
					},
				],
				format: 'ALkk bbbs sssx cccc cccc cccc cccc',
			},
			{
				country: 'AD',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'c',
						count: 12,
					},
				],
				format: 'ADkk bbbb ssss cccc cccc cccc',
			},
			{
				country: 'AT',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'n',
						count: 11,
					},
				],
				format: 'ATkk bbbb bccc cccc cccc',
			},
			{
				country: 'AZ',
				total: 28,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 20,
					},
				],
				format: 'AZkk bbbb cccc cccc cccc cccc cccc',
			},
			{
				country: 'BH',
				total: 22,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'c',
						count: 14,
					},
				],
				format: 'BHkk bbbb cccc cccc cccc cc',
			},
			{
				country: 'BE',
				total: 16,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 9,
					},
				],
				format: 'BEkk bbbc cccc ccxx',
			},
			{
				country: 'BA',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'BAkk bbbs sscc cccc ccxx',
			},
			{
				country: 'BR',
				total: 29,
				bban: [
					{
						type: 'n',
						count: 13,
					},
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'a',
						count: 1,
					},
					{
						type: 'c',
						count: 1,
					},
				],
				format: 'BRkk bbbb bbbb ssss sccc cccc ccct n',
			},
			{
				country: 'BG',
				total: 22,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'c',
						count: 8,
					},
				],
				format: 'BGkk bbbb ssss ddcc cccc cc',
			},
			{
				country: 'CR',
				total: 22,
				bban: [
					{
						type: 'n',
						count: 1,
					},
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 14,
					},
				],
				format: 'CRkk xbbb cccc cccc cccc cc',
			},
			{
				country: 'HR',
				total: 21,
				bban: [
					{
						type: 'n',
						count: 7,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'HRkk bbbb bbbc cccc cccc c',
			},
			{
				country: 'CY',
				total: 28,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'c',
						count: 16,
					},
				],
				format: 'CYkk bbbs ssss cccc cccc cccc cccc',
			},
			{
				country: 'CZ',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'CZkk bbbb ssss sscc cccc cccc',
			},
			{
				country: 'DK',
				total: 18,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'DKkk bbbb cccc cccc cc',
			},
			{
				country: 'DO',
				total: 28,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 20,
					},
				],
				format: 'DOkk bbbb cccc cccc cccc cccc cccc',
			},
			{
				country: 'TL',
				total: 23,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'TLkk bbbc cccc cccc cccc cxx',
			},
			{
				country: 'EE',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 12,
					},
				],
				format: 'EEkk bbss cccc cccc cccx',
			},
			{
				country: 'FO',
				total: 18,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'FOkk bbbb cccc cccc cx',
			},
			{
				country: 'FI',
				total: 18,
				bban: [
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'n',
						count: 8,
					},
				],
				format: 'FIkk bbbb bbcc cccc cx',
			},
			{
				country: 'FR',
				total: 27,
				bban: [
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'c',
						count: 11,
					},
					{
						type: 'n',
						count: 2,
					},
				],
				format: 'FRkk bbbb bggg ggcc cccc cccc cxx',
			},
			{
				country: 'GE',
				total: 22,
				bban: [
					{
						type: 'a',
						count: 2,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'GEkk bbcc cccc cccc cccc cc',
			},
			{
				country: 'DE',
				total: 22,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'DEkk bbbb bbbb cccc cccc cc',
			},
			{
				country: 'GI',
				total: 23,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'c',
						count: 15,
					},
				],
				format: 'GIkk bbbb cccc cccc cccc ccc',
			},
			{
				country: 'GR',
				total: 27,
				bban: [
					{
						type: 'n',
						count: 7,
					},
					{
						type: 'c',
						count: 16,
					},
				],
				format: 'GRkk bbbs sssc cccc cccc cccc ccc',
			},
			{
				country: 'GL',
				total: 18,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'GLkk bbbb cccc cccc cc',
			},
			{
				country: 'GT',
				total: 28,
				bban: [
					{
						type: 'c',
						count: 4,
					},
					{
						type: 'c',
						count: 4,
					},
					{
						type: 'c',
						count: 16,
					},
				],
				format: 'GTkk bbbb mmtt cccc cccc cccc cccc',
			},
			{
				country: 'HU',
				total: 28,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'HUkk bbbs sssk cccc cccc cccc cccx',
			},
			{
				country: 'IS',
				total: 26,
				bban: [
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'ISkk bbbb sscc cccc iiii iiii ii',
			},
			{
				country: 'IE',
				total: 22,
				bban: [
					{
						type: 'c',
						count: 4,
					},
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'n',
						count: 8,
					},
				],
				format: 'IEkk aaaa bbbb bbcc cccc cc',
			},
			{
				country: 'IL',
				total: 23,
				bban: [
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'n',
						count: 13,
					},
				],
				format: 'ILkk bbbn nncc cccc cccc ccc',
			},
			{
				country: 'IT',
				total: 27,
				bban: [
					{
						type: 'a',
						count: 1,
					},
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'c',
						count: 12,
					},
				],
				format: 'ITkk xaaa aabb bbbc cccc cccc ccc',
			},
			{
				country: 'JO',
				total: 30,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 18,
					},
				],
				format: 'JOkk bbbb nnnn cccc cccc cccc cccc cc',
			},
			{
				country: 'KZ',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'c',
						count: 13,
					},
				],
				format: 'KZkk bbbc cccc cccc cccc',
			},
			{
				country: 'XK',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 12,
					},
				],
				format: 'XKkk bbbb cccc cccc cccc',
			},
			{
				country: 'KW',
				total: 30,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'c',
						count: 22,
					},
				],
				format: 'KWkk bbbb cccc cccc cccc cccc cccc cc',
			},
			{
				country: 'LV',
				total: 21,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'c',
						count: 13,
					},
				],
				format: 'LVkk bbbb cccc cccc cccc c',
			},
			{
				country: 'LB',
				total: 28,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'c',
						count: 20,
					},
				],
				format: 'LBkk bbbb cccc cccc cccc cccc cccc',
			},
			{
				country: 'LI',
				total: 21,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'c',
						count: 12,
					},
				],
				format: 'LIkk bbbb bccc cccc cccc c',
			},
			{
				country: 'LT',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'n',
						count: 11,
					},
				],
				format: 'LTkk bbbb bccc cccc cccc',
			},
			{
				country: 'LU',
				total: 20,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'c',
						count: 13,
					},
				],
				format: 'LUkk bbbc cccc cccc cccc',
			},
			{
				country: 'MK',
				total: 19,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'c',
						count: 10,
					},
					{
						type: 'n',
						count: 2,
					},
				],
				format: 'MKkk bbbc cccc cccc cxx',
			},
			{
				country: 'MT',
				total: 31,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'c',
						count: 18,
					},
				],
				format: 'MTkk bbbb ssss sccc cccc cccc cccc ccc',
			},
			{
				country: 'MR',
				total: 27,
				bban: [
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'n',
						count: 13,
					},
				],
				format: 'MRkk bbbb bsss sscc cccc cccc cxx',
			},
			{
				country: 'MU',
				total: 30,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 15,
					},
					{
						type: 'a',
						count: 3,
					},
				],
				format: 'MUkk bbbb bbss cccc cccc cccc 000d dd',
			},
			{
				country: 'MC',
				total: 27,
				bban: [
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'c',
						count: 11,
					},
					{
						type: 'n',
						count: 2,
					},
				],
				format: 'MCkk bbbb bsss sscc cccc cccc cxx',
			},
			{
				country: 'MD',
				total: 24,
				bban: [
					{
						type: 'c',
						count: 2,
					},
					{
						type: 'c',
						count: 18,
					},
				],
				format: 'MDkk bbcc cccc cccc cccc cccc',
			},
			{
				country: 'ME',
				total: 22,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 15,
					},
				],
				format: 'MEkk bbbc cccc cccc cccc xx',
			},
			{
				country: 'NL',
				total: 18,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'NLkk bbbb cccc cccc cc',
			},
			{
				country: 'NO',
				total: 15,
				bban: [
					{
						type: 'n',
						count: 4,
					},
					{
						type: 'n',
						count: 7,
					},
				],
				format: 'NOkk bbbb cccc ccx',
			},
			{
				country: 'PK',
				total: 24,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'PKkk bbbb cccc cccc cccc cccc',
			},
			{
				country: 'PS',
				total: 29,
				bban: [
					{
						type: 'c',
						count: 4,
					},
					{
						type: 'n',
						count: 9,
					},
					{
						type: 'n',
						count: 12,
					},
				],
				format: 'PSkk bbbb xxxx xxxx xccc cccc cccc c',
			},
			{
				country: 'PL',
				total: 28,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'PLkk bbbs sssx cccc cccc cccc cccc',
			},
			{
				country: 'PT',
				total: 25,
				bban: [
					{
						type: 'n',
						count: 8,
					},
					{
						type: 'n',
						count: 13,
					},
				],
				format: 'PTkk bbbb ssss cccc cccc cccx x',
			},
			{
				country: 'QA',
				total: 29,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'c',
						count: 21,
					},
				],
				format: 'QAkk bbbb cccc cccc cccc cccc cccc c',
			},
			{
				country: 'RO',
				total: 24,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'c',
						count: 16,
					},
				],
				format: 'ROkk bbbb cccc cccc cccc cccc',
			},
			{
				country: 'SM',
				total: 27,
				bban: [
					{
						type: 'a',
						count: 1,
					},
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'c',
						count: 12,
					},
				],
				format: 'SMkk xaaa aabb bbbc cccc cccc ccc',
			},
			{
				country: 'SA',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 2,
					},
					{
						type: 'c',
						count: 18,
					},
				],
				format: 'SAkk bbcc cccc cccc cccc cccc',
			},
			{
				country: 'RS',
				total: 22,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 15,
					},
				],
				format: 'RSkk bbbc cccc cccc cccc xx',
			},
			{
				country: 'SK',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'SKkk bbbb ssss sscc cccc cccc',
			},
			{
				country: 'SI',
				total: 19,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'SIkk bbss sccc cccc cxx',
			},
			{
				country: 'ES',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 10,
					},
					{
						type: 'n',
						count: 10,
					},
				],
				format: 'ESkk bbbb gggg xxcc cccc cccc',
			},
			{
				country: 'SE',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 17,
					},
				],
				format: 'SEkk bbbc cccc cccc cccc cccc',
			},
			{
				country: 'CH',
				total: 21,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'c',
						count: 12,
					},
				],
				format: 'CHkk bbbb bccc cccc cccc c',
			},
			{
				country: 'TN',
				total: 24,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'n',
						count: 15,
					},
				],
				format: 'TNkk bbss sccc cccc cccc cccc',
			},
			{
				country: 'TR',
				total: 26,
				bban: [
					{
						type: 'n',
						count: 5,
					},
					{
						type: 'n',
						count: 1,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'TRkk bbbb bxcc cccc cccc cccc cc',
			},
			{
				country: 'AE',
				total: 23,
				bban: [
					{
						type: 'n',
						count: 3,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'AEkk bbbc cccc cccc cccc ccc',
			},
			{
				country: 'GB',
				total: 22,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 6,
					},
					{
						type: 'n',
						count: 8,
					},
				],
				format: 'GBkk bbbb ssss sscc cccc cc',
			},
			{
				country: 'VG',
				total: 24,
				bban: [
					{
						type: 'a',
						count: 4,
					},
					{
						type: 'n',
						count: 16,
					},
				],
				format: 'VGkk bbbb cccc cccc cccc cccc',
			},
		],
		iso3166: [
			'AD',
			'AE',
			'AF',
			'AG',
			'AI',
			'AL',
			'AM',
			'AO',
			'AQ',
			'AR',
			'AS',
			'AT',
			'AU',
			'AW',
			'AX',
			'AZ',
			'BA',
			'BB',
			'BD',
			'BE',
			'BF',
			'BG',
			'BH',
			'BI',
			'BJ',
			'BL',
			'BM',
			'BN',
			'BO',
			'BQ',
			'BR',
			'BS',
			'BT',
			'BV',
			'BW',
			'BY',
			'BZ',
			'CA',
			'CC',
			'CD',
			'CF',
			'CG',
			'CH',
			'CI',
			'CK',
			'CL',
			'CM',
			'CN',
			'CO',
			'CR',
			'CU',
			'CV',
			'CW',
			'CX',
			'CY',
			'CZ',
			'DE',
			'DJ',
			'DK',
			'DM',
			'DO',
			'DZ',
			'EC',
			'EE',
			'EG',
			'EH',
			'ER',
			'ES',
			'ET',
			'FI',
			'FJ',
			'FK',
			'FM',
			'FO',
			'FR',
			'GA',
			'GB',
			'GD',
			'GE',
			'GF',
			'GG',
			'GH',
			'GI',
			'GL',
			'GM',
			'GN',
			'GP',
			'GQ',
			'GR',
			'GS',
			'GT',
			'GU',
			'GW',
			'GY',
			'HK',
			'HM',
			'HN',
			'HR',
			'HT',
			'HU',
			'ID',
			'IE',
			'IL',
			'IM',
			'IN',
			'IO',
			'IQ',
			'IR',
			'IS',
			'IT',
			'JE',
			'JM',
			'JO',
			'JP',
			'KE',
			'KG',
			'KH',
			'KI',
			'KM',
			'KN',
			'KP',
			'KR',
			'KW',
			'KY',
			'KZ',
			'LA',
			'LB',
			'LC',
			'LI',
			'LK',
			'LR',
			'LS',
			'LT',
			'LU',
			'LV',
			'LY',
			'MA',
			'MC',
			'MD',
			'ME',
			'MF',
			'MG',
			'MH',
			'MK',
			'ML',
			'MM',
			'MN',
			'MO',
			'MP',
			'MQ',
			'MR',
			'MS',
			'MT',
			'MU',
			'MV',
			'MW',
			'MX',
			'MY',
			'MZ',
			'NA',
			'NC',
			'NE',
			'NF',
			'NG',
			'NI',
			'NL',
			'NO',
			'NP',
			'NR',
			'NU',
			'NZ',
			'OM',
			'PA',
			'PE',
			'PF',
			'PG',
			'PH',
			'PK',
			'PL',
			'PM',
			'PN',
			'PR',
			'PS',
			'PT',
			'PW',
			'PY',
			'QA',
			'RE',
			'RO',
			'RS',
			'RU',
			'RW',
			'SA',
			'SB',
			'SC',
			'SD',
			'SE',
			'SG',
			'SH',
			'SI',
			'SJ',
			'SK',
			'SL',
			'SM',
			'SN',
			'SO',
			'SR',
			'SS',
			'ST',
			'SV',
			'SX',
			'SY',
			'SZ',
			'TC',
			'TD',
			'TF',
			'TG',
			'TH',
			'TJ',
			'TK',
			'TL',
			'TM',
			'TN',
			'TO',
			'TR',
			'TT',
			'TV',
			'TW',
			'TZ',
			'UA',
			'UG',
			'UM',
			'US',
			'UY',
			'UZ',
			'VA',
			'VC',
			'VE',
			'VG',
			'VI',
			'VN',
			'VU',
			'WF',
			'WS',
			'XK',
			'YE',
			'YT',
			'ZA',
			'ZM',
			'ZW',
		],
		mod97: (digitStr) => {
			let m = 0;
			for (const element of digitStr) {
				m = (m * 10 + +element) % 97;
			}
			return m;
		},
		pattern10: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
		pattern100: ['001', '002', '003', '004', '005', '006', '007', '008', '009'],
		toDigitString: (str) => str.replaceAll(/[A-Z]/gi, (match) => String((match.toUpperCase().codePointAt(0) ?? Number.NaN) - 55)),
	};
	constructor() {}
	generateMersenne32Randomizer() {
		const twister = new MersenneTwister19937();
		twister.initGenrand(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));
		return {
			next() {
				return twister.genrandReal2();
			},
			seed(seed) {
				if (typeof seed === 'number') {
					twister.initGenrand(seed);
				} else if (Array.isArray(seed)) {
					twister.initByArray(seed, seed.length);
				}
			},
		};
	}
	int(options = {}) {
		if (typeof options === 'number') {
			options = { max: options };
		}
		const { min = 0, max = Number.MAX_SAFE_INTEGER, multipleOf = 1 } = options;
		if (!Number.isInteger(multipleOf)) {
			return console.error(`multipleOf should be an integer.`);
		}
		if (multipleOf <= 0) {
			return console.error(`multipleOf should be greater than 0.`);
		}
		const effectiveMin = Math.ceil(min / multipleOf);
		const effectiveMax = Math.floor(max / multipleOf);
		if (effectiveMin === effectiveMax) {
			return effectiveMin * multipleOf;
		}
		if (effectiveMax < effectiveMin) {
			if (max >= min) {
				return console.error(`No suitable integer value between ${min} and ${max} found.`);
			}
			return console.error(`Max ${max} should be greater than min ${min}.`);
		}
		const randomizer = this.generateMersenne32Randomizer();
		const real = randomizer.next();
		const delta = effectiveMax - effectiveMin + 1; // +1 for inclusive max bounds and even distribution
		return Math.floor(real * delta + effectiveMin) * multipleOf;
	}
	float(options = {}) {
		if (typeof options === 'number') {
			options = {
				max: options,
			};
		}
		const {
			min = 0,
			max = 1,
			fractionDigits,
			multipleOf: originalMultipleOf,
			multipleOf = fractionDigits == null ? undefined : 10 ** -fractionDigits,
		} = options;
		if (max === min) {
			return min;
		}
		if (max < min) {
			return console.error(`Max ${max} should be greater than min ${min}.`);
		}
		if (fractionDigits != null) {
			if (originalMultipleOf != null) {
				return console.error('multipleOf and fractionDigits cannot be set at the same time.');
			}
			if (!Number.isInteger(fractionDigits)) {
				return console.error('fractionDigits should be an integer.');
			}
			if (fractionDigits < 0) {
				return console.error('fractionDigits should be greater than or equal to 0.');
			}
		}
		if (multipleOf != null) {
			if (multipleOf <= 0) {
				return console.error(`multipleOf should be greater than 0.`);
			}
			const logPrecision = Math.log10(multipleOf);
			const factor = multipleOf < 1 && Number.isInteger(logPrecision) ? 10 ** -logPrecision : 1 / multipleOf;
			const int = this.int({
				min: min * factor,
				max: max * factor,
			});
			return int / factor;
		}
		const randomizer = this.generateMersenne32Randomizer();
		const real = randomizer.next();
		return real * (max - min) + min;
	}
	arrayElement(array) {
		if (array.length === 0) {
			return console.error('Cannot get value from empty dataset.');
		}
		const index = array.length > 1 ? this.int({ max: array.length - 1 }) : 0;
		return array[index];
	}
	boolean(options = {}) {
		if (typeof options === 'number') {
			options = {
				probability: options,
			};
		}
		const { probability = 0.5 } = options;
		if (probability <= 0) {
			return false;
		}
		if (probability >= 1) {
			return true;
		}
		return this.float() < probability;
	}
	iban(countryCode) {
		const ibanFormat = this.ibanObj.formats.find((f) => f.country === countryCode);
		if (!ibanFormat) {
			return console.error(`Country code ${countryCode} not supported.`);
		}
		let s = '';
		let count = 0;
		for (const bban of ibanFormat.bban) {
			let c = bban.count;
			count += bban.count;
			while (c > 0) {
				if (bban.type === 'a') {
					s += this.arrayElement(this.ibanObj.alpha);
				} else if (bban.type === 'c') {
					if (this.boolean(0.8)) {
						s += this.int(9);
					} else {
						s += this.arrayElement(this.ibanObj.alpha);
					}
				} else {
					if (c >= 3 && this.boolean(0.3)) {
						if (this.boolean()) {
							s += this.arrayElement(this.ibanObj.pattern100);
							c -= 2;
						} else {
							s += this.arrayElement(this.ibanObj.pattern10);
							c--;
						}
					} else {
						s += this.int(9);
					}
				}
				c--;
			}
			s = s.substring(0, count);
		}
		let checksum = 98 - this.ibanObj.mod97(this.ibanObj.toDigitString(`${s}${ibanFormat.country}00`));
		if (checksum < 10) {
			checksum = `0${checksum}`;
		}
		const result = `${ibanFormat.country}${checksum}${s}`;
		return result;
	}
	rangeToNumber(numberOrRange) {
		if (typeof numberOrRange === 'number') {
			return numberOrRange;
		}
		return this.int(numberOrRange);
	}
	multiple(method, options = {}) {
		const count = this.rangeToNumber(options.count ?? 3);
		if (count <= 0) {
			return [];
		}
		return Array.from({ length: count }, method);
	}
	fromCharacters(characters, length = 1) {
		length = this.rangeToNumber(length);
		if (length <= 0) {
			return '';
		}
		if (typeof characters === 'string') {
			characters = [...characters];
		}
		if (characters.length === 0) {
			return console.error('Unable to generate string: No characters to select from.');
		}
		return this.multiple(() => this.arrayElement(characters), {
			count: length,
		}).join('');
	}
	alpha(options = {}) {
		if (typeof options === 'number') {
			options = {
				length: options,
			};
		}
		const length = this.rangeToNumber(options.length ?? 1);
		if (length <= 0) {
			return '';
		}
		const { casing = 'mixed' } = options;
		let { exclude = [] } = options;
		if (typeof exclude === 'string') {
			exclude = [...exclude];
		}
		let charsArray;
		switch (casing) {
			case 'upper': {
				charsArray = [...this.UPPER_CHARS];
				break;
			}
			case 'lower': {
				charsArray = [...this.LOWER_CHARS];
				break;
			}
			case 'mixed': {
				charsArray = [...this.LOWER_CHARS, ...this.UPPER_CHARS];
				break;
			}
		}
		charsArray = charsArray.filter((elem) => !exclude.includes(elem));
		return this.fromCharacters(charsArray, length);
	}
	alphanumeric(options = {}) {
		if (typeof options === 'number') {
			options = {
				length: options,
			};
		}
		const length = this.rangeToNumber(options.length ?? 1);
		if (length <= 0) {
			return '';
		}
		const { casing = 'mixed' } = options;
		let { exclude = [] } = options;
		if (typeof exclude === 'string') {
			exclude = [...exclude];
		}
		let charsArray = [...this.DIGIT_CHARS];
		switch (casing) {
			case 'upper': {
				charsArray.push(...this.UPPER_CHARS);
				break;
			}
			case 'lower': {
				charsArray.push(...this.LOWER_CHARS);
				break;
			}
			case 'mixed': {
				charsArray.push(...this.LOWER_CHARS, ...this.UPPER_CHARS);
				break;
			}
		}
		charsArray = charsArray.filter((elem) => !exclude.includes(elem));
		return this.fromCharacters(charsArray, length);
	}
	bic(includeBranchCode) {
		const bankIdentifier = this.alpha({
			length: 4,
			casing: 'upper',
		});
		const countryCode = this.arrayElement(this.ibanObj.iso3166);
		const locationCode = this.alphanumeric({
			length: 2,
			casing: 'upper',
		});
		const branchCode = includeBranchCode ? (this.boolean() ? this.alphanumeric({ length: 3, casing: 'upper' }) : 'XXX') : '';
		return `${bankIdentifier}${countryCode}${locationCode}${branchCode}`;
	}
}

const genIban = new IbanGenerator();
const rl = readline.createInterface({ input, output });

const generator = {
	genCompanyName() {
		const COMPANY_START = [
			'Proud',
			'Affectionate',
			'Agreeable',
			'Amiable',
			'Bright',
			'Charming',
			'Creative',
			'Determined',
			'Diligent',
			'Diplomatic',
			'Dynamic',
			'Energetic',
			'Friendly',
			'Funny',
			'Generous',
			'Giving',
			'Gregarious',
			'Hardworking',
			'Helpful',
			'Kind',
			'Likable',
			'Loyal',
			'Patient',
			'Polite',
			'Sincere',
			'Vibrant',
			'Resilient',
			'Radiant',
			'Spirited',
			'Harmonious',
			'Dynamic',
			'Cheerful',
			'Uplifting',
			'Effervescent',
			'Adaptable',
			'Optimistic',
			'Gracious',
			'Inspirational',
			'Pleasant',
			'Empathetic',
			'Rejuvenating',
			'Enchanting',
			'Energetic',
			'Jubilant',
			'Admirable',
			'Kindhearted',
			'Creative',
			'Courageous',
			'Diligent',
			'Resourceful',
			'Pioneering',
		];

		const COMPANY_CENTER = [
			'Time',
			'Year',
			'People',
			'Way',
			'Day',
			'Man',
			'Thing',
			'Woman',
			'Life',
			'Child',
			'World',
			'School',
			'State',
			'Family',
			'Student',
			'Group',
			'Country',
			'Problem',
			'Hand',
			'Part',
			'Place',
			'Case',
			'Week',
			'Company',
			'System',
			'Program',
			'Question',
			'Work',
			'Government',
			'Number',
			'Night',
			'Point',
			'Home',
			'Water',
			'Room',
			'Mother',
			'Area',
			'Money',
			'Story',
			'Fact',
			'Month',
			'Lot',
			'Right',
			'Study',
			'Book',
			'Eye',
			'Job',
			'Word',
			'Business',
			'Issue',
			'Side',
			'Kind',
			'Head',
			'House',
			'Service',
			'Friend',
			'Father',
			'Power',
			'Hour',
			'Game',
			'Line',
			'End',
			'Member',
			'Law',
			'Car',
			'City',
			'Community',
			'Name',
			'President',
			'Team',
			'Minute',
			'Idea',
			'Kid',
			'Body',
			'Information',
			'Back',
			'Parent',
			'Face',
			'Level',
			'Office',
			'Door',
			'Health',
			'Person',
			'Art',
			'War',
			'History',
			'Party',
			'Result',
			'Change',
			'Morning',
			'Reason',
			'Research',
			'Girl',
			'Guy',
			'Moment',
			'Air',
			'Teacher',
			'Force',
			'Education',
		];

		const COMPANY_ENDING = [
			'Trading',
			'Industries',
			'INC.',
			'GMBH',
			'AG.',
			'CO.',
			'GROUP',
			'HOLDING',
			'CROP',
			'LLC',
			'Business Services',
			'Consulting',
			'Capital',
			'Equity',
			'Investments',
			'Technologies',
			'Communications',
			'Media',
			'Manufacturing',
			'Industries',
			'Holdings',
			'Collective',
			'Logistics',
			'Transportation',
			'Direct',
			'Labs',
			'Agency',
			'Foodstuffs',
			'Brothers',
			'Productions',
			'Entertainment',
			'Group',
			'Associates',
			'Ventures',
			'Properties',
			'Direct',
			'Prestige',
			'Solutions',
			'Research',
			'Securities',
			'Energy',
			'Conservation',
			'Water',
			'Engineering',
			'Developments',
			'Design',
			'Public Relations',
			'Architecture',
			'Construction',
			'Building',
			'Maintenance',
			'Inspection',
			'Repairs',
			'Cleaning',
			'Consulting',
			'Planning',
			'Management',
			'Systems',
			'Integration',
			'Support',
			'Training',
			'Education',
			'Publishing',
			'Marketing',
			'Advertising',
			'Publicity',
			'Events',
			'Promotions',
			'Entertainment',
			'Hospitality',
			'Travel',
			'Leisure',
			'Sports',
			'Recreation',
			'Fitness',
			'Wellness',
			'Beauty',
			'Home',
			'Garden',
			'Landscaping',
			'Furnishings',
			'Appliances',
			'Shopping',
			'Gifts',
			'Retail',
			'Wholesalers',
			'Banking',
			'Credit',
			'Arts',
			'Fashion',
			'Film',
			'Music',
			'Productions',
			'Photography',
			'Web',
			'Computers',
			'Hardware',
			'Software',
			'Gaming',
			'Internet Services',
			'Telecommunications',
			'Publishing',
		];
		const rand = new Uint8Array(3);
		crypto.getRandomValues(rand);
		let startIndex = Math.round((rand[0] * (COMPANY_START.length - 1)) / 255);
		let centerIndex = Math.round((rand[1] * (COMPANY_CENTER.length - 1)) / 255);
		let endIndex = Math.round((rand[2] * (COMPANY_ENDING.length - 1)) / 255);
		return `${COMPANY_START[startIndex]} ${COMPANY_CENTER[centerIndex]} ${COMPANY_ENDING[endIndex]}`;
	},
	genType() {
		const TYPE = [
			'private',
			'business',
			'mobile',
			'landline',
			'family',
			'backup',
			'emergency',
			'sales',
			'media',
			'logistics',
			'office',
			'marketing',
			'hr',
			'rnd',
			'accounting',
			'management',
			'primary',
			'secondary',
			'alternative',
			'home',
			'billing',
			'delivery',
		];
		const rand = new Uint8Array(1);
		crypto.getRandomValues(rand);
		const randIndex = Math.round((rand[0] * (TYPE.length - 1)) / 255);
		return TYPE[randIndex];
	},
	genPerson() {
		const TITLE = ['Herr', 'Frau', 'Mr.', 'Ms.'];
		// unisex names from different countries to not bother with assigning correct title
		const UNI_SEX_FIRST_NAMES = [
			'Lowen',
			'Arbor',
			'Everest',
			'Onyx',
			'Ridley',
			'Tatum',
			'Wren',
			'Ellis',
			'Zephyr',
			'Royal',
			'Azriel',
			'Ira',
			'Sage',
			'Blake',
			'Ash',
			'Jett',
			'Robin',
			'Spencer',
			'Marlowe',
			'Phoenix',
			'Sutton',
			'Shiloh',
			'Koda',
			'Amari',
			'Artemis',
			'Scout',
			'Basil',
			'Rory',
			'Vesper',
			'Lux',
			'River',
			'Adél',
			'Alex',
			'Alix',
			'Amour',
			'Anne',
			'Avril',
			'Audrey',
			'Beau',
			'Camille',
			'Candide',
			'Céleste',
			'Claude',
			'Cyrille',
			'Dominique',
			'Faby',
			'Hyacinthe',
			'Jade',
			'Jean',
			'Jocelyn',
			'Lillian',
			'Loïs',
			'Louison',
			'Marron',
			'Maxime',
			'Narcisse',
			'Odet',
			'Placide',
			'René',
			'Sam',
			'Stéphane',
			'Luca',
			'Micha',
			'Michi',
			'Mika',
			'Niko',
			'Sascha',
			'Sigi',
			'Toni',
			'Ulli',
		];
		const LAST_NAMES = [
			'Martin',
			'Bernard',
			'ubois',
			'homas',
			'obert',
			'ichard',
			'etit',
			'urand',
			'eroy',
			'Moreau',
			'Simon',
			'Laurent',
			'Lefebvre',
			'Michel',
			'Garcia',
			'David',
			'Bertrand',
			'Roux',
			'Vincent',
			'Fournier',
			'Morel',
			'Girard',
			'André',
			'Lefèvre',
			'Mercier',
			'Dupont',
			'Lambert',
			'Bonnet',
			'François',
			'Martinez',
			'Müller',
			'Schmidt',
			'Schneider',
			'Fischer',
			'Meyer',
			'Weber',
			'Wagner',
			'Schulz',
			'Becker',
			'Hoffmann',
			'De Jong',
			'Jansen',
			'De Vries',
			'Van den Berg',
			'Bakker',
			'Janssen',
			'Visser',
			'Smit',
			'Meijer',
			'Mulder',
			'Bos',
			'Vos',
			'Peters',
			'Hendriks',
			'Van Leeuwen',
			'Lekker',
			'Brouwer',
			'De Wit',
			'Dijkstra',
			'Smits',
			'De Graaf',
			'Van der Meer',
			'Smith',
			'Jones',
			'Taylor',
			'Brown',
			'Williams',
			'Wilson',
			'Johnson',
			'Davies',
			'Robinson',
			'Wright',
			'Thompson',
			'Evans',
			'Walker',
			'White',
			'Roberts',
			'Green',
			'Hall',
			'Wood',
			'Jackson',
			'Clark',
		];
		const rand = new Uint8Array(3);
		crypto.getRandomValues(rand);
		const titleIndex = Math.round((rand[0] * (TITLE.length - 1)) / 255);
		const fistNameIndex = Math.round((rand[1] * (UNI_SEX_FIRST_NAMES.length - 1)) / 255);
		const lastNameIndex = Math.round((rand[2] * (LAST_NAMES.length - 1)) / 255);
		if (titleIndex === undefined || fistNameIndex === undefined || lastNameIndex === undefined) {
			console.table({ titleIndex: titleIndex, fistNameIndex: fistNameIndex, lastNameIndex: lastNameIndex });
			console.table({ titleIndex: rand[0], fistNameIndex: rand[1], lastNameIndex: rand[2] });
		}
		return {
			title: TITLE[titleIndex],
			firstName: UNI_SEX_FIRST_NAMES[fistNameIndex],
			lastName: LAST_NAMES[lastNameIndex],
		};
	},
	genEmail(first, middle, last) {
		let f = '';
		let l = '';
		f = first;
		l = last;
		f = f.toLowerCase();
		l = l.toLowerCase();
		f.replace(/\s/g, '');
		l.replace(/\s/g, '');
		if (middle !== undefined) {
			let m = '';
			m = middle;
			m.replace(/\s/g, '');
			m = m.toLowerCase();
			return `${f}.${m}.${l}@example.com`;
		}
		return `${f}.${l}@example.com`;
	},
	genPhone() {
		const countryDialCode = [
			{ val: '+1', code: 'US', limit: 10 },
			{ val: '+49', code: 'DE', limit: 11 },
			{ val: '+32', code: 'BE', limit: 8 },
			{ val: '+33', code: 'FR', limit: 9 },
			{ val: '+31', code: 'NL', limit: 10 },
			{ val: '+44', code: 'UK', limit: 11 },
		];
		const rand = new Uint8Array(10);
		crypto.getRandomValues(rand);
		const codeIndex = Math.round((rand[0] * (countryDialCode.length - 1)) / 255);
		let phoneNumber = '';
		for (let i = 1; i < 10; i++) {
			phoneNumber += rand[i].toString();
		}
		return `${countryDialCode[codeIndex].val} ${phoneNumber.slice(0, countryDialCode[codeIndex].limit)}`;
	},
	/**
	 *
	 * @param {string} companyName
	 * @returns
	 */
	genWebsite(companyName) {
		return `https://${companyName
			.split(/\s/g)
			.map((val) => val.trim().toLowerCase())
			.join('-')}.com`;
	},
	genAddress() {
		let street = '';
		let zip = '';
		let city = '';
		let country = '';
		const countryCode = ['US', 'DE', 'BE', 'FR', 'NL', 'UK'];
		const rand = new Uint8Array(18);
		crypto.getRandomValues(rand);
		for (let i = 0; i < 7; i++) {
			let code = Math.round((rand[i] * (126 - 32)) / 255) + 32;
			if (code === 59 || code === 44) {
				code = 58;
			}
			street += String.fromCharCode(code);
		}
		street += '-street ' + rand[7].toString();
		for (let i = 8; i < 12; i++) {
			let code = Math.round((rand[i] * (126 - 32)) / 255) + 32;
			if (code === 59 || code == 44) {
				code = 58;
			}
			city += String.fromCharCode(code);
		}
		city += '-city';
		zip = (rand[12].toString() + rand[13].toString() + rand[14].toString() + rand[15].toString() + rand[16].toString()).slice(0, 5);
		let countryCodeIndex = Math.round((rand[17] * (countryCode.length - 1)) / 255);
		country = countryCode[countryCodeIndex];
		return { street, zip, city, country };
	},
	genDates() {
		let rand = new Uint8Array(3);
		crypto.getRandomValues(rand);
		let now = new Date();
		let past = new Date();
		let years = [2023, 2022, 2021, 2020, 2019];
		let yearIndex = Math.round((rand[0] * (years.length - 1)) / 255);
		let month = Math.round((rand[1] * 11) / 255);
		let day = Math.round((rand[2] * 28) / 255);
		past.setFullYear(years[yearIndex], month, day);
		return { now: now.toISOString(), past: past.toISOString() };
	},
	genBank() {
		const rand = new Uint8Array(1);
		const countryCode = ['DE', 'BE', 'FR', 'NL'];
		crypto.getRandomValues(rand);
		const countryIndex = Math.round((rand[0] * (countryCode.length - 1)) / 255);
		const bankName = 'SomeRandomBank (SRB)';
		const iban = genIban.iban(countryCode[countryIndex]);
		let bic;
		if (countryCode[countryIndex] === 'UK' || countryCode[countryIndex] === 'FR') {
			bic = genIban.bic(true);
		} else {
			bic = genIban.bic(false);
		}
		return { bankName, iban, bic };
	},
	genTax() {
		const rand = new Uint8Array(29);
		crypto.getRandomValues(rand);
		let bucket = '';
		for (const val of rand) {
			bucket += val.toString();
		}
		const vatID = bucket.slice(0, 9);
		const taxID = bucket.slice(10, 19);
		const taxNumber = bucket.slice(20, 29);
		return { taxID, taxNumber, vatID };
	},
};

async function main() {
	const start = new Date();
	let rows = 1000;
	try {
		let rowQuestionResult = await rl.question('Number of Rows (Default: 1000): ');
		if (rowQuestionResult !== '') {
			rows = parseInt(rowQuestionResult);
		}
		if (isNaN(rows) || rows === undefined) {
			rows = 1000;
		}
		// relative to root
		const writeStream = fs.createWriteStream(`./resources/data/customers-${rows}.csv`);
		const encoder = new TextEncoder();
		writeStream.on('ready', () => {
			writeStream.write(
				encoder.encode(
					'customer_id;alt_ids;description;first_interaction;latest_interaction;customer_notes;website;customer_email;customer_email_type;customer_email_notes;customer_phone;customer_phone_type;customer_phone_notes;title;first_name;last_name;alias;person_notes;person_email;person_email_type;person_email_notes;person_phone;person_phone_type;person_phone_notes;company_name;company_alias;company_notes;tax_id;tax_number;vat_id;address_type;street;zip;city;country;address_notes;bank_name;iban;bic;bank_code;bank_notes\n'
				)
			);
			for (let i = 1; i <= rows; i++) {
				const { now, past } = generator.genDates();
				const { title, firstName, lastName } = generator.genPerson();
				const email = generator.genEmail(firstName, undefined, lastName);
				const emailType = generator.genType();
				const phone = generator.genPhone();
				const phoneType = generator.genType();
				const company = generator.genCompanyName();
				let c_parts = company.split(' ');
				const customerEmail = generator.genEmail(c_parts[0], c_parts[1], c_parts[2]);
				const customerEmailType = generator.genType();
				const customerPhone = generator.genPhone();
				const customerPhoneType = generator.genType();
				const { street, zip, city, country } = generator.genAddress();
				const addressType = generator.genType();
				const website = generator.genWebsite(company);
				const { bankName, iban, bic } = generator.genBank();
				const { taxID, taxNumber, vatID } = generator.genTax();
				writeStream.write(
					encoder.encode(
						`${i.toString()};;${i.toString()}-Description;${past};${now};${i.toString()}-notes;${website};${customerEmail};${customerEmailType};${customerEmail}-note;${customerPhone};${customerPhoneType};${customerPhone}-note;${title};${firstName};${lastName};;${firstName} ${lastName}-notes;${email};${emailType};${email}-note;${phone};${phoneType};${phone}-note;${company};;${company}-note;${taxID};${taxNumber};${vatID};${addressType};${street};${zip};${city};${country};${street}-note;${bankName};${iban};${bic};;${bankName}-notes\n`
					)
				);
			}
			writeStream.close();
			rl.close();
		});
	} catch (e) {
		console.error(e);
		rl.close();
	} finally {
		let end = new Date();
		let diff = end.getTime() - start.getTime();
		console.log('Done. Generating took %d ms (%ds)\n finishing...', diff, diff / 1000);
		console.log(`output: ./resources/data/customers-${rows}.csv`);
	}
}

main();
