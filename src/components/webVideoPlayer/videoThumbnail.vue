<template>
    <div class="video-thumbnail" @click="handleClick" :style="`width:${width}px;height:${height}px;`">
        <img :src="imgSrc" alt="" :style="imgSize">
        <div class="video-duration"><span class="video-duration-text">{{formatDuration}}</span></div>
    </div>
</template>

<script>
export default {
    props: {
        src: String,
         width: {
            type: Number,
            default: 72
        },
        height: {
            type: Number,
            default: 72
        },
        duration: Number,
        ms: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        formatDuration(){
            // 后端返回的时间单位是秒
            // let temp = Math.floor(this.duration/1000)
            let temp = this.duration
            if (this.ms) temp = Math.floor(temp / 1000)
            let minute = Math.floor(temp/60)
            let second = temp%60
            return `${minute<10?`0${minute}`:minute}:${second<10?`0${second}`:second}`
        }
    },
    data(){
        return {
            imgSize: '',
            imgSrc: ''
        }
    },
    watch: {
        src() {
            this.refreshImage()
        },
    },
    methods: {
        handleClick(){
            this.$emit('click')
        },
        refreshImage() {
            let img = new Image()
            img.src = this.src
            img.onload = () => {
                this.imgSize = img.width/this.width>img.height/this.height?`width:${this.width}px;height:${this.width*img.height/img.width}px;`: `width:${this.height*img.width/img.height}px;height:${this.height}px;`
                this.imgSrc = this.src
            }
        }
    },
    created(){
        this.refreshImage()
    }
}
</script>

<style lang="scss" scoped>
.video-thumbnail {
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background: black;
    .video-duration {
        width: 100%;
        opacity: 0.7;
        background: #000000;
        position: absolute;
        left: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        &-text {
            white-space: nowrap;
            font-family: MicrosoftYaHeiUI;
            font-size: 12px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            line-height: 20px;
            font-weight: 400;
        }
    }
}
</style>
