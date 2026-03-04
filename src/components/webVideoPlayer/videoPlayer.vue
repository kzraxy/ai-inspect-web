<template>
    <div class="web-video-player">
        <video
            class="video-player"
            :src="src"
            :width="width"
            :height="height"
            :autoplay="autoplay"
            :controls="controls"
            :style="`width: ${width}px;height: ${height}px;`">
        </video>
    </div>
</template>

<script>
export default {
    props: {
        src: String,
        width: {
            type: Number,
            default: 856
        },
        height: {
            type: Number,
            default: 460
        },
        autoplay: {
            type: Boolean,
            default: false
        },
        controls: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="scss" scoped>
.web-video-player {
    
}
</style>