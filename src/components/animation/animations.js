import {slideLeftReturn, slideRightReturn, spaceOutRight, swap} from "react-magic";
import {StyleSheet, css} from 'aphrodite';

const styleSheet = StyleSheet.create({
    swap: {
        animationName: swap,
        animationDuration: '0.4s'
    },
    spaceOutRight: {
        animationName: spaceOutRight,
        animationDuration: '0.4s'
    },
    slideRightReturn: {
        animationName: slideRightReturn,
        animationDuration: '0.4s'
    },
    slideLeftReturn: {
        animationName: slideLeftReturn,
        animationDuration: '0.4s'
    },
});

// 引入多个 css 使用逗号隔开
const animations = {
    swap: css(styleSheet.swap),
    spaceOutRight: css(styleSheet.spaceOutRight),
    slideRightReturn: css(styleSheet.slideRightReturn),
    slideLeftReturn: css(styleSheet.slideLeftReturn),
};

export {animations}