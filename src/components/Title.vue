// Source - https://stackoverflow.com/a/40388120
// Posted by str, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-26, License - CC BY-SA 4.0

<script>
    export default {
        name: 'vue-title',
        props: ['title'],
        watch: {
            title: {
                immediate: true,
                handler() {
                    document.title = this.title;
                }
            }
        },
        render () {
        },
    }
</script>
