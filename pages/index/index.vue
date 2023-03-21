<template>
	<view class="content">

		<view class="notify">
			<u-notify ref="uNotify"></u-notify>
		</view>


		<!-- 顶部导航 -->
		<u-tabs :list="list" @click="switchNav" :activeStyle="{
			color: '#303133',
			fontWeight: 'bold',
			transform: 'scale(1.05)',
		}" :inactiveStyle="{
			color: '#606266',
			transform: 'scale(1)'
		}">
		</u-tabs>
		<!-- 顶部导航 -->

		<!-- 骨架屏 -->
		<view class="skeleton" v-show="loadingStatus">
			<u-skeleton rows="3" title loading></u-skeleton>
		</view>
		<!-- 骨架屏 -->

		<!-- 新增按钮 -->
		<view class="create_a_item" @click="goEdit">
			<span class="iconfont">&#xe782;</span>
		</view>
		<!-- 新增按钮 -->

		<!-- BlogItem组件 -->
		<view class="blogItem" v-for="item in blogInfo">
			<BlogItem :blogInfo="item"></BlogItem>
		</view>
		<!-- BlogItem组件 -->

	</view>
</template>

<script>
	const db = uniCloud.database()
	const dbCmd = db.command
	import BlogItem from "../../components/blogItem.vue"
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	export default {

		data() {
			return {
				list: [{
						name: '热门',
						sort: "view_count"
					},
					{
						name: '最新',
						sort: "publish_date",
						badge: {
							isDot: true
						}
					},
				],
				title: "cym",
				listSortIndex: 0,
				loadingStatus: true,
				blogInfo: [],
			}
		},
		components: {
			BlogItem
		},

		onLoad() {
			this.getData()
		},
		onPullDownRefresh() {
			uni.startPullDownRefresh();
			this.getData()
		},
		methods: {
			getData() {
				let blogTemp = db.collection("blog").where(`delState != true`).getTemp()
				let userTemp = db.collection("uni-id-users").field("_id,username,nickname,avatar_file").getTemp()
				db.collection(blogTemp, userTemp).orderBy(this.list[this.listSortIndex].sort, "desc").get()
				.then( res => {
						this.blogInfo = res.result.data
						console.log("@@@", this.blogInfo[0].user_id[0]);
						this.loadingStatus = false
						uni.stopPullDownRefresh();
						this.notify()
					})
			},
			switchNav(e) {
				console.log(e);
				this.listSortIndex = e.index;
				this.getData();
			},
			goEdit() {
				if(!store.hasLogin){
					uni.showToast({
						icon:"none",
						title:"请先登录"
					})
					
				}else{
				uni.navigateTo({
					url: "/pages/edit/edit"
				})					
				}

			},

			notify() {
				this.$refs.uNotify.show({
					top: 90,
					type: 'success',
					color: '#fff',
					bgColor: '#3C9CFF',
					message: '数据已刷新',
					duration: 1000,
					fontSize: 16,
					safeAreaInsetTop: true,
				})
			}
		}
	}
</script>

<style lang="scss">
	.skeleton {
		padding: 25rpx;
	}

	.create_a_item {
		position: fixed;
		bottom: 280rpx;
		right: 35rpx;
		width: 130rpx;
		height: 130rpx;
		z-index: 5;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #0199FE;
		box-shadow:
			22.8px 19.7px 10px rgba(0, 0, 0, 0.035),
			73px 63px 80px rgba(0, 0, 0, 0.07);

		.iconfont {
			font-size: 60rpx;
			color: #fff;
		}
	}

	.blogItem {
		padding: 10rpx 20rpx;
	}
	
</style>
