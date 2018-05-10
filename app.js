const axios = require("axios");
const yargs = require("yargs");
const keys = require("./config/config.js");

// configure top-level options using .options (because there aren't multiple arguments)
const argv = yargs
    .options({
        a: {
            demand: true,
            alias: 'address',
            describe: "Get the data from this address",
            string: true
        }
    })
    .help()
    .alias("help", "h") // add an alias for the help command (the h flag)
    .argv;

const encodedAddress = encodeURI(argv.address);
const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${keys.google}`

axios.get(geocodeURL).then((response) => {
    // success handler
    if(response.data.status === "ZERO_RESULTS"){
        throw new Error("Unable to connect to the Google API Servers.");
    }
        // This won't run if new error is thrown...
        var lat = response.data.results[0].geometry.location.lat;
        var lng = response.data.results[0].geometry.location.lng;
        var weatherUrl = `https://api.darksky.net/forecast/${keys.darksky}/${lat},${lng}/`

        console.log(response.data.results[0].formatted_address);

        // Return another promise, using the next database request, for .then chaining...
        return axios.get(weatherUrl);

}).then((response) => {
    var temperature = response.data.currently.temperature;
    var actualTemperature = response.data.currently.apparentTemperature;

    // Final log.
    console.log("Temperature: ",temperature,"\nActual Temperature: ",actualTemperature);

}).catch((e) => {
    if(e.code === "ENOTFOUND"){
        console.log("Unable to connect to the API Servers.")
    } else {
        console.log("Error: \n", e.message);
    }
});
