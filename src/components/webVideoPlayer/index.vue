<template>
    <div class="web-video-player">
        <div class="picture-wrap" @click="visible=true">
            <img :src="imgSrc" alt="" :width="imgWidth" :height="imgHeight">
            <div class="video-duration">{{duration}}</div>
        </div>
        
        <div class="video-wrap" v-if="visible">
            <video
                class="video-player"
                :src="videoSrc"
                :width="videoWidth"
                :height="videoHeight"
                :autoplay="autoplay"
                :controls="controls">
            </video>
            <img src="@/assets/image/inspect/ic_close.svg" class="icon-close" @click="visible=false">
        </div>
    </div>
</template>

<script>
export default {
    props: {
        imgSrc: String,
         imgWidth: {
            type: Number,
            default: 72
        },
        imgHeight: {
            type: Number,
            default: 72
        },
        duration: String,
        videoSrc: String,
        videoWidth: {
            type: Number|String,
            default: '80%'
        },
        videoHeight: {
            type: Number|String,
            default: '80%'
        },
        autoplay: {
            type: Boolean,
            default: false
        },
        controls: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return {
            visible: false
        }
    }
}
</script>

<style lang="scss" scoped>
.web-video-player {
    .picture-wrap {
        position: relative;
        cursor: pointer;
        .video-duration {
            background: white;
            color: black;
            position: absolute;
            left: 50%;
            bottom: 10%;
            transform: translate(-50%);
        }
    }
    .video-wrap {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0,0,0,.55);
        z-index: 9999;
        .video-player {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .icon-close {
            cursor: pointer;
            position: absolute;
            top: 10%;
            right: 10%;
        }
    }
}
</style>