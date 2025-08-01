const axios = require('axios');

async function tiktok(url) {
    return new Promise(async (resolve) => {
        try {
            function formatNumber(integer) {
                let numb = parseInt(integer);
                return Number(numb).toLocaleString().replace(/,/g, ".");
            }

            function formatDate(n, locale = "id") {
                let d = new Date(n * 1000);
                return d.toLocaleDateString(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric"
                });
            }

            const domain = "https://www.tikwm.com/api/";
            const res = await (
                await axios.post(
                    domain, {},
                    {
                        headers: {
                            Accept: "application/json, text/javascript, */*; q=0.01",
                            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            Origin: "https://www.tikwm.com",
                            Referer: "https://www.tikwm.com/",
                            "Sec-Ch-Ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
                            "Sec-Ch-Ua-Mobile": "?1",
                            "Sec-Ch-Ua-Platform": "Android",
                            "Sec-Fetch-Dest": "empty",
                            "Sec-Fetch-Mode": "cors",
                            "Sec-Fetch-Site": "same-origin",
                            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        params: {
                            url: url,
                            count: 12,
                            cursor: 0,
                            web: 1,
                            hd: 1
                        }
                    }
                )
            ).data.data;

            if (!res.play) return resolve({ status: false });

            const data = !res.size
                ? res.images.map((v) => ({ type: "photo", url: v }))
                : [
                    { type: "watermark", url: "https://www.tikwm.com" + res.wmplay },
                    { type: "nowatermark", url: "https://www.tikwm.com" + res.play },
                    { type: "nowatermark_hd", url: "https://www.tikwm.com" + res.hdplay }
                ];

            const json = {
                status: true,
                title: res.title,
                taken_at: formatDate(res.create_time),
                region: res.region,
                id: res.id,
                duration: res.duration + " detik",
                cover: "https://www.tikwm.com" + res.cover,
                data: data,
                music_info: {
                    id: res.music_info.id,
                    title: res.music_info.title,
                    author: res.music_info.author,
                    album: res.music_info.album || "Tidak diketahui",
                    url: "https://www.tikwm.com" + (res.music || res.music_info.play)
                },
                stats: {
                    views: formatNumber(res.play_count),
                    likes: formatNumber(res.digg_count),
                    comment: formatNumber(res.comment_count),
                    share: formatNumber(res.share_count),
                    download: formatNumber(res.download_count)
                },
                author: {
                    id: res.author.id,
                    fullname: res.author.unique_id,
                    nickname: res.author.nickname,
                    avatar: "https://www.tikwm.com" + res.author.avatar
                }
            };

            return resolve(json);
        } catch (e) {
            console.log(e);
            return resolve({ status: false, msg: e.message });
        }
    });
}

module.exports = function(app) {
    app.get('/downloader/tiktok', async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'URL is required' });

        const result = await tiktok(url);
        if (!result.status) return res.status(500).json(result);

        res.status(200).json(result);
    });
};
