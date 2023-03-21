export function getImgSrc(richtext) {
	let imgList = [];
	richtext.replace(/img[^>]*src=['"]([^'"]+)[^>]*>/g, (match, capture) => {
		imgList.push(capture);
	});
	return imgList;
}

export function getAddByIP() {
	return new Promise((resvole, reject) => {
		uni.request({
			url: "https://restapi.amap.com/v3/ip",
			data: {
				key: "8f6cef18e3a4c44188360a38a45c3a88"
			},
			success: (res) => {
				resvole(res)
			},
			fail: (err) => {
				reject(err)
			}
		})
	})

}
