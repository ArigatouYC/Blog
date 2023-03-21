<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {

		},
		onHide: function() {

		}
	}
</script>


<style lang="scss">
	/*每个页面公共css */
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
	@import "@/static/fonts/iconfont.css";

	body {
		background-color: #F6F7F8;
	}
</style>
