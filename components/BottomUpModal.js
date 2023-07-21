import { View, Animated, TouchableWithoutFeedback, Modal, Dimensions, Keyboard } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../constants/theme";

const BottomUpModal = ({ isVisible, onClose, children, visibleHeight }) => {
    const [visibleScreenHeight, setVisibleScreenHeight] = useState(Dimensions.get('window').height);
    const modalAnimatedValue = useRef(new Animated.Value(0)).current;

    const [matterSelectModal, setMatterSelectModal] = useState(isVisible);

    useEffect(() => {
        if (matterSelectModal) {
            Animated.timing(modalAnimatedValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(modalAnimatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => onClose());
        }
    }, [matterSelectModal]);

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        const screenHeight = Dimensions.get('window').height;
        const keyboardHeight = e.endCoordinates.height;
        const screenVisibleHeight = screenHeight - keyboardHeight;
        setVisibleScreenHeight(screenVisibleHeight);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        const screenHeight = Dimensions.get('window').height;
        setVisibleScreenHeight(screenHeight);
    });

    useEffect(() => {
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);


    const modalY = modalAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [visibleScreenHeight, visibleScreenHeight - visibleHeight],
    });

    return (
        <Modal avoidKeyboard={false} animationType="slide" transparent={true} visible={isVisible}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", }}>
                {/* Transparent background */}
                <TouchableWithoutFeedback onPress={() => setMatterSelectModal(false)}>
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
                </TouchableWithoutFeedback>

                <Animated.View style={{ position: "absolute", top: modalY, left: 0, width: "100%", height: "100%", padding: 24, borderTopRightRadius: 12, borderTopLeftRadius: 12, backgroundColor: COLORS.gray }}>
                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
};

export default BottomUpModal;