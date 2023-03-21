<template>
	<view v-if="ld" class="box">
		<view class="top" @click="goUserInfo">
			<!-- <u-avatar :src="detailInfo.user_id[0].avatar_file.url" class="imgA" size="80"></u-avatar> -->


			<u-avatar v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url" :src="userInfo.avatar_file.url"
				class="imgA" size="80"></u-avatar>
			<u-avatar v-else class="imgA" size="80"></u-avatar>



			<view class="nameA">
				<view class="nickname">
					{{userInfo.nickname||userInfo.username||userInfo.mobile}}
				</view>
				<view v-show="this.hasLogin" class="username">
					账号：{{userInfo.username}}
				</view>
				<view class="nologin" v-show="!this.hasLogin" @click.stop="goLogin">
					<button>还没有登录，点击前往登录页面</button>
				</view>
			</view>
			<view class="r">
				<uni-icons type="forward" size="30"></uni-icons>
			</view>

			<!-- bg -->
			<view class="bg">
				<image v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url" :src="userInfo.avatar_file.url"
					mode="aspectFill"></image>
				<image v-else src="@/static/noa.png" mode="aspectFill"></image>
			</view>
			<!-- bg -->
		</view>

		<view class="lists">

			<view class="list1">
				<view class="item" @click="goPubList">
					<span class="iconfont">&#xe782;</span><text class="itemtxt">我发布的</text>
				</view>
				<view class="item" @click="goLikeList">
					<span class="iconfont">&#xe7be;</span><text class="itemtxt">我的点赞</text>
				</view>
				<view class="item">
					<span class="iconfont">&#xe78e;</span><text class="itemtxt">我浏览过的</text>
				</view>
			</view>

			<view class="list2">
				<view class="item" @click="goFeedBack">
					<span class="iconfont">&#xe730;</span><text class="itemtxt">意见反馈</text>
				</view>
				<view class="item">
					<span class="iconfont">&#xe793;</span><text class="itemtxt">关于</text>
				</view>
			</view>

			<view class="list3">
				<view class="item">
					<span class="iconfont">&#xe7bf;</span><text class="itemtxt">设置</text>
				</view>
				<view class="item" @click="logOut" v-show="this.hasLogin">
					<span class="iconfont">&#xe791;</span><text class="itemtxt">退出登录</text>
				</view>
				<view class="item" @click="goManner" v-show="uniIDHasRole('admin')">
					<span class="iconfont">&#xe73d;</span><text class="itemtxt">管理员模块</text>
				</view>
			</view>

		</view>


		<button @click="goLogin" class="logbtn" v-show="!this.hasLogin">登录</button>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	let db = uniCloud.database()
	export default {
		data() {
			return {
				detailInfo: [],
				ld: false,
				show : false
			};
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin() {
				return store.hasLogin
			},
		},
		onLoad() {
			this.getInfo()
		},
		methods: {
			ss(){
				this.show = true
			},
			goManner(){
				uni.navigateTo({
					url:"/uni_modules/uni-feedback/pages/opendb-feedback/list"
				})
			},
			goFeedBack(){
				if (store.hasLogin) {
					uni.navigateTo({
						url: "/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback"
					})
				} else {
					uni.showToast({
						icon: "none",
						title: "请先登录"
					})
				}
			},
			goLikeList() {
				if (store.hasLogin) {
					uni.navigateTo({
						url: "/pages/blog_like/list"
					})
				} else {
					uni.showToast({
						icon: "none",
						title: "请先登录"
					})
				}
			},
			goPubList() {
				if (store.hasLogin) {
					uni.navigateTo({
						url: "/pages/blog/list"
					})
				} else {
					uni.showToast({
						icon: "none",
						title: "请先登录"
					})
				}

			},
			getInfo() {
				let blogTemp = db.collection("blog").getTemp()
				let userTemp = db.collection("uni-id-users").field("_id,username,nickname,avatar_file").getTemp()
				// let likeTemp = db.collection("blog_like").getTemp()

				db.collection(blogTemp, userTemp).get()
					.then((res) => {
						//判断参数是否有误
						if (!this.detailInfo) {
							this.parmsErr()
							return
						}
						this.detailInfo = res.result.data[0]
						console.log(this.detailInfo);
						this.ld = true
					}).catch((err) => {
						console.log(err.code); // 打印错误码
						console.log(err.message); // 打印错误内容
					})
			},
			goUserInfo() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
				})
			},

			goLogin() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/login/login-withpwd"
				})
			},
			logOut() {
				if (!this.hasLogin) {
					uni.showToast({
						icon: 'none',
						title: "还未登录"
					})
					return
				}
				uni.showModal({
					title: "确定要退出当前账号吗？",
					success: (res) => {
						if (res.confirm) {
							mutations.logout()
						}
					}
				})

			},

		}
	}
</script>

<style lang="scss">
	* {
		box-sizing: border-box;
	}


	.top {
		position: relative;
		height: 400rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;

		.imgA {
			z-index: 10;
		}

		.nameA {
			margin-left: 30rpx;
			z-index: 10;
		}

		.username {
			// color: #777;
			z-index: 10;
		}

		.r {
			position: absolute;
			right: 30rpx;
			z-index: 10;
		}

		//透明背景
		.bg {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
				opacity: 0.8;
				filter: blur(10px);
				transform: scale(1.5);
			}
		}
	}

	.nologin {
		button {
			font-size: 30rpx;
		}

	}

	.lists {
		transform: translateY(-30rpx);
		border-radius: 35rpx 35rpx 0 0;
		height: 900rpx;
		background-color: #F6F7F8;
		padding-left: 10rpx;

		.list1 {
			margin-bottom: 10rpx;
			height: 380rpx;
			// padding-top: 30rpx;
		}

		.list2 {
			margin-bottom: 10rpx;
			height: 260rpx;
		}

		.list3 {
			height: 100%;
		}

		.list1,
		.list2,
		.list3 {
			padding: 20rpx;
			padding-top: 30rpx;
			border-radius: 35rpx;
			// border: #ccc solid 1rpx;
			background-color: #fff;
		}



		.item {
			height: 120rpx;
			line-height: 80rpx;
			position: relative;
		}
	}

	.itemtxt {
		height: 120rpx;
		line-height: 80rpx;
		position: absolute;
		left: 90rpx;
	}

	.logbtn {
		margin-top: 30rpx;
		width: 40%;
	}
</style>
