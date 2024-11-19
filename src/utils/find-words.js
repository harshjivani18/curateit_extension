export const findWords = (text) => {
    const allWords    = text.toLowerCase().replace(/[^A-Za-z]/gm, " ").split(/\s+/gm)
    const wordsObj    = {}
    allWords.filter((o) => { return o !== "" }).forEach((w) => {
        if (wordsObj[w]) {
            wordsObj[w]++
        }
        else if (w.length > 5) {
            wordsObj[w] = 1
        }
    })
    const sortedValues = Object.values(wordsObj).sort((a, b) => b - a);
    const maxN         = sortedValues[5 - 1]
    const fiveHighest  = Object.entries(wordsObj).reduce((wordsObj, [k, v]) => v >= maxN ? { ...wordsObj, [k]: v } : wordsObj, {});
    return Object.keys(fiveHighest).map((o) => { return o })
}