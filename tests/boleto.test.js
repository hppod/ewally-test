const index = require('../src/services/ticket/functions/boleto')

describe('Boleto', () => {
    it('A valid digitable line', () => {
        const OBJ_EXPECTED = {
            results: {
                barCode: '26098892800001111840233039354770715820000000',
                amount: 1111.84,
                expirationDate: '2022-03-18'
            },
            message: 'ok',
            isValid: true
        }
        const result = index.assembleInformationsByBank('26090233003935477071958200000006889280000111184')

        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('A digitable line with DV blocks are incorrect', () => {
        const OBJ_EXPECTED = {
            results: null,
            message: 'dv blocks is incorrect',
            isValid: false
        }
        const result = index.assembleInformationsByBank('26090233073935477071658200000008889280000111184')

        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('A digitable line with DV bar code is incorrect', () => {
        const OBJ_EXPECTED = {
            results: null,
            message: 'dv bar code is incorrect',
            isValid: false
        }
        const result = index.assembleInformationsByBank('26090233003935477071958200000006489280000111184')

        expect(result).toMatchObject(OBJ_EXPECTED)
    })
})