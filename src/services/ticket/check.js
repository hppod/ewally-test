module.exports = async (req, res) => {
    try {
        return res.status(200).json({ message: 'ok' })
    } catch (error) {
        return res.status(500).json({ message: error.message, stack: error.stack })
    }
}