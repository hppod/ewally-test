const { addDays, formatISO } = require("../../../utils/date")
const { separateDigitableLine } = require("../../../utils/digitableLine")

const LENGTHS_BLOCKS = {
    First: 10,
    Second: 11,
    Third: 11,
    Fourth: 1,
    Fifth: 14
}
const BASE_DATE = "10/07/1997"

const assembleInformationsByBank = digitableLine => {
    const response = {
        results: null,
        message: 'ok',
        isValid: true
    }

    const { possibleDvs, blocks } = getPossibleDvsFromDigitableLine(digitableLine)

    if (checkIfDvsItsCorrect({
        digitableLineBreaked: [blocks[2], blocks[1], blocks[0]],
        module: 10,
        possibleDvs: possibleDvs
    })) {
        const results = assembleInformationsByDigitableLine(blocks)

        if (results) {
            response.results = results
        } else {
            response.message = 'dv bar code is incorrect'
            response.isValid = false
        }
    } else {
        response.message = 'dv blocks is incorrect'
        response.isValid = false
    }

    return response
}

const getPossibleDvsFromDigitableLine = digitableLine => {
    const blocks = separateDigitableLine({
        sizeBlocks: Object.values(LENGTHS_BLOCKS),
        digitableLine: digitableLine
    })
    const dvs = blocks.map((value, index) => {
        if ([0, 1, 2].includes(index)) {
            return Number(value.substr(value.length - 1))
        }
    }).filter(n => n !== undefined)

    return {
        possibleDvs: dvs,
        blocks: blocks
    }
}

const checkIfDvsItsCorrect = ({ digitableLineBreaked, module, possibleDvs }) => {
    let multiplier = 0
    let sumBlock = 0
    const dvs = []

    for (let block of digitableLineBreaked) {
        if (module === 10) {
            block = block.slice(0, -1)
            const results = calculateModule10({
                digitableLine: block,
                multiplier: multiplier === 0 ? 2 : multiplier,
                sumBlock: sumBlock
            })

            multiplier = results.multiplier

            const nextTen = Math.ceil(results.sumBlock / 10) * 10
            dvs.unshift(nextTen - results.sumBlock === 10 ? 0 : nextTen - results.sumBlock)
        } else if (module === 11) {
            const results = calculateModule11({
                digitableLine: block,
                multiplier: multiplier === 0 ? 2 : multiplier,
                sumBlock: sumBlock
            })

            const rest = results.sumBlock % 11
            const sub = 11 - rest

            if (sub === 0 || sub === 10 || sub === 11) {
                dvs.push(0)
            } else {
                dvs.push(sub)
            }
        }
    }

    return dvs.every((value, index) => value === possibleDvs[index])
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

const assembleInformationsByDigitableLine = digitableLine => {
    const { barCodeWithoutDv, possibleDv } = assembleBarCodeAndGetDv(digitableLine)

    if (checkIfDvsItsCorrect({
        digitableLineBreaked: [barCodeWithoutDv],
        module: 11,
        possibleDvs: [possibleDv]
    })) {
        const { amount, expirationDate } = assembleAmountAndExpirationDateFromDigitableLine(digitableLine)
        const barCode = `${barCodeWithoutDv.substr(0, 4)}${possibleDv}${barCodeWithoutDv.substr(4, barCodeWithoutDv.length - 1)}`

        return {
            barCode: barCode,
            amount: amount,
            expirationDate: expirationDate
        }
    }

    return false
}

const assembleBarCodeAndGetDv = digitableLine => {
    const blocks = []
    let possibleDv = null

    for (let [indexBlock, block] of digitableLine.entries()) {
        if (block.length === 10) {
            const codeBank = block.substr(0, 3)
            const codeCurrency = block.substr(3, 1)
            const positionsBarCode = block.substr(4, 5)
            blocks.push({ name: 'codeBank', value: codeBank })
            blocks.push({ name: 'codeCurrency', value: codeCurrency })
            blocks.push({ name: 'barCodeFirstBlock', value: positionsBarCode })
        } else if (block.length === 11) {
            block = block.slice(0, -1)
            blocks.push({
                name: indexBlock === 1 ? 'barCodeSecondBlock' : 'barCodeThirdBlock',
                value: block
            })
        } else if (block.length === 1) {
            possibleDv = Number(block.toString())
            blocks.push({ name: 'verifierBarCode', value: block })
        } else {
            const expirationDateFactor = block.substr(0, 4)
            const valueBarCode = block.substr(4, block.length - 1)
            blocks.push({
                name: 'expirationDateFactor',
                value: expirationDateFactor
            })
            blocks.push({ name: 'valueBarCode', value: valueBarCode })
        }
    }

    const barCodeSequence = [
        'codeBank',
        'codeCurrency',
        'expirationDateFactor',
        'valueBarCode',
        'barCodeFirstBlock',
        'barCodeSecondBlock',
        'barCodeThirdBlock'
    ]

    const barCodeWithoutDv = barCodeSequence.map((name) => {
        const block = blocks.find((b) => b.name === name)
        if (block) {
            return block.value
        }
    }).filter((n) => n).join('')

    return {
        barCodeWithoutDv: barCodeWithoutDv,
        possibleDv: possibleDv
    }
}

const assembleAmountAndExpirationDateFromDigitableLine = digitableLine => {
    const block = digitableLine[digitableLine.length - 1]
    const dateExpiration = addDays({
        startDate: BASE_DATE,
        numberDaysToAdd: Number(getExpirationDateFactor(block))
    })

    return {
        amount: numberToReal(Number(block.substr(4, block.length - 1)).toString()),
        expirationDate: formatISO(dateExpiration)
    }
}

const getExpirationDateFactor = fifthBlock => {
    return fifthBlock.substring(0, 4)
}

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
    assembleInformationsByBank
}