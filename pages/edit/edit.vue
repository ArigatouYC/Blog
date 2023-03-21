<template>
	<view class="box">
		<view class="titleInput">
			<input type="text" placeholder="输入标题" placeholder-class="placeholder-class" v-model="blogContent.title">
		</view>

		<view class="contentInput">
			<editor placeholder="正文" id="editor" @ready="onEditorReady" @click="onSubmit"></editor>
		</view>

		<view class="toolsAndSubmit">
			<view class="tools">
				<view class="tool" @click="handleBold">
					<text :class="isActive.bold ? 'active':'' "><span class="iconfont">&#xe613;</span></text>
				</view>

				<view class="tool" @click="handleItalic">
					<text :class="isActive.italic ? 'active':'' "><span class="iconfont">&#xe614;</span></text>
				</view>

				<view class="tool" @click="handleUnderline">
					<text :class="isActive.underline ? 'active':'' "><span class="iconfont">&#xe615;</span></text>
				</view>

				<view class="tool" @click="addImage">
					<text><span class="iconfont">&#xe629;</span></text>
				</view>

				<view class="tool" @click="insertDivider"><text><span class="iconfont">&#xe620;</span></text></view>
			</view>

			<view class="submitbtn">
				<button type="primary" :disabled="!blogContent.title.length" @click="upload">发布</button>
			</view>
		</view>

	</view>

</template>

<script>
	import {
		getImgSrc,
		getAddByIP
	} from "@/utils/tools.js"
	const db = uniCloud.database()
	export default {
		data() {
			return {
				isActive: {
					bold: false,
					italic: false,
					underline: false,
				},
				blogContent: {
					title: "",
					content: "",
					imgSrc: "",
					ipInfo: {
						province: "",
						city: ""
					}
				},
				description: "",

			};
		},
		onLoad() {
			getAddByIP().then((res) => {
				this.blogContent.ipInfo.province = res.data.province
				this.blogContent.ipInfo.city = res.data.city
			})
		},
		// computed:{
		// 	ipAddress(){
		// 		return this.ipInfo.province +'-'+this.ipInfo.city
		// 	}
		// },
		methods: {
			onSubmit() {
				this.editorCtx.getContents({
					success: (res) => {
						this.description = res.text.slice(0, 80)
						// this.blogContent.content = res.html
					}
				})
			},

			//editor 组件对应的 editorContext 实例，可通过 uni.createSelectorQuery 获取。
			onEditorReady() {
				uni.createSelectorQuery().in(this).select('#editor').fields({
					size: true,
					context: true
				}, res => {
					console.log(res);
					this.editorCtx = res.context
				}).exec()
			},

			//添加一条分割线
			insertDivider() {
				this.editorCtx.insertDivider()
			},
			handleBold() {
				this.isActive.bold = !this.isActive.bold
				this.editorCtx.format("bold")
			},
			handleItalic() {
				this.isActive.italic = !this.isActive.italic
				this.editorCtx.format("italic")
			},
			handleUnderline() {
				this.isActive.underline = !this.isActive.underline
				this.editorCtx.format("underline")

			},
			addImage() {



				uni.chooseImage({
					success: async (res) => {

						uni.showLoading({
							title: "Loading...",
							mask: true
						})
						for (let item of res.tempFiles) {
							let res = await uniCloud.uploadFile({
								filePath: item.path,
								cloudPath: item.name,
							})
							console.log(res);
							this.editorCtx.insertImage({
								src: res.fileID

							})
						}
						uni.hideLoading()
					}
				})
			},
			upload() {
				this.editorCtx.getContents({
					success: (res) => {
						// console.log(res);
						this.blogContent.content = res.delta.ops[0].insert;
						this.blogContent.imgSrc = getImgSrc(res.html);
						console.log(this.blogContent);
						uni.showLoading({
							title: "Loading..."
						})
						this.addData()
					}
				})
			},
			addData() {

				if (!this.description) {
					uni.showToast({
						icon:"none",
						title: "请输入内容哦"
					})
					return

				} else {
					db.collection('blog').add({
						...this.blogContent
					}).then((res) => {
						uni.hideLoading();
						uni.showToast({
							title: "发布成功"
						})
						setTimeout(() => {
							uni.reLaunch({
								url: "/pages/index/index"
							})
						}, 800)

					})

				}



			}

		}

	}
</script>

<style lang="scss">
	.box {
		padding: 20rpx;

		.titleInput {
			padding: 30rpx;
			border: 3rpx #0199FE solid;
			border-radius: 20rpx;

			.placeholder-class {
				font-size: 40rpx;
			}
		}

		.contentInput {
			height: 800rpx;
			border-radius: 20rpx;
			margin-top: 30rpx;
			padding: 30rpx;
			border: 3rpx #0199FE solid;

			#editor {
				height: 800rpx;
				margin-bottom: 30rpx;
				// overflow: auto;

			}
		}
	}

	.toolsAndSubmit {
		position: fixed;
		width: 95%;
		bottom: 30rpx;

		.tools {
			display: flex;
			justify-content: space-around;
			align-items: center;
			margin-bottom: 20rpx;

			.iconfont {
				font-size: 50rpx;
			}
		}

		.active {
			color: #0199FE;
		}
	}
</style>
