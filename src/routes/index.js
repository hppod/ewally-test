module.exports = app => {
    app.use('/boleto', require('./ticket'))
}