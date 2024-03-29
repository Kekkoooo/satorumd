const ytdl = require('ytdl-core');
const yts = require('yt-search');
const axios = require('axios');
const { color, bgcolor } = require('./color')

function INFOLOG(info) {
    return console.log('\x1b[1;34m~\x1b[1;37m>>', '[\x1b[1;33mINF\x1b[1;37m]', time, color(info))
}

function tamanhodasbytes(bytes) {
    return new Promise((resolve, reject) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        if (i === 0) resolve(`${bytes} ${sizes[i]}`);
        resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
    });
  };

function ytMp4(url) {
    return new Promise(async(resolve, reject) => {
        ytdl.getInfo(url).then(async(getUrl) => {
            let result = [];
            for(let i = 0; i < getUrl.formats.length; i++) {
                let item = getUrl.formats[i];
                if (item.container == 'mp4' && item.hasVideo == true && item.hasAudio == true) {
                    let { qualityLabel, contentLength } = item;
                    let bytes = await tamanhodasbytes(contentLength);
                    result[i] = {
                        video: item.url,
                        quality: qualityLabel,
                        size: bytes
                    };
                };
            };
            let resultFix = result.filter(x => x.video != undefined && x.size != undefined && x.quality != undefined) 
            let tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`);
            let tinyUrl = tiny.data;
            let title = getUrl.videoDetails.title;
            let desc = getUrl.videoDetails.description;
            let views = getUrl.videoDetails.viewCount;
            let likes = getUrl.videoDetails.likes;
            let dislike = getUrl.videoDetails.dislikes;
            let channel = getUrl.videoDetails.ownerChannelName;
            let uploadDate = getUrl.videoDetails.uploadDate;
            let thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
            resolve({
                título: title,
                link: tinyUrl,
                qualidade: resultFix[0].quality,
                tamanho: resultFix[0].size,
                capa: thumb,
                visualizações: views,
                likes,
                deslikes: dislike,
                canal: channel,
                data_de_upload: uploadDate,
                descrição: desc
            });
        }).catch(reject);
    });
};

function ytMp3(url) {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(url).then(async(getUrl) => {
            let result = [];
            for(let i = 0; i < getUrl.formats.length; i++) {
                let item = getUrl.formats[i];
                if (item.mimeType == 'audio/webm; codecs=\"opus\"') {
                    let { contentLength } = item;
                    let bytes = await tamanhodasbytes(contentLength);
                    result[i] = {
                        audio: item.url,
                        size: bytes
                    };
                };
            };
            let resultFix = result.filter(x => x.audio != undefined && x.size != undefined) 
            let tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`);
            let tinyUrl = tiny.data;
            let title = getUrl.videoDetails.title;
            let desc = getUrl.videoDetails.description;
            let views = getUrl.videoDetails.viewCount;
            let likes = getUrl.videoDetails.likes;
            let dislike = getUrl.videoDetails.dislikes;
            let channel = getUrl.videoDetails.ownerChannelName;
            let uploadDate = getUrl.videoDetails.uploadDate;
            let thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
            resolve({
                título: title,
                resultado: tinyUrl,
                tamanho: resultFix[0].size,
                capa: thumb,
                visualizações: views,
                likes,
                deslikes: dislike,
                canal: channel,
                data_de_upload: uploadDate,
                descrição: desc
            });
            INFOLOG(desc)
        }).catch(reject);
    });
}

function ytPlay(query) {
    return new Promise((resolve, reject) => {
        yts(query).then(async(getData) => {
            let resultado = getData.videos.slice( 0, 5 );
            let url = [];
            for (let i = 0; i < resultado.length; i++) {
                url.push(resultado[i].url);
            }
            let random = url[Math.floor(Math.random() * url.length)];
            let getAudio = await ytMp3(random);
            resolve(getAudio);
        }).catch(reject);
    });
};

module.exports = { ytMp4, ytMp3, ytPlay };