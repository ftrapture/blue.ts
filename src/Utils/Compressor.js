class Compressor {
    static compress(input) {
        return Buffer.from(JSON.stringify(input)).toString('base64');
    }

    static decompress(compressed) {
        const jsonString = Buffer.from(compressed, 'base64').toString('utf-8');
        return JSON.parse(jsonString);
    }
}

module.exports = Compressor;
