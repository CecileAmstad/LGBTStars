// Sets the MongoDB Database options

module.exports = {

    local:
    {
        name: "LGBTStars",
        url: "mongodb://localhost/LGBTStars",
        port: 27017
    },

    localtest:
    {
        name: "LGBTStars",
        url: "mongodb://localhost/LGBTStarsTest",
        port: 27017
    }

};
