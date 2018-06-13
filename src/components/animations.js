import {swap} from "react-magic";
import {StyleSheet, css} from 'aphrodite';

const styleSheet = StyleSheet.create({
    swap: {
        animationName: swap,
        animationDuration: '0.4s'
    },
});

const animations = {
    swap: css(styleSheet.swap)
};

export {animations}