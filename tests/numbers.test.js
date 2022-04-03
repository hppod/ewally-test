const index = require('../src/utils/numbers')

describe('Numbers', () => {
    it('Break number with two digits in separeted digits', () => {
        const result = index.breakInDigits(18)
        expect(result).toEqual(expect.arrayContaining([1, 8]))
    })

    it('Break number with one digit in separeted digits', () => {
        const result = index.breakInDigits(1)
        expect(result).toEqual(expect.arrayContaining([1]))
    })

    it('Transform number string without cents in Real Currency', () => {
        const result = index.numberToReal('0000005')
        expect(result).toEqual(0.05)
    })

    it('Transform number string with cents in Real Currency', () => {
        const result = index.numberToReal('0001025')
        expect(result).toEqual(10.25)
    })
})