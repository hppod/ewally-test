const { addDays, formatISO } = require("../../utils/date")

const LENGTHS_BLOCKS = {
    First: 10,
    Second: 11,
    Third: 11,
    Fourth: 1,
    Fifth: 14
}
const BASE_DATE = "10/07/1997"

module.exports = async (req, res) => {
    try {
        const { isValid, message, digitableLine } = getDigitableLine(req.params)

        if (!isValid) {
            return res.status(400).json({ message: message })
        }

        const separatedDigitableLine = separateDigitableLine(digitableLine)
        console.log(separatedDigitableLine)

        const date = calculateExpirationDateFactor(separatedDigitableLine)
        console.log(date)

        const blocks = [separatedDigitableLine[0], separatedDigitableLine[1], separatedDigitableLine[2]]
        const dvs = checkValidatorDigitModule10(blocks)
        console.log(dvs)

        const { barCode, value } = assembleBarCode(separatedDigitableLine)
        console.log(barCode)
        console.log(barCode.length)

        return res.status(200).json({
            barCode: barCode,
            amount: value,
            expirationDate: date
        })
    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack })
    }
}

const getDigitableLine = params => {
    return verifyDigitableLine(params.digitableLine)
}

const verifyDigitableLine = digitableLine => {
    const response = {
        isValid: true,
        message: 'ok',
        digitableLine: digitableLine
    }

    if (digitableLine) {
        if (digitableLine.length > 47) {
            response.isValid = false
            response.message = 'digitable line incorrect, is longer'
        } else if (digitableLine.length < 47) {
            response.isValid = false
            response.message = 'digitable line incorrect, is shorter'
        }
    } else {
        response.isValid = false
        response.message = 'digitable line is null'
    }

    return response
}

const separateDigitableLine = digitableLine => {
    const sizeBlocks = Object.values(LENGTHS_BLOCKS)

    return sizeBlocks.map((size, index) => {
        const start = sizeBlocks.slice(0, index).reduce((acc, val) => acc + val, 0)
        return digitableLine.substr(start, size)
    })
}

const calculateExpirationDateFactor = digitableLineSeparated => {
    const dateExpiration = addDays({
        startDate: BASE_DATE,
        numberDaysToAdd: Number(getExpirationDateFactor(digitableLineSeparated[digitableLineSeparated.length - 1]))
    })
    return formatISO(dateExpiration)
}

const getExpirationDateFactor = fifthBlock => {
    return fifthBlock.substring(0, 4)
}

const checkValidatorDigitModule10 = blocks => {
    const possibleDvs = []
    const calculatedDvs = []
    const multipliedsBlocks = []
    let multiplier = 1

    for (let block of blocks) {
        const multipliedBlock = []
        possibleDvs.push(Number(block.substr(block.length - 1)))
        block = block.slice(0, -1)

        for (const char of block) {
            multiplier = multiplier === 1 ? 2 : 1
            multipliedBlock.push(...breakInDigits(char * multiplier))
        }

        multipliedsBlocks.push(multipliedBlock)
    }

    for (const block of multipliedsBlocks) {
        const sumBlock = block.reduce((acc, value) => acc + value, 0)
        const nextTen = Math.ceil(sumBlock / 10) * 10
        calculatedDvs.push(nextTen - sumBlock === 10 ? 0 : nextTen - sumBlock)
    }

    return {
        possibleDvs,
        calculatedDvs,
        dvsAreEquals: calculatedDvs.every((dv, index) => dv === possibleDvs[index])
    }
}

const breakInDigits = number => {
    const digits = number.toString().split('')
    return digits.map(n => Number(n))
}

const assembleBarCode = separatedDigitableLine => {
    const blocks = []
    let possibleDv, value = null

    for (let [indexBlock, block] of separatedDigitableLine.entries()) {
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
            value = numberToReal(Number(valueBarCode).toString())
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

    let multiplier = 2

    let resultMultiplierBarCode = 0

    for (let i = barCodeWithoutDv.length; i >= 1; i--) {
        const num = Number(barCodeWithoutDv[i - 1])
        resultMultiplierBarCode += num * multiplier
        multiplier = multiplier === 9 ? 2 : multiplier + 1
    }

    let possibleDvBarCode = (11 - (resultMultiplierBarCode % 11))

    if (possibleDvBarCode === 0 || possibleDvBarCode === 10 || possibleDvBarCode === 11) {
        possibleDvBarCode = 1
    }

    if (possibleDv === possibleDvBarCode) {
        barCodeSequence.splice(2, 0, 'verifierBarCode')

        return {
            barCode: barCodeSequence.map((name) => {
                const block = blocks.find((b) => b.name === name)
                if (block) {
                    return block.value
                }
            }).filter((n) => n).join(''),
            value: value
        }
    }

    return null
}

const numberToReal = number => {
    number = typeof number === 'string' ? number : number.toString()
    const real = number.substr(0, number.length - 2)
    const cents = number.substr(number.length - 2, 2)
    return Number(`${real}.${cents}`)
}