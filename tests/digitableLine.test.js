const index = require('../src/utils/digitableLine')

describe('Digitable Line', () => {
    it('Separating digitable line in format of bank title', () => {
        const ARR_EXPECTED = ['2609023300', '39354770719', '58200000006', '8', '89280000111184']
        const result = index.separateDigitableLine({
            sizeBlocks: [10, 11, 11, 1, 14],
            digitableLine: '26090233003935477071958200000006889280000111184'
        })
        expect(result).toEqual(expect.arrayContaining(ARR_EXPECTED))
    })

    it('Separating digitable line in format of covenant title', () => {
        const ARR_EXPECTED = ['81660000007', '8', '92182103202', '3', '20315009000', '9', '87154520000', '2']
        const result = index.separateDigitableLine({
            sizeBlocks: [11, 1, 11, 1, 11, 1, 11, 1],
            digitableLine: '816600000078921821032023203150090009871545200002'
        })
        expect(result).toEqual(expect.arrayContaining(ARR_EXPECTED))
    })

    it('Not passing size blocks to separate digitable line', () => {
        const result = index.separateDigitableLine({
            sizeBlocks: '',
            digitableLine: '816600000078921821032023203150090009871545200002'
        })
        expect(result).toEqual(undefined)
    })

    it('Calculating module 10 starting multiplier 2 and sumBlock 0', () => {
        const OBJ_EXPECTED = { multiplier: 1, sumBlock: 30 }
        const result = index.calculateModule10({
            digitableLine: '260902330',
            multiplier: 2,
            sumBlock: 0
        })
        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('Calculating module 10 starting multiplier 2 and sumBlock 20', () => {
        const OBJ_EXPECTED = { multiplier: 1, sumBlock: 50 }
        const result = index.calculateModule10({
            digitableLine: '260902330',
            multiplier: 2,
            sumBlock: 20
        })
        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('Calculating module 10 starting multiplier 1 and sumBlock 0', () => {
        const OBJ_EXPECTED = { multiplier: 2, sumBlock: 27 }
        const result = index.calculateModule10({
            digitableLine: '260902330',
            multiplier: 1,
            sumBlock: 0
        })
        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('Calculating module 10 starting multiplier 1 and sumBlock 20', () => {
        const OBJ_EXPECTED = { multiplier: 2, sumBlock: 47 }
        const result = index.calculateModule10({
            digitableLine: '260902330',
            multiplier: 1,
            sumBlock: 20
        })
        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('Calculating module 11 starting multiplier 2 and sumBlock 0', () => {
        const OBJ_EXPECTED = { multiplier: 3, sumBlock: 152 }
        const result = index.calculateModule11({
            digitableLine: '260902330',
            multiplier: 2,
            sumBlock: 0
        })
        expect(result).toMatchObject(OBJ_EXPECTED)
    })

    it('Remove special characters from string and return values', () => {
        const result = index.removeSpecialCharacters('123654.2665')
        expect(result).toEqual('1236542665')
    })

    it('Remove special characters from string and return null', () => {
        const result = index.removeSpecialCharacters('.,-')
        expect(result).toEqual('')
    })

    it('Check if has letters on digitable line - false', () => {
        const result = index.checkIfHasLetters('982134972')
        expect(result).toEqual(false)
    })

    it('Check if has letters on digitable line - true', () => {
        const result = index.checkIfHasLetters('9821349ds72')
        expect(result).toEqual(true)
    })
})