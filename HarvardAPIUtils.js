module.exports.classifications = [
    "All Classifications",
    "Paintings",
    "Prints",
    "Photographs",
    "Sculpture",
    "Drawings",
    "Textiles",
    "Ceramics",
    "Metalwork",
    "Jewelry",
    "Furniture",
    "Books",
    "Manuscripts",
    "Glass",
    "Arms and Armor",
    "Coins",
    "Medals"
];

module.exports.cultures = [
    "All Cultures",
    "American",
    "Chinese",
    "Dutch",
    "Egyptian",
    "English",
    "French",
    "German",
    "Greek",
    "Italian",
    "Japanese",
    "Korean",
    "Mexican",
    "Persian",
    "Roman",
    "Spanish"
];

module.exports.tryGetImage = (images) => {
    if (images === undefined) return "";

    for (let image of images) {
        if (image.baseimageurl !== "") {
            return image.baseimageurl;
        }
    }

    return "";
}

module.exports.shortenTitle = (title) => {
    if (title.length > 65) {
        return title.slice(0, 63) + '..';
    }
    else {
        return title;
    }
}