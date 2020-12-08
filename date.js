
exports.getDate = function(){
     const today = new Date();

     const options = {
         weekday: "long",
         day: "numeric",
         month: "long"
     }

     const day = today.toLocaleDateString("en-Uk", options);
     return day;
}

exports.getDay = function (){
    const today = new Date();

    const options = {
        weekday: "long",
    }

    return today.toLocaleDateString("en-US", options);
}