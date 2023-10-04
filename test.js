const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let resultArr = []

const axiosInstance = axios.create();
axiosInstance.defaults.maxRedirects = 10000;

function removeDuplicates(arr) {
    return [...new Set(arr)];
}

async function fetchHTML(url, depth) {

    const { data } = await axiosInstance.get(url, { maxRedirects: 10000} );

    const $ = cheerio.load(data);
    const links = $("a")
    const images = $("img")
    let arr = [];

    links.each((index, value) => {
        let link = $(value).attr("href");
        //let bgImg = $.attr("style")
        //console.log(bgImg)
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
    let filterArr = removeDuplicates(arr);
    for (let key in filterArr) {
        try {
            if (depth > 0) {
                console.log(arr[key])
                await fetchHTML(arr[key], depth - 1)
            }
        } catch (error) {
            console.log(error)
            await fetchHTML(arr[+key+1], depth - 1)
        }
    }

}

async function asyncCall(link, depth) {
    try {
        await fetchHTML(link, parseInt(depth))
        fs.writeFile("result.json", JSON.stringify(resultArr, null, 4), function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
    } catch (error) {
        console.error(error);
    }


}
asyncCall(process.argv[2], process.argv[3])


