import {swap} from "react-magic";
import {StyleSheet, css} from 'aphrodite';

const styleSheet = StyleSheet.create({
    swap: {
        animationName: swap,
        animationDuration: '0.4s'
    },
});

// 引入多个 css 使用逗号隔开
const animations = {
    swap: css(styleSheet.swap)
};

export {animations}