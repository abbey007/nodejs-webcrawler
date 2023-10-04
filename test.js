const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let resultArr = []

async function fetchHTML(url, depth) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const links = $("a")
    const images = $("img")
    let arr = [];

    links.each((index, value) => {
        let link = $(value).attr("href");
        if (link && link.indexOf("https") > -1 && link.indexOf("addtoany") == -1)
            arr.push($(value).attr("href"))
    })

    images.each((index, element) => {
        const imageUrl = $(element).attr('src');
        let json = {
            "imageUrl": imageUrl,
            "sourceUrl": url,
            "depth": depth
        }
        resultArr.push(json);
    })
   
    for (let key in arr) {
        if (depth > 0){
            console.log(arr[key])
            await fetchHTML(arr[key], depth - 1)
        }
    }

}

async function asyncCall(link, depth) {
    //console.log(process.argv)
    await fetchHTML(link, parseInt(depth))
    fs.writeFile("result.json", JSON.stringify(resultArr, null, 4), function (err) {
        if (err) throw err;
        console.log('complete');
    }
    );
}
asyncCall(process.argv[2], process.argv[3])


