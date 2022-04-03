const index = require('../src/utils/date')

describe('Dates', () => {
    it('Adding 10 days to date', () => {
        const result = index.addDays({
            startDate: '2022-04-02',
            numberDaysToAdd: 10
        })
        expect(result).toEqual(new Date('2022-04-12'))
    })
    
    it('Adding 30 days to date', () => {
        const result = index.addDays({
            startDate: '2022-04-02',
            numberDaysToAdd: 30
        })
        expect(result).toEqual(new Date('2022-05-02'))
    })

    it('Format date ISO', () => {
        const result = index.formatISO(new Date('2022-04-02'))
        expect(result).toEqual('2022-04-02')
    })
})