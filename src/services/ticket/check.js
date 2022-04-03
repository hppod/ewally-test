const { assembleInformationsByBank } = require("./functions/boleto")
const { assembleInformationsByCovenant } = require("./functions/convenio")

const TYPES = {
    Bank: 'bank',
    Covenant: 'covenant'
}

module.exports = async (req, res) => {
    try {
        const { digitableLine, type, message, isValid } = verifyDigitableLine(req.params.digitableLine)

        if (!isValid) {
            return res.status(400).json({ message: message })
        }

        const response = assembleInformations({
            digitableLine: digitableLine,
            type: type
        })

        if (!response.isValid) {
            return res.status(400).json({ message: response.message })
        }

        return res.status(200).json(response.results)
    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack })
    }
}

const verifyDigitableLine = digitableLine => {
    const desiredDigitableLine = removeSpecialCharacters(digitableLine)
    const response = {
        digitableLine: desiredDigitableLine,
        type: desiredDigitableLine.length === 47 ? TYPES.Bank : desiredDigitableLine.length === 48 ? TYPES.Covenant : undefined,
        message: 'ok',
        isValid: true
    }

    if (desiredDigitableLine !== undefined && desiredDigitableLine !== null && desiredDigitableLine !== '') {
        if (checkIfHasLetters(desiredDigitableLine)) {
            response.isValid = false
            response.message = 'The typeable line must consist of numbers only. The entered typeable line contains letters'
        } else {
            if (response.type === undefined) {
                response.isValid = false
                response.message = `It was not possible to set your boleto type because the line entered is incorrect. For bank slips, the typeable line must contain 47 characters. For agreement slips, the typeable line must contain 48 characters. The typed line entered contains ${desiredDigitableLine.length} characters.`
            }
        }
    } else {
        response.isValid = false
        response.message = 'It is mandatory to enter a typeable line'
    }


    return response
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

const assembleInformations = ({ digitableLine, type }) => {
    if (type === TYPES.Bank) {
        return assembleInformationsByBank(digitableLine)
    } else {
        return assembleInformationsByCovenant(digitableLine)
    }
}