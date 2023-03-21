<template>
	<view class="outbox">
		<u-skeleton rows="10" title :loading="!ld"></u-skeleton>
		<view class="box" v-if="ld">
			<view class="list">
				<u-icon name="more-dot-fill" size="25"></u-icon>
			</view>
			<view class="u-page">
				<view class="u-demo-block">
					<view class="u-demo-block__content">
						<view class="album">
							<view>
								<u-avatar
									:src="detailInfo.user_id[0].avatar_file ? detailInfo.user_id[0].avatar_file.url : '@/static/no_avatar.png'"
									mode="aspectFill">
								</u-avatar>
							</view>
							<view class="album__content">

								<u--text
									:text="detailInfo.user_id[0].nickname ? detailInfo.user_id[0].nickname:detailInfo.user_id[0].username"
									type="primary">
								</u--text>

								<view class="postTime">
									发布于：<uni-dateformat :date="detailInfo.last_modify_date" :threshold="[0,7200000]">
									</uni-dateformat>
								</view>

								<view class="title">
									<u--text margin="0 0 8px 0" :text="detailInfo.title"></u--text>
								</view>
								<view class="content">
									<u--text margin="0 0 8px 0" :text="detailInfo.content"></u--text>
								</view>

								<view class="pic">
									<u-album :urls="detailInfo.imgSrc"></u-album>
								</view>
								<text class="add">
									<span class="iconfont">&#xe7e4;</span>
									<text class="ipAdd">
										{{detailInfo.ipInfo.province}}-{{detailInfo.ipInfo.city}}
									</text>
								</text>
							</view>

						</view>
					</view>
				</view>
			</view>
		</view>

		<button class="btn" v-if="ld" @click="clickLike" :class="LikeStatus ? 'active' : '' ">
			<span class="iconfont">&#xe7be; {{detailInfo.like_count}}</span>
		</button>

	</view>
</template>

<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'

	const db = uniCloud.database()
	const utilsObj = uniCloud.importObject("utilsObj", {
		customUI: true
	});
	export default {
		onLoad(e) {
			if (!e.id) {
				this.parmsErr()
				return
			}
			this.id = e.id
			this.getInfo()
			this.viewCountUpdata()
		},
		data() {
			return {
				detailInfo: [],
				id: "",
				ld: false,
				LikeStatus: false
			};
		},
		methods: {
			viewCountUpdata() {
				utilsObj.operation("blog", "view_count", this.id, 1).then(res => {
					console.log(res);
				})
			},
			parmsErr() {
				uni.showToast({
					title: '参数错误',
					icon: 'error'
				});
				setTimeout((res) => {
					uni.reLaunch({
						url: "/pages/index/index"
					})
				}, 1500)
			},
			getInfo() {
				let blogTemp = db.collection("blog").getTemp()
				let userTemp = db.collection("uni-id-users").field("_id,username,nickname,avatar_file").getTemp()

				let tempArr = [blogTemp, userTemp]


				db.collection(...tempArr)
					.where({
						_id : this.id //传统MongoDB写法，不是jql写法。实际开发中推荐使用jql写法
					}).get()
					.then((res) => {
						console.log(res);
						//判断参数是否有误
						if (!this.detailInfo) {
							this.parmsErr()
							return
						}
						this.detailInfo = res.result.data[0]
						this.ld = true
						uni.setNavigationBarTitle({
							title: this.detailInfo.title
						})
					}).catch((err) => {
						console.log(err.code); // 打印错误码
						console.log(err.message); // 打印错误内容
					})
				db.collection("blog_like").where(`blog_id == "${this.id}" && user_id == $cloudEnv_uid`).get().then((
					res) => {
					let likedUsers = res.result.data
					console.log("likeUsers:", likedUsers);
					if (likedUsers.length >= 1) {
						this.LikeStatus = true
						console.log("like");
					} else {
						console.log("dislike");
					}
				})
			},

			async clickLike() {
				if (store.hasLogin) {
					let time = Date.now();
					if (time - this.likeTime < 300) {
						uni.showToast({
							title: "点的太快啦！",
							icon: "none"
						})
						return;
					}
					this.LikeStatus ? this.detailInfo.like_count-- : this.detailInfo.like_count++;
					this.LikeStatus = !this.LikeStatus
					this.likeTime = time
					this.likeFun()
				} else {
					uni.showToast({
						icon: "none",
						title: "请先登录"
					})
				}
			},
			async likeFun() {
				let count = await db.collection("blog_like")
					.where(`blog_id == "${this.id}" && user_id == $cloudEnv_uid`).count()

				if (count.result.total) {
					db.collection("blog_like").where(`blog_id == "${this.id}" && user_id == $cloudEnv_uid`).remove()
					utilsObj.operation("blog", "like_count", this.id, -1).then(res => {})
				} else {
					db.collection("blog_like").add({
						blog_id: this.id
					})
					utilsObj.operation("blog", "like_count", this.id, 1).then(res => {})
				}
			},
		}
	}
</script>

<style lang="scss">
	.box {
		position: relative;
		height: auto;
		border-radius: 20rpx;
		background-color: #fff;
		padding: 30rpx 0;
	}

	// copy
	.u-page {
		padding: 20rpx
	}

	.album {
		@include flex;
		align-items: flex-start;

		&__avatar {
			background-color: $u-bg-color;
			padding: 5px;
			border-radius: 3px;
		}

		&__content {
			margin-left: 10px;
			flex: 1;
		}
	}

	.postTime {
		font-size: 25rpx;
		color: #999;
	}

	.list {
		position: absolute;
		right: 50rpx;
		top: rpx;
	}

	.count {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 30rpx;

		text {
			color: #999;
		}

		.iconfont {
			font-size: 45rpx;
			color: #999;
		}
	}

	.title {
		margin-top: 20rpx;
		max-width: 500rpx;
		overflow: hidden;
	}

	.add {

		.iconfont {
			color: #999;
			font-size: 30rpx;
		}

		.ipAdd {
			color: #999;
			font-size: 30rpx;
		}
	}

	.content {
		max-width: 500rpx;
		overflow: hidden;
	}

	.pic {
		margin-bottom: 30rpx;
	}

	.btn {
		margin-top: 30rpx;
		width: 300rpx;
		height: 130rpx;
		border: #888 solid 3rpx;
		border-radius: 40rpx;

		.iconfont {
			font-size: 50rpx;
			color: #888;
		}
	}

	.active {
		background-color: #0199FE;

		.iconfont {
			color: #fff;
		}
	}
</style>
