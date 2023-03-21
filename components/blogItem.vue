<template>
	<view class="box">
		<!-- 右上角的... -->
		<view class="list" @click="actionList">
			<u-icon name="more-dot-fill" size="25"></u-icon>
		</view>
		<view class="u-page">
			<view class="u-demo-block">
				<view class="u-demo-block__content">
					<view class="album">



						<!-- 头像 -->
						<view>
							<u-avatar
								:src="blogInfo.user_id[0].avatar_file ? blogInfo.user_id[0].avatar_file.url : '@/static/no_avatar.png'"
								mode="aspectFill">
							</u-avatar>
						</view>


						<view class="album__content">



							<!-- 昵称 -->
							<u--text
								:text="blogInfo.user_id[0].nickname ? blogInfo.user_id[0].nickname:blogInfo.user_id[0].username"
								type="primary"></u--text>
							<!-- 发布时间 -->
							<view class="postTime">
								发布于：<uni-dateformat :date="blogInfo.last_modify_date" :threshold="[0,7200000]">
								</uni-dateformat>
							</view>

							<!-- 标题 -->
							<view class="title" @click="goDetail">
								<u--text margin="0 0 8px 0" :text="blogInfo.title"></u--text>
							</view>

							<view class="content" @click="goDetail">
								<u--text margin="0 0 8px 0" :text="blogInfo.content"></u--text>
							</view>

							<!-- 九宫格 -->
							<view class="pic">
								<u-album :urls="blogInfo.imgSrc"></u-album>
							</view>
							<text class="add">
								<span class="iconfont">&#xe7e4;</span>
								<text class="ipAdd">
									{{blogInfo.ipInfo.province}}-{{blogInfo.ipInfo.city}}
								</text>
							</text>
							<view class="count">
								<!-- <view class="commentCount">
									<span class="iconfont">&#xe730;</span>
									<text class="countNum">{{blogInfo.comment_count}}</text>
								</view> -->
								<view class="viewCount">
									<span class="iconfont">&#xe746;</span>
									<text class="countNum">{{blogInfo.view_count}}次浏览</text>
								</view>
								<!-- <view class="likeCount" @click="like" :class="LikeStatus ? 'active' : '' ">
									<span class="iconfont">&#xe7be;</span>
									<text class="countNum">{{blogInfo.like_count}}</text>
								</view> -->
							</view>
						</view>
					</view>
				</view>
			</view>

		</view>

		<u-action-sheet :actions="alist" :closeOnClickOverlay="true" :closeOnClickAction="true" :show="ashow"
			@close="aclose" cancelText="取消" @select="selected"></u-action-sheet>
	</view>

</template>

<script>
	import {
		store,
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database()
	export default {
		name: "blogItem",
		data() {
			return {
				LikeStatus: false,
				albumWidth: 0,
				alist: [{
						name: '删除',
						color: "#FE0000",
						disabled: true,
						method: "del"
					},
					{
						name: '分享'
					}
				],
				ashow: false

			};
		},
		props: ["blogInfo"],

		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin() {
				return store.hasLogin
			},
		},

		methods: {
			like() {
				if (!store.hasLogin) {
					uni.showToast({
						icon: "none",
						title: "请先登录"
					})
				}
			},
			aclose() {
				this.ashow = false
			},
			actionList() {
				// console.log("&&&",this.blogInfo);
				let uid = uniCloud.getCurrentUserInfo().uid
				if (uid == this.blogInfo.user_id[0]._id || this.uniIDHasRole('admin')) {
					this.alist[0].disabled = false
				}
				this.ashow = true
			},
			selected(e) {
				if (e.method == "del") {
					this.del()
				}
			},
			del() {
				uni.showLoading()
				db.collection("blog").doc(this.blogInfo._id).update({
					delState: true
				}).then((res) => {
					uni.hideLoading()
					uni.showToast({
						title: "删除成功",
						icon: "success"
					})
					setTimeout(() => {
							uni.reLaunch({
								url: "/pages/index/index"
							})
						},
						600)

				}).catch((err) => {
					uni.hideLoading()
					uni.showToast({
						title: `${err}`,
						icon: "error"
					})
				})
			},
			goDetail() {
				uni.navigateTo({
					url: `/pages/Detail/Detail?id=${this.blogInfo._id}`,
				})
			}
		}
	}
</script>

<style lang="scss">
	.box {
		position: relative;
		height: auto;
		border-radius: 20rpx;
		background-color: #fff;
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
		top: 40rpx;
	}

	.count {
		// display: flex;
		// justify-content: space-around;
		// align-items: center;
		// padding: 30rpx;

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


	.likeCount,
	.commentCount,
	.viewCount {
		position: relative;
		margin-left: -6rpx;

		.countNum {
			position: absolute;
			top: 6rpx;
			font-size: 28rpx;
		}
	}

	.active {

		.iconfont,
		.countNum {
			color: #0199FE;
		}



	}
</style>
