const index = require('../src/services/ticket/functions/convenio')

describe('Convenio', () => {
    it('A valid digitable line', () => {
        const OBJ_EXPECTED = {
            results: {
                barCode: '83630000011252200403163347688880310100315433',
                amount: 1125.22,
                expirationDate: 'not defined'
            },
            message: 'ok',
            isValid: true
        }
        const result = index.assembleInformationsByCovenant('836300000111252200403167334768888037101003154339')

        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('A digitable line with dv is incorrect', () => {
        const OBJ_EXPECTED = {
            results: null,
            message: 'dv is incorrect',
            isValid: false
        }
        const result = index.assembleInformationsByCovenant('836900000111252200403167334768888037101003154339')

        expect(result).toMatchObject(OBJ_EXPECTED)
    })
})