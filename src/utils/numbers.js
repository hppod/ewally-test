const breakInDigits = number => {
    const digits = number.toString().split('')
    return digits.map(n => Number(n))
}

const numberToReal = number => {
    number = typeof number === 'string' ? number : number.toString()
    const real = number.substr(0, number.length - 2)
    const cents = number.substr(number.length - 2, 2)
    return Number(`${real}.${cents}`)
}

module.exports = {
    breakInDigits,
    numberToReal
}