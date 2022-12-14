import React from 'react';
import { View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { TopviewGetInstance } from '../Topview';
import { FadeAnimated } from '../../common/animations';
import modalStyles from './styles';
import variables from '../../common/styles/variables';
export { modalStyles };
const window = Dimensions.get('window');
export class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.handlePressBackdrop = () => {
            if (this.props.cancelable) {
                this.close('backdrop').catch(e => {
                    return null;
                });
            }
        };
        this.handleLayout = (e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            const { animatedTranslateX, animatedTranslateY } = this.props;
            let translateX = null;
            let translateY = null;
            const ret = [];
            if (animatedTranslateX != null) {
                translateX = animatedTranslateX - (width / 2) - x;
                ret.push({
                    key: 'translateX',
                    value: translateX
                });
            }
            if (animatedTranslateY != null) {
                translateY = animatedTranslateY - (height / 2) - y;
                ret.push({
                    key: 'translateY',
                    value: translateY
                });
            }
            this.animated.reset(ret);
        };
        this.state = {};
        this.modalState = {
            topviewId: null,
            opening: false,
            closing: false
        };
        this.init(props, true);
    }
    init(props, syncTag) {
        const tmpState = {
            containerStyle: props.containerStyle,
            style: props.style,
        };
        this.animated = new FadeAnimated({});
        if (syncTag) {
            this.state = {
                ...this.state,
                ...tmpState
            };
        }
        else {
            this.setState({
                ...this.state,
                ...tmpState
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.animatedTranslateX !== this.props.animatedTranslateX ||
            nextProps.animatedTranslateY !== this.props.animatedTranslateY ||
            nextProps.containerStyle !== this.props.containerStyle ||
            nextProps.style !== this.props.style) {
            this.init(nextProps, false);
        }
    }
    componentWillUnmount() {
        this.close().catch(e => {
            return null;
        });
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.modalState.topviewId && TopviewGetInstance()) {
            TopviewGetInstance().replace(this.getContent(), this.modalState.topviewId);
        }
    }
    getContent(inner) {
        const styles = modalStyles;
        const tmp = inner == null ? this.props.children : inner;
        const animatedState = this.animated ? this.animated.getState() : {};
        const { offsetY, offsetX, screenHeight, screenWidth, backdropColor } = this.props;
        const contentWidth = screenWidth - offsetX;
        const contentHeight = screenHeight - offsetY;
        const innerView = (React.createElement(TouchableOpacity, { style: [
                styles.container,
                this.state.containerStyle,
                {
                    minHeight: contentHeight,
                    minWidth: contentWidth,
                    // backgroundColor: 'rgba(1, 2, 110, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                },
            ], activeOpacity: 1, onPress: this.handlePressBackdrop },
            React.createElement(Animated.View, { style: [
                    styles.content,
                    {
                        transform: [
                            { translateX: animatedState.translateX },
                            { translateY: animatedState.translateY }
                        ],
                        opacity: animatedState.opacity
                    },
                    this.state.style,
                ], onLayout: this.handleLayout },
                React.createElement(Animated.View, { style: [
                        {
                            transform: [{ scale: animatedState.scale }],
                        },
                    ] },
                    React.createElement(TouchableOpacity, { activeOpacity: 1 }, tmp || null)))));
        return (React.createElement(View, { style: {
                position: 'absolute',
                top: offsetY,
                left: offsetX,
                width: contentWidth,
                height: contentHeight,
                flexDirection: 'column',
                backgroundColor: backdropColor
            } }, this.renderInnerView(innerView)));
    }
    renderInnerView(innerView) {
        const style = { flex: 1 };
        if (this.props.scrollable) {
            return (React.createElement(ScrollView, { style: style }, innerView));
        }
        else {
            return (React.createElement(View, { style: style }, innerView));
        }
    }
    close(...args) {
        if (this.modalState.closing || this.modalState.topviewId == null) {
            // '????????????'
            return Promise.resolve();
        }
        this.modalState.closing = true;
        this.props.onClose && this.props.onClose(...args);
        return this.animated.toOut().then(() => {
            return TopviewGetInstance().remove(this.modalState.topviewId);
        }).then(() => {
            const id = this.modalState.topviewId;
            this.modalState.closing = false;
            this.modalState.topviewId = null;
            this.props.onClosed && this.props.onClosed(...args);
            return id;
        }).catch((e) => {
            console.log(e);
        });
    }
    open(c, args) {
        if (!TopviewGetInstance()) {
            const msg = 'Topview instance is not existed.';
            console.log(msg);
            return Promise.reject(msg);
        }
        if (this.modalState.opening || this.modalState.topviewId) {
            // '??????????????????'
            return Promise.resolve();
        }
        this.modalState.opening = true;
        this.props.onOpen &&
            this.props.onOpen({
                ...this.modalState
            });
        return TopviewGetInstance()
            .add(this.getContent(c), args)
            .then(id => {
            this.modalState.topviewId = id;
            return this.animated.toIn().then(() => {
                this.modalState.opening = false;
                this.props.onOpened &&
                    this.props.onOpened({
                        ...this.modalState
                    });
                return id;
            });
        });
    }
    render() {
        return null;
    }
}
Modal.defaultProps = {
    cancelable: true,
    scrollable: false,
    backdropColor: variables.mtdFillBackdrop,
    screenWidth: window.width,
    screenHeight: window.height,
    offsetX: 0,
    offsetY: 0,
    animatedTranslateX: null,
    animatedTranslateY: null,
    containerStyle: {},
    style: {},
    onOpen: null,
    onOpened: null,
    onClose: null,
    onClosed: null
};
//# sourceMappingURL=index.js.map