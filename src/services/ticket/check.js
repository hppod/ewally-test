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
    const response = {
        digitableLine: digitableLine,
        type: digitableLine.length === 47 ? TYPES.Bank : digitableLine.length === 48 ? TYPES.Covenant : undefined,
        message: 'ok',
        isValid: true
    }

    if (digitableLine) {
        if (checkIfHasLetters(digitableLine)) {
            response.isValid = false
            response.message = 'The typeable line must consist of numbers only. The entered typeable line contains letters'
        } else {
            if (response.type === TYPES.Bank) {
                if (digitableLine.length > 47) {
                    response.isValid = false
                    response.message = 'For bank slips, the typeable line must contain 47 characters. The entered typeable line contains extra characters'
                } else if (digitableLine.length < 47) {
                    response.isValid = false
                    response.message = 'For bank slips, the typeable line must contain 47 characters. The entered typeable line contains fewer characters'
                }
            } else if (response.type === TYPES.Covenant) {
                if (digitableLine.length > 48) {
                    response.isValid = false
                    response.message = 'For agreement slips, the typeable line must contain 48 characters. The entered typeable line contains extra characters'
                } else if (digitableLine.length < 48) {
                    response.isValid = false
                    response.message = 'For agreement slips, the typeable line must contain 48 characters. The entered typeable line contains fewer characters'
                }
            } else {
                response.isValid = false
                response.message = 'It was not possible to set the type of your ticket because the typed line is incorrect'
            }
        }
    } else {
        response.isValid = false
        response.message = 'It is mandatory to enter a typeable line'
    }


    return response
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