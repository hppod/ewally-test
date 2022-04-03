const supertest = require('supertest')
const app = require('../app')
const request = supertest(app)

describe('Check titles', () => {
    it('[GET] => A valid digitable line bank', async () => {
        await request.get('/boleto/26090233003935477071958200000006889280000111184')
            .expect(200, {
                barCode: '26098892800001111840233039354770715820000000',
                amount: 1111.84,
                expirationDate: '2022-03-18'
            })
    })

    it('[GET] => A digitable line bank with DV blocks are incorrect', async () => {
        await request.get('/boleto/26090233073935477071658200000008889280000111184')
            .expect(400, {
                message: 'dv blocks is incorrect'
            })
    })

    it('[GET] => A digitable line bank with DV bar code is incorrect', async () => {
        await request.get('/boleto/26090233003935477071958200000006489280000111184')
            .expect(400, {
                message: 'dv bar code is incorrect'
            })
    })

    it('[GET] => A valid digitable line covenant', async () => {
        await request.get('/boleto/836300000111252200403167334768888037101003154339')
            .expect(200, {
                barCode: '83630000011252200403163347688880310100315433',
                amount: 1125.22,
                expirationDate: 'not defined'
            })
    })

    it('[GET] => A digitable line covenant with DV blocks are incorrect', async () => {
        await request.get('/boleto/836900000111252200403167334768888037101003154339')
            .expect(400, {
                message: 'dv is incorrect'
            })
    })

    it('[GET] => A digitable line is longer', async () => {
        await request.get('/boleto/2609023300393547707195820000000648928000011118495')
            .expect(400, {
                message: 'It was not possible to set your boleto type because the line entered is incorrect. For bank slips, the typeable line must contain 47 characters. For agreement slips, the typeable line must contain 48 characters. The typed line entered contains 49 characters.'
            })
    })

    it('[GET] => A digitable line is shorter', async () => {
        await request.get('/boleto/260902330039354770719582000000064892800001111')
            .expect(400, {
                message: 'It was not possible to set your boleto type because the line entered is incorrect. For bank slips, the typeable line must contain 47 characters. For agreement slips, the typeable line must contain 48 characters. The typed line entered contains 45 characters.'
            })
    })

    it('[GET] => A digitable line with letters', async () => {
        await request.get('/boleto/260902330039354770719582000000064892800001111jcd')
            .expect(400, {
                message: 'The typeable line must consist of numbers only. The entered typeable line contains letters'
            })
    })

    it('[GET] => A digitable line with special characters', async () => {
        await request.get('/boleto/-,')
            .expect(400, {
                message: 'It is mandatory to enter a typeable line'
            })
    })

    it('[GET] => A digitable line is null', async () => {
        await request.get('/boleto/')
            .expect(404)
    })
})