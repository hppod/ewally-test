const { breakInDigits } = require("./numbers")

const separateDigitableLine = ({ sizeBlocks, digitableLine }) => {
    if (sizeBlocks instanceof Array) {
        return sizeBlocks.map((size, index) => {
            const start = sizeBlocks.slice(0, index).reduce((acc, value) => acc + value, 0)
            return digitableLine.substr(start, size)
        })
    }

    return undefined
}

const calculateModule10 = ({ digitableLine, multiplier = 2, sumBlock = 0 }) => {
    for (let i = digitableLine.length; i >= 1; i--) {
        const numberMultiplied = breakInDigits(Number(digitableLine[i - 1]) * multiplier)
        sumBlock += numberMultiplied.reduce((acc, value) => acc + value, 0)
        multiplier = multiplier === 2 ? 1 : 2
    }

    return {
        multiplier: multiplier,
        sumBlock: sumBlock
    }
}

const calculateModule11 = ({ digitableLine, multiplier = 2, sumBlock = 0 }) => {
    for (let i = digitableLine.length; i >= 1; i--) {
        const numberMultiplied = Number(digitableLine[i - 1]) * multiplier
        sumBlock += numberMultiplied
        multiplier = multiplier === 9 ? 2 : multiplier + 1
    }

    return {
        multiplier: multiplier,
        sumBlock: sumBlock
    }
}

const removeSpecialCharacters = digitableLine => {
    return digitableLine.replace(/[^\w\s]/gi, '')
}

const checkIfHasLetters = digitableLine => {
    const letters = []

    for (const char of digitableLine) {
        letters.push(isNaN(Number(char)))
    }

    return letters.some(isLetter => isLetter)
}

module.exports = {
    separateDigitableLine,
    calculateModule10,
    calculateModule11,
    removeSpecialCharacters,
    checkIfHasLetters
}