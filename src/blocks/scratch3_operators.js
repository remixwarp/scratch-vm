const Cast = require('../util/cast.js');
const MathUtil = require('../util/math-util.js');

class Scratch3OperatorsBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            operator_add: this.add,
            operator_subtract: this.subtract,
            operator_multiply: this.multiply,
            operator_divide: this.divide,
            operator_clamp: this.clamp,
            operator_min: this.min,
            operator_max: this.max,
            operator_lt: this.lt,
            operator_equals: this.equals,
            operator_gt: this.gt,
            operator_and: this.and,
            operator_or: this.or,
            operator_not: this.not,
            operator_random: this.random,
            operator_join: this.join,
            operator_letter_of: this.letterOf,
            operator_length: this.length,
            operator_contains: this.contains,
            operator_letters_of: this.lettersOf,
            operator_index_of: this.indexOf,
            operator_replace: this.replace,
            operator_repeat: this.repeat,
            operator_change_case: this.changeCase,
            operator_trim: this.trim,
            operator_mod: this.mod,
            operator_pi: this.pi,
            operator_newline: this.newline,
            operator_round: this.round,
            operator_mathop: this.mathop
        };
    }

    add (args) {
        return Cast.toNumber(args.NUM1) + Cast.toNumber(args.NUM2);
    }

    subtract (args) {
        return Cast.toNumber(args.NUM1) - Cast.toNumber(args.NUM2);
    }

    multiply (args) {
        return Cast.toNumber(args.NUM1) * Cast.toNumber(args.NUM2);
    }

    divide (args) {
        return Cast.toNumber(args.NUM1) / Cast.toNumber(args.NUM2);
    }

    clamp (args) {
        return Math.min(Math.max(Cast.toNumber(args.NUM), Cast.toNumber(args.MIN)), Cast.toNumber(args.MAX));
    }

    min (args) {
        const count = this._operandCount(args);
        let result = Infinity;
        for (let i = 1; i <= count; i++) result = Math.min(result, Cast.toNumber(args[`NUM${i}`]));
        return result;
    }

    max (args) {
        const count = this._operandCount(args);
        let result = -Infinity;
        for (let i = 1; i <= count; i++) result = Math.max(result, Cast.toNumber(args[`NUM${i}`]));
        return result;
    }

    _operandCount (args) {
        const mutation = args.mutation;
        if (mutation && mutation.itemcount) {
            const count = parseInt(mutation.itemcount, 10);
            if (count >= 2) return count;
        }
        return 2;
    }

    lt (args) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) < 0;
    }

    equals (args) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) === 0;
    }

    gt (args) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) > 0;
    }

    and (args) {
        return Cast.toBoolean(args.OPERAND1) && Cast.toBoolean(args.OPERAND2);
    }

    or (args) {
        return Cast.toBoolean(args.OPERAND1) || Cast.toBoolean(args.OPERAND2);
    }

    not (args) {
        return !Cast.toBoolean(args.OPERAND);
    }

    random (args) {
        return this._random(args.FROM, args.TO);
    }
    _random (from, to) { // used by compiler
        const nFrom = Cast.toNumber(from);
        const nTo = Cast.toNumber(to);
        const low = nFrom <= nTo ? nFrom : nTo;
        const high = nFrom <= nTo ? nTo : nFrom;
        if (low === high) return low;
        // If both arguments are ints, truncate the result to an int.
        if (Cast.isInt(from) && Cast.isInt(to)) {
            return low + Math.floor(Math.random() * ((high + 1) - low));
        }
        return (Math.random() * (high - low)) + low;
    }

    join (args) {
        return Cast.toString(args.STRING1) + Cast.toString(args.STRING2);
    }

    letterOf (args) {
        const index = Cast.toNumber(args.LETTER) - 1;
        const str = Cast.toString(args.STRING);
        // Out of bounds?
        if (index < 0 || index >= str.length) {
            return '';
        }
        return str.charAt(index);
    }

    length (args) {
        return Cast.toString(args.STRING).length;
    }

    contains (args) {
        const format = function (string) {
            return Cast.toString(string).toLowerCase();
        };
        return format(args.STRING1).includes(format(args.STRING2));
    }

    lettersOf (args) {
        return Cast.toString(args.STRING).substring(
            Cast.toNumber(args.LETTER1) - 1,
            Cast.toNumber(args.LETTER2)
        );
    }

    indexOf (args) {
        return Cast.toString(args.STRING)
            .toLowerCase()
            .indexOf(
                Cast.toString(args.SUBSTRING).toLowerCase()
            ) + 1;
    }

    replace (args) {
        const substring = Cast.toString(args.SUBSTRING).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return Cast.toString(args.STRING).replace(
            new RegExp(substring, 'gi'),
            Cast.toString(args.REPLACE)
        );
    }

    repeat (args) {
        const count = Math.floor(Cast.toNumber(args.REPEAT));
        return count < 0 || !Number.isFinite(count) ? '' : Cast.toString(args.STRING).repeat(count);
    }

    changeCase (args) {
        const string = Cast.toString(args.STRING);
        return args.CASE === 'uppercase' ? string.toUpperCase() : string.toLowerCase();
    }

    trim (args) {
        return Cast.toString(args.STRING).trim();
    }

    mod (args) {
        const n = Cast.toNumber(args.NUM1);
        const modulus = Cast.toNumber(args.NUM2);
        let result = n % modulus;
        // Scratch mod uses floored division instead of truncated division.
        if (result / modulus < 0) result += modulus;
        return result;
    }

    pi () {
        return Math.PI;
    }

    newline () {
        return '\n';
    }

    round (args) {
        return Math.round(Cast.toNumber(args.NUM));
    }

    mathop (args) {
        const operator = Cast.toString(args.OPERATOR).toLowerCase();
        const n = Cast.toNumber(args.NUM);
        switch (operator) {
        case 'abs': return Math.abs(n);
        case 'floor': return Math.floor(n);
        case 'ceiling': return Math.ceil(n);
        case 'sqrt': return Math.sqrt(n);
        case 'sin': return Math.round(Math.sin((Math.PI * n) / 180) * 1e10) / 1e10;
        case 'cos': return Math.round(Math.cos((Math.PI * n) / 180) * 1e10) / 1e10;
        case 'tan': return MathUtil.tan(n);
        case 'asin': return (Math.asin(n) * 180) / Math.PI;
        case 'acos': return (Math.acos(n) * 180) / Math.PI;
        case 'atan': return (Math.atan(n) * 180) / Math.PI;
        case 'ln': return Math.log(n);
        case 'log': return Math.log(n) / Math.LN10;
        case 'e ^': return Math.exp(n);
        case '10 ^': return Math.pow(10, n);
        }
        return 0;
    }
}

module.exports = Scratch3OperatorsBlocks;
