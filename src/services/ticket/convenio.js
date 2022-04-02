const LENGTHS_BLOCKS = {
    ProductIdentification: 1,
    SegmentIdentification: 1,
    RealIdentification: 1,
    VerifierDigit: 1,
    Value: 11,
    IdentifyCompany: 4,
    FreeSpace: 25
}

module.exports = async (req, res) => {
    try {
        const { digitableLine } = req.params
        let messageError = null

        if (digitableLine.length > 48) {
            messageError = 'digitable line is incorrect, is longer'
        } else if (digitableLine.length < 48) {
            messageError = 'digitable line is incorrect, is shorter'
        } else {
            const { possibleDvs, blocks, digitableLineWithoutDvs } = removeDvsFromDigitableLine(digitableLine)
            const { valueReference, module } = identifyValueReferenceAndModule(digitableLineWithoutDvs)
            identifySegment(digitableLineWithoutDvs)

            if (checkIfDvsItsCorrect({
                digitableLineBreaked: blocks,
                module: module,
                possibleDvs: possibleDvs
            })) {
                const response = assembleInformationsByDigitableLine({
                    digitableLine: digitableLineWithoutDvs,
                    module: module,
                    valueReference: valueReference
                })

                if (response) {
                    return res.status(200).json(response)
                } else {
                    messageError = 'dv bar code is incorrect'
                }
            } else {
                messageError = 'dv is incorrect'
            }
        }

        return res.status(400).json({ message: messageError })
    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack })
    }
}

const removeDvsFromDigitableLine = digitableLine => {
    const blocks = breakDigitableLine(digitableLine)
    const dvs = blocks.filter(value => value.length === 1).map(n => Number(n))
    const data = blocks.filter(value => value.length > 1)

    return {
        possibleDvs: dvs,
        blocks: data,
        digitableLineWithoutDvs: data.join('')
    }
}

const breakDigitableLine = digitableLine => {
    const sizeBlocks = [11, 1, 11, 1, 11, 1, 11, 1]

    return sizeBlocks.map((size, index) => {
        const start = sizeBlocks.slice(0, index).reduce((acc, value) => acc + value, 0)
        return digitableLine.substr(start, size)
    })
}

const breakInDigits = number => {
    const digits = number.toString().split('')
    return digits.map(n => Number(n))
}

const identifySegment = digitableLine => {
    const digitSegment = Number(digitableLine.substr(1, 1))

    if (digitSegment === 6) {
        LENGTHS_BLOCKS.IdentifyCompany = 8
        LENGTHS_BLOCKS.FreeSpace = 21
    } else {
        LENGTHS_BLOCKS.IdentifyCompany = 4
        LENGTHS_BLOCKS.FreeSpace = 25
    }

    return digitSegment
}

const identifyValueReferenceAndModule = digitableLine => {
    const response = {
        valueReference: Number(digitableLine.substr(2, 1)),
        module: null
    }

    if ([6, 7].includes(response.valueReference)) {
        response.module = 10
    } else if ([8, 9].includes(response.valueReference)) {
        response.module = 11
    }

    return response
}

const checkIfDvsItsCorrect = ({ digitableLineBreaked, module, possibleDvs }) => {
    let multiplier, sumBlock = 0
    const dvs = []

    for (const block of digitableLineBreaked) {
        if (module === 10) {
            const results = calculateModule10({
                digitableLine: block,
                multiplier: multiplier === 0 ? 2 : multiplier,
                sumBlock: sumBlock
            })

            dvs.push((10 - (results.sumBlock % 10)))
        } else {
            const results = calculateModule11({
                digitableLine: block,
                multiplier: multiplier === 0 ? 2 : multiplier,
                sumBlock: sumBlock
            })

            const rest = results.sumBlock % 11

            if (rest === 0 || rest === 1) {
                dvs.push(0)
            } else if (rest === 10) {
                dvs.push(1)
            } else {
                dvs.push((11 - rest))
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

const assembleInformationsByDigitableLine = ({ digitableLine, module, valueReference }) => {
    const { digitableLineWithoutDv, digitableLineWithoutDvBlocks, possibleDv } = assembleBarCodeWithoutDv(digitableLine)
    const barCode = assembleBarCode({
        digitableLine: digitableLineWithoutDv,
        module: module,
        possibleDv: possibleDv
    })

    if (barCode) {
        const amount = assembleAmount(digitableLineWithoutDvBlocks, valueReference)
        const expirationDate = assembleExpirationDate(digitableLineWithoutDvBlocks)

        return {
            amount: amount ? amount : 'not defined',
            expirationDate: expirationDate ? expirationDate : 'not defined',
            barCode: barCode
        }
    }

    return false
}

const assembleBarCode = ({ digitableLine, module, possibleDv }) => {
    const dvIsCorrect = checkIfDvsItsCorrect({
        digitableLineBreaked: [digitableLine],
        module: module,
        possibleDvs: [possibleDv]
    })

    if (dvIsCorrect) {
        return `${digitableLine.substr(0, 3)}${possibleDv}${digitableLine.substr(3, digitableLine.length - 1)}`
    }

    return false
}

const assembleBarCodeWithoutDv = digitableLine => {
    let possibleDv = null
    const sizeBlocks = Object.values(LENGTHS_BLOCKS)
    const barCodeWithDv = sizeBlocks.map((size, index) => {
        const start = sizeBlocks.slice(0, index).reduce((acc, val) => acc + val, 0)
        return digitableLine.substr(start, size)
    })
    const barCodeWithoutDv = barCodeWithDv.map((value, index) => {
        if (index === 3) {
            possibleDv = Number(value)
        }

        return index !== 3 ? value : undefined
    }).filter(n => n)

    return {
        digitableLineWithoutDvBlocks: barCodeWithoutDv,
        digitableLineWithoutDv: barCodeWithoutDv.join(''),
        possibleDv: possibleDv
    }
}

const assembleAmount = (digitableLineWithoutDvBlocks, valueReference) => {
    if (valueReference === 6 || valueReference === 8) {
        const valueBarCode = digitableLineWithoutDvBlocks[3]
        return numberToReal(Number(valueBarCode).toString())
    }

    return false
}

const numberToReal = number => {
    number = typeof number === 'string' ? number : number.toString()
    const real = number.substr(0, number.length - 2)
    const cents = number.substr(number.length - 2, 2)
    return Number(`${real}.${cents}`)
}

const assembleExpirationDate = digitableLineWithoutDvBlocks => {
    const freeSpace = digitableLineWithoutDvBlocks[digitableLineWithoutDvBlocks.length - 1]
    const possibleExpirationDate = `${freeSpace.substr(0, 4)}-${freeSpace.substr(4, 2)}-${freeSpace.substr(6, 2)}`
    const dateIsValid = new Date(possibleExpirationDate)
    return dateIsValid instanceof Date ? false : possibleExpirationDate
}