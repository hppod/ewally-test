const addDays = ({ startDate, numberDaysToAdd }) => {
    startDate = new Date(startDate)
    const dateNumber = new Date(Number(startDate))
    return new Date(dateNumber.setDate(startDate.getDate() + numberDaysToAdd))
}

const formatISO = date => {
    return date.toISOString().split('T')[0]
}

module.exports = {
    addDays,
    formatISO
}