let start = Date.now()
const fs = require("fs");

let originalVukkyList = JSON.parse(fs.readFileSync("vukkies.json").toString())

let allIds = [];
let allVukkies = []

const rarityMap = {
    "1": "common",
    "2": "uncommon",
    "3": "rare",
    "4": "mythical",
    "5": "godly",
    "6": "bukky",
    "7": "unique",
    "pukky": "pukky"
}

Object.keys(originalVukkyList.rarity).forEach(rarityKey => {
    let rarity = originalVukkyList.rarity[rarityKey];
    Object.keys(rarity).forEach(vukkyId => {
        allIds.push(vukkyId)
        let vukky = rarity[vukkyId];
        vukky.id = Number(vukkyId);
        vukky.rarity = rarityMap[rarityKey];

        let parsedVukky = {
            id: Number(vukkyId),
            imageURL: vukky?.url,
            name: vukky?.name,
            description : vukky?.description,
            rarity: rarityMap[rarityKey],
            creator: vukky?.creator || "Unknown",
            audioURL: vukky?.audio
        }
        allVukkies.push(parsedVukky)
    })
})

console.log(`Done in ${Date.now() - start}ms... Writing to temp.json`)

allVukkies.sort((a, b) => a.id - b.id)
allIds.sort((a, b) => a - b)

let finalVukkies = []

allVukkies.forEach(vukky => {
    if (vukky.name !== "DELETED VUKKY") {
        vukky.id = finalVukkies.length + 1;
        finalVukkies.push(vukky)
    }
})

let tempJson/* : { nextFreeId: number, vukkies: Vukky[]}*/ = {
    nextFreeId: finalVukkies.length + 1,
    vukkies: finalVukkies
}

fs.writeFileSync("old.vukkies.json", JSON.stringify(originalVukkyList, null, 4))
fs.writeFileSync("vukkies.json", JSON.stringify(tempJson, null, 4))