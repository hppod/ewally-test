const separateDigitableLine = ({ sizeBlocks, digitableLine }) => {
    if (sizeBlocks instanceof Array) {
        return sizeBlocks.map((size, index) => {
            const start = sizeBlocks.slice(0, index).reduce((acc, value) => acc + value, 0)
            return digitableLine.substr(start, size)
        })
    }

    return undefined
}

module.exports = {
    separateDigitableLine
}